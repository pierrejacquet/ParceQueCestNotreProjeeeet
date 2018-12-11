from Bio.KEGG.KGML import *
from Bio.KEGG.KGML import KGML_parser
from Bio.KEGG.KGML.KGML_parser import read
from Bio.KEGG.KGML.KGML_parser import parse
from os import listdir
from os.path import isfile, join

KGMLs = [f for f in listdir("./kgml_files/")
         if isfile(join("./kgml_files/", f))]
print (KGMLs)


filename = open("./MAPLink.json", "w")
filename.write("{\n")
for files in KGMLs:
    path = "kgml_files/" + files
    Maps = KGML_parser.read(open(path, 'r'))
    name = Maps.name
    filename.write('\t"' + name + '":{\n\t\t"connected_to": [\n')
    lenMapmap = len(Maps.maps)
    for i in range(lenMapmap):
        entry = str(Maps.maps[i].name)
        if i != lenMapmap - 1:
            filename.write('\t\t\t\t"' + entry + '",\n')
        else:
            filename.write('\t\t\t\t"' + entry + '"\n')
    filename.write("\t\t\t]\n\t},\n")
    #print (element.name)

filename.write("\n}")
filename.close()


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