let gene = 20528;
//let proxy = "http://CORS-Anywhere.HerokuApp.com/"
let proxy = "https://api.codetabs.com/v1/proxy?quest="
let urlkegg = proxy + "rest.kegg.jp/conv/genes/ncbi-geneid:20528";
let urlcyc = "http://websvc.biocyc.org/apixml?fn=pathways-of-gene&id=HUMAN:HS02077";
console.log(urlkegg);
console.log("Gene from NCBI:  " + gene);

function getDataAjax(requestedurl) {
	return $.ajax({
		url: requestedurl,
		dataType: "text",
		async: false,
		success: function (data) {
			return (data);
		},
		error: function (jqXHR, exception) {
			var msg = "Can't access files";
			alert(msg);
		}
	});
}

function extractKEGGId() {
	let result = getDataAjax(urlkegg).done(function (result) { return result; });
	let string = result.responseText;
	let newID = string.replace("ncbi-geneid:" + gene + "	", "");
	console.log("KEGG ID:  " + newID);
	return newID
}

function listPathway(kegg_gene) {
	kegg_gene = kegg_gene.replace("\n", ""); //the id have \n at the end of line
	let urlPathway = proxy + "rest.kegg.jp/link/pathway/" + kegg_gene;
	let result = getDataAjax(urlPathway).done(function (result) { return result; });
	let regex = new RegExp(kegg_gene + "\t", "g");
	let string = result.responseText;
	string = string.replace(regex, "");
	let listOfPathway=string.split("\n").filter(function(v){return v!==''}); //split the text into array and remove the last entry ("\n" detected as an item of the list)
	console.log("\nPathway obtained from Kegg with this gene:\n");
	console.log(listOfPathway);
}


let keggid = extractKEGGId();
listPathway(keggid);

