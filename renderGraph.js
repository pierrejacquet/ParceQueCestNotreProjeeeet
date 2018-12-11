function getXMLAjax(requestedurl) {
  return $.ajax({
    url: requestedurl,
    dataType: "xml",
    async: false,
    success: function (data) {
      return data;
    },
    error: function (jqXHR, exception) {
      var msg = "Can't access files";
      alert(msg);
    }
  });
}

function getPathway(pathwayID) {
  let result = getXMLAjax("http://127.0.0.1:5500/test.xml").done(function (
    result
  ) {
    return result;
  });

  let xmlData = result.responseText;
  console.log(xmlData);
  return xmlData;
}

let xmlPathway = getPathway("mmu:20528");

let x2js = new X2JS();
let jsonPathway = x2js.xml_str2json(xmlPathway);
jsonPathway["pathway"]["nodes"] = jsonPathway["pathway"]["entry"];
jsonPathway["pathway"]["edges"] = jsonPathway["pathway"]["relation"];
delete jsonPathway["pathway"]["entry"];
delete jsonPathway["pathway"]["relation"];
//delete jsonPathway["pathway"]["reaction"];


for (noeud in jsonPathway["pathway"]["nodes"]) {
  nodeObject=jsonPathway["pathway"]["nodes"][noeud];
  nodeObject["data"] = nodeObject["graphics"];
  nodeObject["data"]["name"] = nodeObject["data"]["_name"].split(',')[0];
  nodeObject["data"]["id"] = nodeObject["_id"];
  nodeObject["data"]["link"] = nodeObject["_link"];
  nodeObject["data"]["type"] = nodeObject["_type"];
  delete nodeObject["_link"];
  delete nodeObject["_id"];
  delete nodeObject["data"]["_name"];
  delete nodeObject["_type"];
  delete nodeObject["graphics"];
  if(nodeObject["data"]["type"] == "ortholog" || nodeObject["data"]["type"] == "compound" ){
    delete jsonPathway.pathway.nodes[noeud];
  }
}

jsonPathway["pathway"]["nodes"] = jsonPathway["pathway"]["nodes"].filter(function () { return true });

for (edge in jsonPathway["pathway"]["edges"]) {
  edgeObject=jsonPathway["pathway"]["edges"][edge];
  edgeObject["data"] = edgeObject["subtype"];
  edgeObject["data"]["source"] = edgeObject["_entry1"]
  edgeObject["data"]["target"] = edgeObject["_entry2"]
  edgeObject["data"]["type"] = edgeObject["_type"]
  delete edgeObject["subtype"];
  delete edgeObject["_entry1"];
  delete edgeObject["_entry2"];
  delete edgeObject["_type"];
}



console.log(JSON.stringify(jsonPathway, null, 4));

var cy = cytoscape({
  container: document.getElementById("cy"), // container to render in

  elements:jsonPathway["pathway"],

  layout: {
    name: "cola",
    animate: true,
    refresh: 1,
    maxSimulationTime: 00,
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
    infinite: true

    },

style:[{
  "selector": "core",
  "style": {
    "selection-box-color": "#AAD8FF",
    "selection-box-border-color": "#8BB0D0",
    "selection-box-opacity": "0.5"
  }
}, {
  "selector": "node",
  "style": {
    "width": "mapData(score, 0, 0.006769776522008331, 20, 60)",
    "height": "mapData(score, 0, 0.006769776522008331, 20, 60)",
    "content": "data(name)",
    "font-size": "12px",
    "text-valign": "center",
    "text-halign": "center",
    "background-color": "#555",
    "text-outline-color": "#555",
    "text-outline-width": "2px",
    "color": "#fff",
    "overlay-padding": "6px",
    "z-index": "10"
  }
}, {
  "selector": "node[?attr]",
  "style": {
    "shape": "rectangle",
    "background-color": "#aaa",
    "text-outline-color": "#aaa",
    "width": "16px",
    "height": "16px",
    "font-size": "6px",
    "z-index": "1"
  }
}, {
  "selector": "node[?query]",
  "style": {
    "background-clip": "none",
    "background-fit": "contain"
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
    "width": "mapData(weight, 0, 1, 1, 8)",
    "overlay-padding": "3px"
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
}, {
  "selector": "edge.filtered",
  "style": {
    "opacity": "0"
  }
}, {
  "selector": "edge[group=\"coexp\"]",
  "style": {
    "line-color": "#d0b7d5"
  }
}, {
  "selector": "edge[group=\"coloc\"]",
  "style": {
    "line-color": "#a0b3dc"
  }
}, {
  "selector": "edge[group=\"gi\"]",
  "style": {
    "line-color": "#90e190"
  }
}, {
  "selector": "edge[group=\"path\"]",
  "style": {
    "line-color": "#9bd8de"
  }
}, {
  "selector": "edge[group=\"pi\"]",
  "style": {
    "line-color": "#eaa2a2"
  }
}, {
  "selector": "edge[group=\"predict\"]",
  "style": {
    "line-color": "#f6c384"
  }
}, {
  "selector": "edge[group=\"spd\"]",
  "style": {
    "line-color": "#dad4a2"
  }
}, {
  "selector": "edge[group=\"spd_attr\"]",
  "style": {
    "line-color": "#D0D0D0"
  }
}, {
  "selector": "edge[group=\"reg\"]",
  "style": {
    "line-color": "#D0D0D0"
  }
}, {
  "selector": "edge[group=\"reg_attr\"]",
  "style": {
    "line-color": "#D0D0D0"
  }
}, {
  "selector": "edge[group=\"user\"]",
  "style": {
    "line-color": "#f0ec86"
  }
}]
});
