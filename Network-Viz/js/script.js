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

const lastNetworkTimestamp = new Date(1995, 11, 17);

const randomSpawnPoint = () => ({
  x: 500 + Math.floor((Math.random() * 300) + 150),
  y: 200 + Math.floor((Math.random() * 300) + 150),
});

const getNetworkStatus = async () => axios.get('http://192.168.102.55:9200/network/log/_search', {
  params: query,
})
  .then((response) => {
    console.log(response);
    if (lastNetworkTimestamp < new Date(response.data.hits.hits[0]._source.date)) {
      cy.add([{
        group: 'nodes',
        data: {
          id: 'ac',
        },
        position: randomSpawnPoint(),
      },
      {
        group: 'edges',
        data: {
          id: 12,
          source: 'ac',
          target: 'k',
        },
      },
      ]);
    }
    //cy.add(response.data.hits.hits[0]._source.messsage.body)
    console.info('Network Config Request');
    console.log(response);

    setTimeout(() => {
      getNetworkStatus();
    }, 30000);
  })
  .catch((error) => {
    console.log(error);
    return error;
  });

const getMessages = () => axios.get('http://192.168.102.55:9200/messages-*/log/_search', {
  params: query,
})
  .then((response) => {
    console.info('Last Messages Request');
    console.log(response);
    /* var bfs = cy.elements().bfs('#a', function () {}, true);

        var i = 0;
        var highlightNextEle = function () {
            if (i < bfs.path.length) {
                bfs.path[i].addClass('highlighted');

                i++;
                setTimeout(highlightNextEle, 1000);
            }
        };

        // kick off first highlight
        highlightNextEle(); */
    /*
        var eles = cy.add([
            
        ]);
        */

    setTimeout(() => {
      getMessages();
    }, 1000);
  })
  .catch((error) => {
    console.log(error);
  });

getNetworkStatus();
// getMessages();
