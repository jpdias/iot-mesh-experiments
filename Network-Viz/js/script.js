var cy = cytoscape({
    container: document.getElementById('cy'),

    boxSelectionEnabled: false,
    autounselectify: true,

    style: cytoscape.stylesheet()
        .selector('node')
        .css({
            'content': 'data(id)'
        })
        .selector('edge')
        .css({
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'width': 4,
            'line-color': '#ddd',
            'target-arrow-color': '#ddd'
        })
        .selector('.highlighted')
        .css({
            'background-color': '#61bffc',
            'line-color': '#61bffc',
            'target-arrow-color': '#61bffc',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '0.5s'
        }),

    layout: {
        name: 'breadthfirst',
        directed: true,
        roots: '#a',
        padding: 10
    }
});


/* get base network config */

var query = {
    "query": {
        "filtered": {
            "query": {
                "match_all": {}
            },
            "filter": {
                "range": {
                    "timestamp": {
                        "gt": "now-1h"
                    }
                }
            }
        }
    }
}


axios.get('192.168.102.55:9200/network-1/log/_search',  { body: query })
    .then(function (response) {
        console.log(response);
        /*
        var eles = cy.add([
            { group: "nodes", data: { id: "n0" }, position: { x: 100, y: 100 } },
            { group: "nodes", data: { id: "n1" }, position: { x: 200, y: 200 } },
            { group: "edges", data: { id: "e0", source: "n0", target: "n1" } }
        ]);
        */
    })
    .catch(function (error) {
        console.log(error);
    });

/*var bfs = cy.elements().bfs('#a', function () {}, true);

var i = 0;
var highlightNextEle = function () {
    if (i < bfs.path.length) {
        bfs.path[i].addClass('highlighted');

        i++;
        setTimeout(highlightNextEle, 1000);
    }
};

// kick off first highlight
highlightNextEle();*/