var SerialPort = require('serialport');
var yargs = require('yargs');
var elasticsearch = require('elasticsearch');

// Log Message Types
var NETWORK_MAP = 0;
var RECEIVED_MSG = 1;


// Command Arguments
var argv = yargs
    .usage('Usage: $0 -port [str] -baud [num] -server [str]')
    .default('port', '/dev/ttyUSB0')
    .default('baud', 115200)
    .default('server', '192.168.102.55')
    .argv;


// Serial Port Parser
var Readline = SerialPort.parsers.Readline;
var port = new SerialPort(argv.port, { baudRate: argv.baud });
var parser = port.pipe(Readline({ delimiter: '\n' }));

// ElasticSearch client
var client = new elasticsearch.Client({
    host: argv.server + ':9200'
    //log: ''
});

// Check if the ElasticSearch server is up
client.ping({
    requestTimeout: 5000,
}, function (error) {
    if (error) {
        console.error('ElasticSearch cluster is down!');
        process.exit(1);
    } else {
        console.log('All is well');
    }
}
);

// Consumer
var consumer = function (entry) {


    //entry = entry.replace(/\t/g," ");

    try {
        var parsedMsg = JSON.parse(entry);
        console.log(entry);

        var ELKindex; // index to be used in the ElasticSearch submission
        switch (parsedMsg.msgtype) {
            case NETWORK_MAP:
                ELKindex = 'network';
                break;
            case RECEIVED_MSG:
                ELKindex = 'messages-' + parsedMsg.self;
                break;
            default:
                ELKindex = 'unformatted';
                break;
        }

        client.index({
            index: ELKindex,
            type: 'log',
            //id: '1',
            body: {
                message: parsedMsg,
                date: new Date().toISOString()
            }
        }, function (error, response) {
            if (error) {
                console.log('ElasticSearch ERROR: ' + error);
            }
            else {
                //console.log(response);
            }
        });
    } catch (e) {
        console.log('Not valid JSON msg: ' + entry);
    }

}

parser.on('data', consumer);