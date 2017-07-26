var SerialPort = require('serialport');
var yargs = require('yargs');
var elasticsearch = require('elasticsearch');


// Command Arguments
var argv = yargs
    .usage('Usage: $0 -port [str] -baud [num] -server [str]')
    .default('port', '/dev/ttyUSB0')
    .default('baud', 115200)
    .default('server', '192.168.102.55')
    .argv;


// Serial Port Parser
var Readline = SerialPort.parsers.Readline;
var port = new SerialPort(argv.port, {baudRate: argv.baud});
var parser = port.pipe(Readline({delimiter: '\n'}));

// ElasticSearch client
var client = new elasticsearch.Client({
    host: argv.server+':9200',
    log: 'trace'
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
var consumer = function(entry){

    entry = entry.replace(/\t/g," ");

    console.log(entry);

    client.index({
        index: 'serialport',
        type: 'log',
        //id: '1',
        body: {
            message: entry,
            date: new Date().toISOString()
        }
    }, function (error, response) {
        if(error) {
            console.log('ElasticSearch ERROR: ' + error);
        }
        else {
            console.log(response);
        }
    });
}

parser.on('data', consumer);