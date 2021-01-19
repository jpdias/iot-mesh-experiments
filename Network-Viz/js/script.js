const cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: cytoscape.stylesheet()
    .selector('node')
    .css({
      content: 'data(id)',
    })
    .selector('edge')
    .css({
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      width: 4,
      'line-color': '#ddd',
      'target-arrow-color': '#ddd',
    })
    .selector('.highlighted')
    .css({
      'background-color': '#61bffc',
      'line-color': '#61bffc',
      'target-arrow-color': '#61bffc',
      'transition-property': 'background-color, line-color, target-arrow-color',
      'transition-duration': '0.5s',
    }),
});


/* get base network config */

const query = {
  size: 1,
  sort: 'date:desc',
};


const randomSpawnPoint = () => ({
  x: 500 + Math.floor((Math.random() * 300) + 150),
  y: 200 + Math.floor((Math.random() * 300) + 150),
});

const getNetworkStatus = async lastNetworkTimestamp => axios.get('http://192.168.102.55:9200/network/log/_search', {
  params: query,
})
  .then((response) => {
    console.info(`Network Config Request: Has changed? ${lastNetworkTimestamp < new Date(response.data.hits.hits[0]._source.date)}`);
    console.debug(response);

    if (lastNetworkTimestamp < new Date(response.data.hits.hits[0]._source.date)) {
      const collection = cy.elements('node');
      // cy.remove( collection );
      const data = JSON.parse(response.data.hits.hits[0]._source.message);

      collection.forEach((element) => {
        element.data('active', 'false');
      });

      data.nodes.forEach((element) => {
        if (cy.getElementById(element.id.toString()).length === 0) {
          cy.add([{
            group: 'nodes',
            data: {
              id: element.id,
              active: 'true',
            },
            position: randomSpawnPoint(),
          }]);
        } else {
          cy.getElementById(element.id.toString()).data('active', 'true');
        }
      });

      cy.remove(cy.elements("node[active = 'false']"));


      data.edges.forEach((element) => {
        if (cy.getElementById(element.id.toString()).length === 0) {
          cy.add([{
            group: 'edges',
            data: {
              id: element.id,
              source: element.source,
              target: element.target,
            },
          }]);
        }
      });
    }

    setTimeout(() => {
      getNetworkStatus(new Date(response.data.hits.hits[0]._source.date));
    }, 1500);
  })
  .catch((error) => {
    console.log(error);
    return error;
  });

const getMessages = lastTimestamp => axios.get(`http://192.168.102.55:9200/messages-*/log/_search?q=date:[${lastTimestamp.toISOString()}\+TO\+*]&sort=date:desc`)
  .then((response) => {
    console.info(`Last Messages Request: Has messages? ${lastTimestamp < new Date(response.data.hits.hits[0]._source.date)}`);
    console.debug(response);
    if (lastTimestamp < new Date(response.data.hits.hits[0]._source.date)) {
      response.data.hits.hits.reverse().forEach((element) => {
        const conn = `${element._source.message.dest}-${element._source.message.from}-msg`;
        if (cy.getElementById(conn).length !== 0) {
          cy.getElementById(conn).flashClass('highlighted', 100);
          cy.getElementById(conn).style('label', JSON.stringify(element._source.message));
        } else {
          try {
            cy.add([{
              group: 'edges',
              data: {
                id: conn,
                source: element._source.message.from,
                target: element._source.message.dest,
              },
              style: {
                'line-style': 'dotted',
              },
            }]);
          } catch (error) {
            console.log(`Can not create edge at the moment: ${conn}`);
          }
        }
      });
    } else {
      cy.elements('edge').style('label', '');
    }
    setTimeout(() => {
      getMessages(new Date(response.data.hits.hits.reverse()[0]._source.date));
    }, 1000);
  })
  .catch((error) => {
    console.log(error);
  });

getNetworkStatus(new Date(1995));
getMessages(new Date(1995));
