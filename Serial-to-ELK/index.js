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
});

function formatResponse(currentScope, nodes, edges, prevId) {
  console.log(currentScope);
  currentScope.forEach((element) => {
    // Check if the new 'currentScope' still has a 'nodeId' object
    if (element !== undefined && element.nodeId !== undefined) {
      const dataNode = { id: element.nodeId };

      const dataEdge = {
        id: `${prevId}-${element.nodeId}`,
        weight: 1,
        source: prevId,
        target: element.nodeId,
      };

      nodes.push(dataNode);
      edges.push(dataEdge);

      if (element.subs !== undefined) {
        formatResponse(element.subs, nodes, edges, element.nodeId);
      }
    }
  }, this);
}

// Network State Message Formatter
const format = (parsedMsg) => {
  let currentScope;
  const elements = { nodes: [], edges: [] };

  if (parsedMsg.self !== undefined) {
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
const consumer = (logEntry) => {
  var entry = logEntry.replace(/\t/g, ' ');

  try {
    let parsedMsg;
    let ELKindex; // index to be used in the ElasticSearch submission

    if(entry.indexOf("{") > 0) {
      let start = entry.indexOf("{");
      let end = entry.lastIndexOf("}");
      entry = entry.substr(start, end+1-start);
    }
    
    parsedMsg = JSON.parse(entry);
    
    if(parsedMsg.hasOwnProperty("msgtype")) {
      switch (parsedMsg.msgtype) {
        case NETWORK_MAP:
        ELKindex = 'network';
        parsedMsg = format(parsedMsg);
        console.log(parsedMsg);
        break;
        case RECEIVED_MSG:
        ELKindex = `messages-${parsedMsg.self}`;
        break;
        default:
        ELKindex = 'unformatted';
        break;
      }
    } else if(parsedMsg.hasOwnProperty("dest") && parsedMsg.dest && parsedMsg.hasOwnProperty("from") && parsedMsg.from) {
      ELKindex = `messages-${parsedMsg.from}`;
    }
    
    console.log(entry);
    
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
        console.log(`ElasticSearch ERROR: ${error} - Msg: ${response}`);
      }
    });
  } catch (e) {
    //console.log(e);
    console.log(`Not valid JSON msg: ${entry}`);
  }
};

parser.on('data', consumer);
