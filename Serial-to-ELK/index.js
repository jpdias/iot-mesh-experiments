const SerialPort = require('serialport');
const yargs = require('yargs');
const elasticsearch = require('elasticsearch');

// Log Message Types
const NETWORK_MAP = 0;
const RECEIVED_MSG = 1;


// Command Arguments
const argv = yargs
  .usage('Usage: $0 -port [str] -baud [num] -server [str]')
  .default('port', '/dev/ttyUSB0')
  .default('baud', 115200)
  .default('server', '192.168.102.55')
  .argv;


// Serial Port Parser
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort(argv.port, { baudRate: argv.baud });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

// ElasticSearch client
const client = new elasticsearch.Client({
  host: `${argv.server}:9200`,
  // log: ''
});

// Check if the ElasticSearch server is up
client.ping({
  requestTimeout: 5000,
}, (error) => {
  if (error) {
    console.error('ElasticSearch cluster is down!');
    process.exit(1);
  } else {
    console.log('ElasticSearch is running.');
  }
},
);

function formatResponse(currentScope, nodes, edges, prevId) {
  for (let i = 0; i < currentScope.length; i++) {
    if (currentScope[i] !== undefined && currentScope[i].hasOwnProperty('nodeId')) { // Check if the new 'currentScope' still has a 'nodeId' object
      const data_node = { id: currentScope[i].nodeId };

      const data_edge = {
        id: `${prevId}-${currentScope[i].nodeId}`,
        weight: 1,
        source: prevId,
        target: currentScope[i].nodeId,
      };

      nodes.push(data_node);
      // '{data: { id: ' + currentScope[i].nodeId + '}}');

      edges.push(data_edge);
      // '{data: { id: ' + prevId + '-' + currentScope[i].nodeId + ', weight: 1, source: ' + prevId + ', target: ' + currentScope[i].nodeId + '}}');

      if (currentScope[i].hasOwnProperty('subs')) {
        formatResponse(currentScope[i].subs, nodes, edges, currentScope[i].nodeId);
      }
    }
  }
}

// Network State Message Formatter
const format = function (parsedMsg) {
  let currentScope;
  const elements = { nodes: [], edges: [] };

  if (parsedMsg.hasOwnProperty('self')) {
    const data = {};

    data.id = parsedMsg.self;

    elements.nodes.push(data);// '{data: { id: ' + parsedMsg.self + '}}');

    currentScope = parsedMsg.body;
    formatResponse(currentScope, elements.nodes, elements.edges, parsedMsg.self);
  }

  // formmatedMsg = "{elements: { nodes: [" + nodes + "], edges: [" + edges + "]}}";
  console.log(elements);
  return JSON.stringify(elements);
};

// Consumer
function consumer(logEntry) {
  const entry = logEntry.replace(/\t/g, ' ');

  try {
    let parsedMsg = JSON.parse(entry);
    console.log(entry);

    let ELKindex; // index to be used in the ElasticSearch submission
    switch (parsedMsg.msgtype) {
      case NETWORK_MAP:
        console.info(parsedMsg.msgtype);
        ELKindex = 'network';
        parsedMsg = format(parsedMsg);
        break;
      case RECEIVED_MSG:
        console.info(parsedMsg.msgtype);
        ELKindex = `messages-${parsedMsg.self}`;
        break;
      default:
        console.info(parsedMsg.msgtype);
        ELKindex = 'unformatted';
        break;
    }

    client.index({
      index: ELKindex,
      type: 'log',
      // id: '1',
      body: {
        message: parsedMsg,
        date: new Date().toISOString(),
      },
    }, (error, response) => {
      if (error) {
        console.log(`ElasticSearch ERROR: ${error}`);
      } else {
        // console.log(response);
      }
    });
  } catch (e) {
    console.log(`Not valid JSON msg: ${entry}`);
  }
}

parser.on('data', consumer);
