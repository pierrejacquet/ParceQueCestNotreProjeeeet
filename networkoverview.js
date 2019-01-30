function getUrlParams(search) {
  let hashes = search.slice(search.indexOf("?") + 1).split("&");
  return hashes.reduce((params, hash) => {
    let [key, val] = hash.split("=");
    return Object.assign(params, { [key]: decodeURIComponent(val) });
  }, {});
}


function shortestPaths(graph, directed_boolean) {
  path = [];

  var aStar = graph
    .elements()
    .aStar({
      root: graph.$id(graphsource),
      goal: graph.$id(graphtarget),
      directed: directed_boolean
    });
  if (aStar["path"] === undefined){
    $("body").append("<p style='position: absolute; top:49vh; width:100vw; text-align:center'>There is no path between "+graphsource+ " and "+graphtarget+".<br>Try to switch the graph mode (directed/undirected) or change one pathway.</p>");
  }
  else{
    path.push(aStar.path.jsons());
    for (item in aStar.path.jsons()) {
      object = aStar.path.jsons()[item];
      //console.log(object);
  
      if (object.group == "edges") {
        var removed = graph.remove(graph.$id(object.data.id));
        shortestPaths_recursive(graph, path, aStar.distance, directed_boolean);
        removed.restore();
      }
    }
    console.log(path);
  
    var collection = [].concat.apply([], path);
    return collection;
  }
}

function shortestPaths_recursive(graph, path, maxlength, directed_boolean) {
  var aStar = graph
    .elements()
    .aStar({
      root: graph.$id(graphsource),
      goal: graph.$id(graphtarget),
      directed: directed_boolean
    });
  if (aStar.distance <= maxlength) {
    path.push(aStar.path.jsons());
    for (item in aStar.path.jsons()) {
      object = aStar.path.jsons()[item];
      if (object.group == "edges") {
        var removed = graph.remove(graph.$id(object.data.id));
        shortestPaths_recursive(graph, path, maxlength, directed_boolean);
        removed.restore();
      }
    }
  }

  //return path;
}

console.log(getUrlParams(window.location.search));
getUrlParams(window.location.search);

var graphsource = getUrlParams(window.location.search).path1;
var graphtarget = getUrlParams(window.location.search).path2;
var directed_boolean = JSON.parse(
  getUrlParams(window.location.search).directed
);
if (directed_boolean == true) {
  $(".button6").text("Switch to undirected mode");

  $(".button6").click(function() {
    location.href = location.href.replace("true", "false");
  });
} else {
  $(".button6").text("Switch to directed mode");
  $(".button6").click(function() {
    location.href = location.href.replace("false", "true");
  });
}

$.getJSON("KGML/result/MAPLinkJS.json", function(data) {
  //precy is a the full network object that must be processed before graph rendering.
  var precy = cytoscape({
    headless: true,
    elements: data
  });

  precy.edges().forEach(function(ele) {
    codirectedEdges = precy.$(ele).codirectedEdges();
    if (codirectedEdges.length > 1) {
      codirectedEdges.remove(codirectedEdges[0]); //remove one edge to the collection to keep it safe from deletion after.
      precy.remove(precy.$(ele).codirectedEdges());
    }
  });

  if (graphtarget == "") {
    //if graphtarget is undefined show just the unique pathway
    elements_data = precy.filter(precy.$id(graphsource));
    elements_data = elements_data.jsons();
  } else {
    //else show the shortest path between graph_source and graph_target
    elements_data = shortestPaths(precy, directed_boolean);
  }

  var cy = cytoscape({
    container: document.getElementById("cy"), // container to render in

    //elements: shortestPaths(precy, directed_boolean),
    elements: elements_data,
    layout: {
      name: "cola",
      animate: true,
      refresh: 1,
      maxSimulationTime: 5000,
      ungrabifyWhileSimulating: false,
      fit: false,
      nodeDimensionsIncludeLabels: true,
      avoidOverlap: true,
      handleDisconnected: false,
      nodeSpacing: function(node) {
        return 0;
      },
      flow: {
        axis: "y"
      },
      unconstrIter: 1000,
      userConstIter: 1000,
      infinite: true
    },

    style: [
      {
        selector: "core",
        style: {
          "selection-box-color": "#AAD8FF",
          "selection-box-border-color": "#8BB0D0",
          "selection-box-opacity": "0.5"
        }
      },
      {
        selector: "node",
        style: {
          content: "data(name)",
          "font-size": "12px",
          "text-valign": "center",
          "text-halign": "center",
          "background-color": "#555",
          "text-outline-color": "#555",
          "text-outline-width": "2px",
          color: "#fff",
          //"overlay-padding": "6px",
          "z-index": "10"
        }
      },
      {
        selector: "node:selected",
        style: {
          "border-width": "6px",
          "border-color": "#AAD8FF",
          "border-opacity": "0.5",
          "background-color": "#77828C",
          "text-outline-color": "#77828C"
        }
      },
      {
        selector: "edge",
        style: {
          "curve-style": "bezier",
          "target-arrow-shape": "triangle",
          opacity: "0.4",
          "line-color": "#bbb",
          width: "mapData(weight, 0, 1, 1, 8)"
          //"overlay-padding": "3px"
        }
      },
      {
        selector: "node.unhighlighted",
        style: {
          opacity: "0.2"
        }
      },
      {
        selector: "edge.unhighlighted",
        style: {
          opacity: "0.05"
        }
      },
      {
        selector: ".highlighted",
        style: {
          "z-index": "999999"
        }
      },
      {
        selector: "node.highlighted",
        style: {
          "border-width": "6px",
          "border-color": "#AAD8FF",
          "border-opacity": "0.5",
          "background-color": "#394855",
          "text-outline-color": "#394855"
        }
      }
    ]
  });

  cy.center();
});
