from Bio.KEGG.KGML import *
from Bio.KEGG.KGML import KGML_parser
from Bio.KEGG.KGML.KGML_parser import read
from Bio.KEGG.KGML.KGML_parser import parse
from os import listdir
from os.path import isfile, join
import json
import fileinput

KGMLs = [f for f in listdir("./kgml_files/")
         if isfile(join("./kgml_files/", f))]

Map_gene_to_reaction={}
with open('result/mmu2reaction.json') as handle:
    Map_gene_to_reaction = json.loads(handle.read())

print (Map_gene_to_reaction)

def parseCompounds(filepath):
  compounds_name_reference={"Compounds":[]}
  file = open(filepath, "r").read().splitlines()
  for line in file:
    linesplit=line.split("\t")
    compname=linesplit[1].replace(" ","").split(";")
    compounds_name_reference["Compounds"].append({"id":linesplit[0],"name":compname})
  with open("result/compound_parsed.json", 'w') as fp:
    json.dump(compounds_name_reference, fp)
  return compounds_name_reference

def parseGenes(filepath):
  genes_name_reference={"Gene":[]}
  file = open(filepath, "r").read().splitlines()
  for line in file:
    linesplit=line.split("\t")
    genename=linesplit[1].replace("; ",";").replace(",,",",").replace(", ",";").split(";") 
    if linesplit[0] in Map_gene_to_reaction:
      genes_name_reference["Gene"].append({"id":linesplit[0],"name":genename,"in_reaction":Map_gene_to_reaction[linesplit[0]]})
    else:
      genes_name_reference["Gene"].append({"id":linesplit[0],"name":genename})

  with open("result/mmugenes_parsed.json", 'w') as fp:
    json.dump(genes_name_reference, fp)
  return genes_name_reference


def parseKGML():
  nodestring='"nodes":[\n'
  edgestring='"edges":[\n'
  assignId=0

  for files in KGMLs:
      path = "kgml_files/" + files
      Maps = KGML_parser.read(open(path, 'r'))
      name = Maps.name
      description=Maps.title
      #retrieve list of compounds in each pathway
      KEGGcompounds=[]
      for i in range (len(Maps.compounds)):
        temp_compound_name=str(Maps.compounds[i].name).split()[0]
        if "cpd:" in temp_compound_name:
          KEGGcompounds.append(temp_compound_name)
      strKEGGcompounds=str(KEGGcompounds).replace("'",'"')
      #retrieve list of genes products in each pathway
      KEGGgeneproduct=[]
      for i in range (len(Maps.genes)):
        temp_gene_name=str(Maps.genes[i].name).split()[0]
        if "mmu:" in temp_gene_name:
          KEGGgeneproduct.append(temp_gene_name)
      strKEGGgeneproduct=str(KEGGgeneproduct).replace("'",'"')

      nodestring+='{"data":{ "id":"' + name + '", "name":"'+description+'","compounds":'+strKEGGcompounds+',"gene products":'+strKEGGgeneproduct+'}},'

      lenMapmap = len(Maps.maps)
      for i in range(lenMapmap):
          entry = str(Maps.maps[i].name)
          if entry != name and "mmu" in entry:
              #nodestring+='{"data":{ "id":"' + entry + '", "name":"'+entry+'"}},'
              edgestring+='{"data":{ "id":"' + str(assignId) + '", "source":"'+name+'","target":"'+entry+'"}},'
              assignId=assignId+1
  nodestring+="],"
  edgestring+="]"
  return nodestring,edgestring




def cytoscapedesktop():
  ## for cytoscape desktop
  filename = open("./result/MAPLink.json", "w")
  #filename.write('{\n"elements":{\n')
  filename.write('''{  "format_version" : "1.0",
    "generated_by" : "cytoscape-3.4.0",
    "target_cytoscapejs_version" : "~2.1",
    "data" : {
      "shared_name" : "Network",
      "name" : "Network",
      "SUID" : 7430,
      "__Annotations" : [ ],
      "selected" : true
    },
    "elements" : {''')

  nodestring,edgestring=parseKGML()
  filename.write(nodestring)
  #filename.write("],")
  filename.write(edgestring)
  #filename.write("]")
  filename.write("}}")
  filename.close()

def cytoscapejs():
  filename = open("./result/MAPLinkJS.json", "w")
  filename.write("{")
  nodestring,edgestring=parseKGML()
  filename.write(nodestring)
  filename.write(edgestring)
  filename.write("}")
  filename.close()



def cleanFileAndRemoveError(filename):
  with fileinput.FileInput(filename, inplace=1) as file:
    for line in file:
        print(line.replace("},]", "}]"), end='')



compounds_name_reference=parseCompounds("compound.txt")
genes_name_reference=parseGenes("mmugene.txt")
cytoscapedesktop()
cytoscapejs()
cleanFileAndRemoveError("result/MAPLink.json") #remove unwanted semicolon at end of arrays
cleanFileAndRemoveError("result/MAPLinkJS.json") #remove unwanted semicolon at end of arrays
