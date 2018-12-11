let gene = 20528;
//let proxy = "http://CORS-Anywhere.HerokuApp.com/"
let proxy = "https://api.codetabs.com/v1/proxy?quest=";
let urlkegg = proxy + "rest.kegg.jp/conv/genes/ncbi-geneid:20528";
let urlcyc =
  "http://websvc.biocyc.org/apixml?fn=pathways-of-gene&id=HUMAN:HS02077";
console.log(urlkegg);
console.log("Gene from NCBI:  " + gene);

function getDataAjax(requestedurl) {
  return $.ajax({
    url: requestedurl,
    dataType: "text",
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

function extractKEGGId() {
  let result = getDataAjax(urlkegg).done(function(result) {
    return result;
  });
  let string = result.responseText;
  let newID = string.replace("ncbi-geneid:" + gene + "	", "");
  console.log("KEGG ID:  " + newID);
  return newID;
}

function listPathway(kegg_gene) {
  kegg_gene = kegg_gene.replace("\n", ""); //the id have \n at the end of line
  let urlPathway = proxy + "http://rest.kegg.jp/get/" + kegg_gene;
  let result = getDataAjax(urlPathway).done(function(result) {
    return result;
  });
  let string = result.responseText;

  string = string.substring(string.indexOf("PATHWAY")); //remove everything until PATHWAY
  string = string.split(/\n\S/); //get everything from PATHWAY and stop at the beginning of a new section
  pathwayWithDescription = string[0]
    .replace("PATHWAY", "")
    .replace(/^\s+/gm, ""); //remove white spaces
  pathwayWithDescription = pathwayWithDescription.split("\n");
  console.log(pathwayWithDescription);
  return pathwayWithDescription;
}

function removeDescription(string) {
  pathway = string.match(/(^\w+)/gm)[0]; //get the Pathway ID  without description
  return pathway;
}

function getPathway(pathwayID) {
  pathwayID = pathwayID.replace(":", ""); //kegg want us to remove ":" to get the pathway file.
  let urlPathway = proxy + "http://rest.kegg.jp/get/" + pathwayID + "/kgml";
  let result = getXMLAjax(urlPathway).done(function(result) {
    return result;
  });
  let xmlData = result.responseText;
  console.log(xmlData);
  return xmlData;
}


let keggid = extractKEGGId();
let listOfPathway = listPathway(keggid);
let OnePathway = removeDescription(listOfPathway[1]);
let xmlPathway=getPathway(OnePathway);


let x2js = new X2JS();

let jsonPathway=x2js.xml_str2json(xmlPathway);
console.log(jsonPathway);

