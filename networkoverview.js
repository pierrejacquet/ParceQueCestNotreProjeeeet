var graphsource="path:mmu01100";
var graphtarget="path:mmu04010";
var listselected = ["path:mmu05218", "path:mmu04115", "path:mmu04916", "path:mmu04010"];

function filterGraph(cytoscapegraph) {
  cytoscapegraph.nodes().forEach(function (ele) {
    if (!listselected.includes(ele.data().id)) {
      //cytoscapegraph.remove(ele);
    }
  });
  return cytoscapegraph;
}


$.getJSON("KGML/result/MAPLinkJS.json", function (data) {
  //precy is a the full network object that must be processed before graph rendering.
  var precy = cytoscape({
    headless: true,
    elements: data,
  });

  var aStar = precy.elements().aStar({ root: precy.$id(graphsource), goal: precy.$id(graphtarget), directed: true });
  aStar.path.select();
  console.log(aStar.path);
  console.log(aStar.distance);

  filterGraph(precy)

  console.log(precy);
  var cy = cytoscape({
    container: document.getElementById("cy"), // container to render in

    elements: aStar.path.jsons(),

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
      nodeSpacing: function (node) {
        return 0;
      },
      // flow: {
      //   axis: "y"
      // },
      unconstrIter: 1000,
      userConstIter: 1000,
      infinite: false

    },

    style: [{
      "selector": "core",
      "style": {
        "selection-box-color": "#AAD8FF",
        "selection-box-border-color": "#8BB0D0",
        "selection-box-opacity": "0.5"
      }
    }, {
      "selector": "node",
      "style": {
        "content": "data(name)",
        "font-size": "12px",
        "text-valign": "center",
        "text-halign": "center",
        "background-color": "#555",
        "text-outline-color": "#555",
        "text-outline-width": "2px",
        "color": "#fff",
        //"overlay-padding": "6px",
        "z-index": "10"
      }
    }, {
      "selector": "node:selected",
      "style": {
        "border-width": "6px",
        "border-color": "#AAD8FF",
        "border-opacity": "0.5",
        "background-color": "#77828C",
        "text-outline-color": "#77828C"
      }
    }, {
      "selector": "edge",
      "style": {
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        "opacity": "0.4",
        "line-color": "#bbb",
        "width": "mapData(weight, 0, 1, 1, 8)"
        //"overlay-padding": "3px"
      }
    }, {
      "selector": "node.unhighlighted",
      "style": {
        "opacity": "0.2"
      }
    }, {
      "selector": "edge.unhighlighted",
      "style": {
        "opacity": "0.05"
      }
    }, {
      "selector": ".highlighted",
      "style": {
        "z-index": "999999"
      }
    }, {
      "selector": "node.highlighted",
      "style": {
        "border-width": "6px",
        "border-color": "#AAD8FF",
        "border-opacity": "0.5",
        "background-color": "#394855",
        "text-outline-color": "#394855"
      }
    }]
  });

  cy.center();



});