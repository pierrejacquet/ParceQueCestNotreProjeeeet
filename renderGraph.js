var cy = cytoscape({
  container: document.getElementById("cy"), // container to render in

  elements: [
    // list of graph elements to start with
    {
      // node a
      data: { id: "a" }
    },
    {
      // node b
      data: { id: "b" }
    },
    {
      // edge ab
      data: { id: "ab", source: "a", target: "b" }
    }
  ],

  style: [
    // the stylesheet for the graph
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(id)"
      }
    },

    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle"
      }
    }
  ],

  layout: {
    name: "grid",
    rows: 1
  }
});

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
  let result = getXMLAjax("http://127.0.0.1:5500/test.xml").done(function(
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
console.log(jsonPathway);
