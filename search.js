function delay(callback, ms) {
  var timer = 0;
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      callback.apply(context, args);
    }, ms || 0);
  };
}

function findAndSetPathway(dict, item, id_selector) {
  $(id_selector).html("");
  for (path_data in dict.nodes) {
    pathway = dict.nodes[path_data];
    if (
      pathway["data"]["compounds"].indexOf(item) > -1 ||
      pathway["data"]["gene products"].indexOf(item) > -1
    ) {
      $(id_selector).append(
        "<option value=" +
          pathway["data"]["id"] +
          ">" +
          pathway["data"]["name"] +
          "</option>"
      );
    }
  }
}

function setOptionsFromObject(object) {
  var tempathwaylist = [];
  var pathwaylist = [];
  for (const item of Object.values(object.nodes)) {
    tempathwaylist.push([item.data.name, item.data.id]);
  }
  tempathwaylist = tempathwaylist.sort();
  for (item in tempathwaylist) {
    pathwaylist.push(
      "<option value=" +
        tempathwaylist[item][1] +
        ">" +
        tempathwaylist[item][0] +
        "</option>"
    );
  }
  return pathwaylist;
}

$.ajaxSetup({ async: false });

var MAPLink = $.getJSON("KGML/result/MAPLinkJS.json", function(MAPLink) {
  return MAPLink;
});

var compound = $.getJSON("KGML/result/compound_parsed.json", function(
  compound
) {
  return compound;
});

var gene = $.getJSON("KGML/result/mmugenes_parsed.json", function(gene) {
  return gene;
});

MAPLink = JSON.parse(MAPLink.responseText);
compound = JSON.parse(compound.responseText);
gene = JSON.parse(gene.responseText);
comp_gene = compound.Compounds.concat(gene.Gene);
var pathwaylist = setOptionsFromObject(MAPLink);
$("#searchbar-pathway").html(pathwaylist.join(""));
$("#searchbar2-pathway").html(pathwaylist.join(""));

var options = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["id", "name"]
};

$("#searchbar").keyup(
  delay(function(e) {
    if (e.keyCode != 13) {
      var val = $("#searchbar").val();
      if (val != " ") {
        var fuse = new Fuse(comp_gene, options); // "list" is the item array
        var result = fuse.search(val);
        $("#result").html("");
        for (numObject in result) {
          object = result[numObject];
          object_id = object["id"];
          object_names = object["name"].join(" , ");
          if (object_id.indexOf("cpd:") >= 0) {
            $("#result").append(
              "<div class='result-item' id='" +
                object["id"] +
                "'><p>KEGG Compounds ID: " +
                object["id"] +
                "</p><p><b>Possible names:</b> " +
                object_names +
                "</p></div>"
            );
          } else {
            $("#result").append(
              "<div class='result-item'  id='" +
                object["id"] +
                "'><p>KEGG gene product ID: " +
                object["id"] +
                "</p><p><b>Possible names:</b> " +
                object_names +
                "</p></div>"
            );
          }
        }
      }
    }
    $(".result-item").click(function() {
      var text = $(this).attr("id");
      $("#searchbar").val(text);
      $("#result").html("");
      findAndSetPathway(MAPLink, text, "#searchbar-pathway");
      // do something with the text
    });
  }, 1500)
);

$("#searchbar").on("keyup", function(e) {
  if (e.keyCode == 13) {
    var text = $("#searchbar").val();
    $("#result").html("");
    findAndSetPathway(MAPLink, text, "#searchbar-pathway");
  }
});

$("#searchbar2").on("keyup", function(e) {
  if (e.keyCode == 13) {
    var text = $("#searchbar2").val();
    $("#result2").html("");
    findAndSetPathway(MAPLink, text, "#searchbar2-pathway");
  }
});

$("#searchbar2").keyup(
  delay(function(e) {
    if (e.keyCode != 13) {
      var val = $("#searchbar2").val();
      if (val != " ") {
        var fuse = new Fuse(comp_gene, options); // "list" is the item array
        var result = fuse.search(val);
        $("#result2").html("");
        for (numObject in result) {
          object = result[numObject];
          object_id = object["id"];
          object_names = object["name"].join(" , ");
          if (object_id.indexOf("cpd:") >= 0) {
            $("#result2").append(
              "<div class='result-item2' id='" +
                object["id"] +
                "'><p>KEGG Compounds ID: " +
                object["id"] +
                "</p><p><b>Possible names:</b> " +
                object_names +
                "</p></div>"
            );
          } else {
            $("#result2").append(
              "<div class='result-item2'  id='" +
                object["id"] +
                "'><p>KEGG gene product ID: " +
                object["id"] +
                "</p><p><b>Possible names:</b> " +
                object_names +
                "</p></div>"
            );
          }
        }
      }
    }
    $(".result-item2").click(function() {
      var text = $(this).attr("id");
      $("#searchbar2").val(text);
      $("#result2").html("");
      findAndSetPathway(MAPLink, text, "#searchbar2-pathway");
      // do something with the text
    });
  }, 1500)
);

$(".button6").click(function() {
  var path1 = $("#searchbar-pathway")
    .find(":selected")
    .attr("value");
  var path2 = $("#searchbar2-pathway")
    .find(":selected")
    .attr("value");
  var href =
    "./graph.html?path1=" + path1 + "&path2=" + path2 + "&directed=true";
  window.location.href = href;
});
