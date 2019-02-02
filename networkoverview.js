function getUrlParams(search) {
  let hashes = search.slice(search.indexOf("?") + 1).split("&");
  return hashes.reduce((params, hash) => {
    let [key, val] = hash.split("=");
    return Object.assign(params, { [key]: decodeURIComponent(val) });
  }, {});
}

function findVal(object, key) {
  var value;
  Object.keys(object).some(function(k) {
    if (k === key) {
      value = object[k];
      return true;
    }
    if (object[k] && typeof object[k] === "object") {
      value = findVal(object[k], key);
      return value !== undefined;
    }
  });
  return value;
}

function shortestPaths(graph, directed_boolean) {
  path = [];

  var aStar = graph.elements().aStar({
    root: graph.$id(graphsource),
    goal: graph.$id(graphtarget),
    directed: directed_boolean
  });
  if (aStar["path"] === undefined) {
    $("body").append(
      "<p style='position: absolute; top:49vh; width:100vw; text-align:center'>There is no path between " +
        graphsource +
        " and " +
        graphtarget +
        ".<br>Try to switch the graph mode (directed/undirected) or change one pathway.</p>"
    );
  } else {
    path.push(aStar.path.jsons());
    for (item in aStar.path.jsons()) {
      object = aStar.path.jsons()[item];

      if (object.group == "edges") {
        var removed = graph.remove(graph.$id(object.data.id));
        shortestPaths_recursive(graph, path, aStar.distance, directed_boolean);
        removed.restore();
      }
    }

    var collection = [].concat.apply([], path);
    return collection;
  }
}

function shortestPaths_recursive(graph, path, maxlength, directed_boolean) {
  var aStar = graph.elements().aStar({
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
}

function getXMLAjax(requestedurl) {
  return $.ajax({
    url: requestedurl,
    dataType: "xml",
    async: false,
    success: function(data) {
      return data;
    },
    error: function(jqXHR, exception) {
      var msg = "Can't access files";
      alert(msg);
    }
  });
}

function getPathway(pathwayID) {
  let result = getXMLAjax(
    "./KGML/kgml_files/" + pathwayID + ".xml"
  ).done(function(result) {
    return result;
  });

  let xmlData = result.responseText;
  return xmlData;
}

function parseKGML(path) {
  path = path.replace(":", "");
  let xmlPathway = getPathway(path);
  let x2js = new X2JS();
  let jsonPathway = x2js.xml_str2json(xmlPathway);
  jsonPathway["pathway"]["nodes"] = jsonPathway["pathway"]["entry"];
  //jsonPathway["pathway"]["edges"] = jsonPathway["pathway"]["relation"];

  //REACTION BETWEEN COMPOUNDS
  for (reactionID in jsonPathway["pathway"]["reaction"]) {
    jsonPathway["pathway"]["reaction"][reactionID]["data"] = {};
    jsonPathway["pathway"]["reaction"][reactionID]["data"]["name"] =
      jsonPathway["pathway"]["reaction"][reactionID]["_name"];
    jsonPathway["pathway"]["reaction"][reactionID]["data"]["id"] =
      path + "_rn_" + jsonPathway["pathway"]["reaction"][reactionID]["_id"];
    jsonPathway["pathway"]["reaction"][reactionID]["data"]["type"] =
      jsonPathway["pathway"]["reaction"][reactionID]["_type"];

    jsonPathway["pathway"]["reaction"][reactionID]["data"]["target"] =
      path +
      "_" +
      findVal(jsonPathway["pathway"]["reaction"][reactionID]["product"], "_id");

    jsonPathway["pathway"]["reaction"][reactionID]["data"]["source"] =
      path +
      "_" +
      findVal(
        jsonPathway["pathway"]["reaction"][reactionID]["substrate"],
        "_id"
      );
    delete jsonPathway["pathway"]["reaction"][reactionID]["_id"];
    delete jsonPathway["pathway"]["reaction"][reactionID]["_type"];
    delete jsonPathway["pathway"]["reaction"][reactionID]["_name"];
    delete jsonPathway["pathway"]["reaction"][reactionID]["product"];
    delete jsonPathway["pathway"]["reaction"][reactionID]["substrate"];
  }
  jsonPathway["pathway"]["edges"] =
    jsonPathway["pathway"]["reaction"] != undefined
      ? jsonPathway["pathway"]["reaction"]
      : [];

  //NODES ENTRY
  for (noeud in jsonPathway["pathway"]["nodes"]) {
    nodeObject = jsonPathway["pathway"]["nodes"][noeud];

    nodeObject["data"] = Array.isArray(nodeObject["graphics"])
      ? nodeObject["graphics"][0]
      : nodeObject["graphics"];

    try {
      nodeObject["data"]["name"] = nodeObject["data"]["_name"].split(",")[0];
    } catch (error) {
      nodeObject["data"]["name"] = "undefined";
    }
    nodeObject["data"]["id"] = path + "_" + nodeObject["_id"];
    nodeObject["data"]["link"] =
      "_link" in nodeObject ? nodeObject["_link"] : "undefined";
    nodeObject["data"]["idKEGG"] = nodeObject["data"]["link"].replace(
      "http://www.kegg.jp/dbget-bin/www_bget?",
      ""
    );

    nodeObject["data"]["in_reaction"] =
      jsonPathway["pathway"]["nodes"][noeud]["_reaction"];
    nodeObject["data"]["type"] = nodeObject["_type"];
    nodeObject["classes"] = "kgml";
    delete nodeObject["_link"];
    delete nodeObject["_id"];
    delete nodeObject["data"]["_name"];
    delete nodeObject["_type"];
    delete nodeObject["graphics"];
    if (nodeObject["data"]["type"] == "ortholog") {
      delete jsonPathway.pathway.nodes[noeud];
    }
  }

  jsonPathway["pathway"]["nodes"] = jsonPathway["pathway"]["nodes"].filter(
    function() {
      return true;
    }
  );

  //Once each nodes is set search for node in reaction
  for (edge in jsonPathway["pathway"]["edges"]) {
    reaction_name = jsonPathway["pathway"]["edges"][edge]["data"]["name"];

    for (node in jsonPathway["pathway"]["nodes"]) {
      if (
        jsonPathway["pathway"]["nodes"][node]["data"]["in_reaction"] !=
        undefined
      ) {
        if (
          reaction_name ==
          jsonPathway["pathway"]["nodes"][node]["data"]["in_reaction"]
        ) {
          temp_target = jsonPathway["pathway"]["edges"][edge]["data"]["target"];
          jsonPathway["pathway"]["edges"][edge]["data"]["target"] =
            jsonPathway["pathway"]["nodes"][node]["data"]["id"];
          jsonPathway["pathway"]["edges"].push({
            data: {
              id: jsonPathway["pathway"]["edges"][edge]["data"]["id"] + "_2",
              name:
                jsonPathway["pathway"]["edges"][edge]["data"]["name"] + "_2",
              source: jsonPathway["pathway"]["nodes"][node]["data"]["id"],
              target: temp_target,
              type: jsonPathway["pathway"]["edges"][edge]["data"]["type"]
            }
          });
        }
      }
    }
  }

  //RELATION BETWEEN PROTEIN AND COMPOUNDS
  for (edge in jsonPathway["pathway"]["relation"]) {
    edgeObject = jsonPathway["pathway"]["relation"][edge];
    jsonPathway["pathway"]["relation"][edge]["data"] = {};
    jsonPathway["pathway"]["relation"][edge]["data"]["source"] =
      path + "_" + findVal(edgeObject, "_entry1");
    jsonPathway["pathway"]["relation"][edge]["data"]["target"] =
      path + "_" + findVal(edgeObject, "_entry2");
    jsonPathway["pathway"]["relation"][edge]["data"]["type"] =
      edgeObject["_type"];
    delete jsonPathway["pathway"]["relation"][edge]["subtype"];
    delete jsonPathway["pathway"]["relation"][edge]["_entry1"];
    delete jsonPathway["pathway"]["relation"][edge]["_entry2"];
    delete jsonPathway["pathway"]["relation"][edge]["_type"];
  }

  Array.prototype.push.apply(
    jsonPathway["pathway"]["edges"],
    jsonPathway["pathway"]["relation"]
  );

  delete jsonPathway["pathway"]["entry"];
  delete jsonPathway["pathway"]["relation"];

  return jsonPathway["pathway"];
}

function createMetaNodes(graph) {
  subgraphs = [];
  var clone = cytoscape({
    headless: true,
    elements: graph
      .elements()
      .clone()
      .jsons()
  });

  clone.nodes().forEach(function(graph_node) {
    //graph_node=graph.getElementById("path:mmu00052");
    current_node = graph_node.id();
    current_path = current_node.replace("path:", "");
    subgraph_data = parseKGML(current_path);

    var subgraph = cytoscape({
      headless: true,
      elements: subgraph_data
    });

    graph.add(subgraph.elements().jsons());

    subgraph.nodes().forEach(function(sub_node) {
      subnode_id = sub_node.id();
      graph.getElementById(subnode_id).move({ parent: current_node });
    });
    //removes edge between genes : they are already linked by compounds
    /*
    subgraph.edges().forEach(function(sub_edge) {
    if(sub_edge.source().data().type=="gene" &&sub_edge.target().data().type=="gene"){
      graph.getElementById(sub_edge.id()).remove();
    }
    });*/
    //remove isolated nodes
    subgraph
      .nodes()
      .roots()
      .intersection(subgraph.nodes().leaves())
      .forEach(function(sub_node) {
        graph.getElementById(sub_node.id()).remove();
      });
  });
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
  //remove "metabolim pathway" node too generic
  precy.remove(precy.nodes().getElementById("path:mmu01100"));
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
    elements: elements_data,
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
          "background-color": "#fff",
          "text-outline-color": "#555",
          "text-outline-width": "2px",
          color: "#fff",
          //"overlay-padding": "6px",
          "z-index": "10",
          opacity: "1"
        }
      },
      {
        selector: "node:selected",
        style: {
          "border-width": "6px",
          "border-color": "#000",
          "border-opacity": "0.5",
          "background-color": "#fff",
          "text-outline-color": "#77828C"
        }
      },
      {
        selector: "edge",
        style: {
          "curve-style": "bezier",
          "target-arrow-shape": "triangle",
          opacity: "0.8",
          //"line-color": "#bbb",
          "line-color": function(ele) {
            if (ele.data("type") == "reversible") {
              return "#247ba0";
            } else if (ele.data("type") == "irreversible") {
              return "#f25f5c";
            } else {
              return "#bbb";
            }
          },

          width: "mapData(weight, 0, 1, 1, 8)"
          //"overlay-padding": "3px"
        }
      },
      {
        selector: ".kgml",
        style: {
          "font-size": "10px",
          "background-color": function(ele) {
            if (ele.data("type") == "compound") {
              return "#f25f5c";
            } else if (ele.data("type") == "gene") {
              return "#247ba0";
            } else {
              return "#bbb";
            }
          },
          opacity: 0.95
        }
      },
      {
        selector: "[id = '" + graphsource + "']",
        style: {
          "font-size": "10px",
          "text-outline-color": "#70c1b3",
          opacity: 1
        }
      },
      {
        selector: "[id = '" + graphtarget + "']",
        style: {
          "font-size": "10px",
          "text-outline-color": "#f25f5c",
          opacity: 1
        }
      }
    ]
  });

  createMetaNodes(cy);

  var layout = cy.elements().layout({
    name: "cola",
    animate: true,
    refresh: 1,
    maxSimulationTime: 5000,
    ungrabifyWhileSimulating: false,
    fit: false,
    //convergenceThreshold: 0.01,
    ready: function() {
      cy.center();
      cy.fit();
    },
    nodeDimensionsIncludeLabels: true,
    avoidOverlap: true,
    handleDisconnected: false,
    nodeSpacing: function(node) {
      return 50;
    },
    // flow: {
    //   axis: "y"
    // },
    unconstrIter: 1000,
    userConstIter: 10000,
    infinite: false
  });

  var layout2 = cy.elements().layout({
    name: "cose-bilkent",
    animate: "end",
    randomize: false,
    fit: true
  });

  var api = cy.expandCollapse({
    layoutBy: {
      name: "cola",
      animate: true,
      refresh: 1,
      maxSimulationTime: 10000,
      ungrabifyWhileSimulating: false,
      fit: false,
      //convergenceThreshold: 0.001,
      nodeDimensionsIncludeLabels: false,
      avoidOverlap: true,
      handleDisconnected: false,
      nodeSpacing: function(node) {
        return 50;
      },
      unconstrIter: 1000,
      userConstIter: 100000,
      infinite: false
    },
    fisheye: true,
    animate: "end",
    undoable: false
  });

  api.collapseAll();

  layout.run();
  cy.on("click", "node", function(evt) {
    info_data = this.data();
    console.log(info_data);
    $("#infobulle").html(
      "<b>Name: </b>" +
        info_data["name"] +
        "<br><b>ID: </b>" +
        info_data["id"] +
        "<br><b>Type: </b>" +
        info_data["type"]
    );
  });

  cy.on("click", "edge", function(evt) {
    info_data = this.data();
    console.log(info_data);
    $("#infobulle").html(
      "<b>Name: </b>" +
        info_data["name"] +
        "<br><b>ID: </b>" +
        info_data["id"] +
        "<br><b>Type: </b>" +
        info_data["type"]
    );
  });
});
