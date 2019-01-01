from Bio.KEGG.KGML import *
from Bio.KEGG.KGML import KGML_parser
from Bio.KEGG.KGML.KGML_parser import read
from Bio.KEGG.KGML.KGML_parser import parse
from os import listdir
from os.path import isfile, join

KGMLs = [f for f in listdir("./kgml_files/")
         if isfile(join("./kgml_files/", f))]
#print (KGMLs)


filename = open("./MAPLink.json", "w")
#filename.write('{\n"elements":{\n')
filename.write('{')

nodestring='"nodes":[\n'
edgestring='"edges":[\n'
assignId=0

for files in KGMLs:
    path = "kgml_files/" + files
    Maps = KGML_parser.read(open(path, 'r'))
    name = Maps.name
    nodestring+='{"data":{ "id":"' + name + '", "label":"'+name+'"}},'
    #edgestring+='{"data":{ "id":"' + name + '", "label":"'+name+'"}},'
    lenMapmap = len(Maps.maps)
    for i in range(lenMapmap):
        entry = str(Maps.maps[i].name)
        if entry != name:
            nodestring+='{"data":{ "id":"' + entry + '", "label":"'+entry+'"}},'
            edgestring+='{"data":{ "id":"' + str(assignId) + '", "source":"'+name+'","target":"'+entry+'"}},'
            assignId=assignId+1

filename.write(nodestring)
filename.write("],")
filename.write(edgestring)
filename.write("]")
filename.write("}")
filename.close()



## for cytoscape desktop
filename = open("./MAPLinkBureauversion.json", "w")
#filename.write('{\n"elements":{\n')
filename.write('''{  "format_version" : "1.0",
  "generated_by" : "cytoscape-3.4.0",
  "target_cytoscapejs_version" : "~2.1",
  "data" : {
    "shared_name" : "Network",
    "name" : "Network",
    "SUID" : 7430,
    "shared_name" : "Network",
    "__Annotations" : [ ],
    "selected" : true
  },
  "elements" : {''')

nodestring='"nodes":[\n'
edgestring='"edges":[\n'
assignId=0

for files in KGMLs:
    path = "kgml_files/" + files
    Maps = KGML_parser.read(open(path, 'r'))
    name = Maps.name
    description=Maps.title
    nodestring+='{"data":{ "id":"' + name + '", "name":"'+description+'"}},'
    #edgestring+='{"data":{ "id":"' + name + '", "label":"'+name+'"}},'
    lenMapmap = len(Maps.maps)
    for i in range(lenMapmap):
        entry = str(Maps.maps[i].name)
        if entry != name and "mmu" in entry:
            #nodestring+='{"data":{ "id":"' + entry + '", "name":"'+entry+'"}},'
            edgestring+='{"data":{ "id":"' + str(assignId) + '", "source":"'+name+'","target":"'+entry+'"}},'
            assignId=assignId+1

filename.write(nodestring)
filename.write("],")
filename.write(edgestring)
filename.write("]")
filename.write("}}")
filename.close()


#sif lite version

filename = open("./MAPLink.sif", "w")
for files in KGMLs:
    path = "kgml_files/" + files
    Maps = KGML_parser.read(open(path, 'r'))
    name = Maps.name
    lenMapmap = len(Maps.maps)
    for i in range(lenMapmap):
        entry = str(Maps.maps[i].name)
        if entry != name:
            filename.write(name +"  connected-to    "+entry+ '\n')
filename.close()