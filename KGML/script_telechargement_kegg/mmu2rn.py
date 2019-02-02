from os import listdir
from os.path import isfile, join
import json
import fileinput

linkA={}
linkB={}
link={}
file = open("mmu2ec.txt", "r").read().splitlines()
for line in file:
    linesplit=line.split("\t")
    mmu=linesplit[0]
    ec=linesplit[1]
    linkA[ec]=mmu

file = open("ec2reaction.txt", "r").read().splitlines()
for line in file:
    linesplit=line.split("\t")
    ec=linesplit[0]
    reaction=linesplit[1]
    linkB[reaction]=ec


for reaction, ec in linkB.items():
    mmu="undefined"
    if ec in linkA:
        mmu=linkA[ec]
    link[reaction]=mmu

finallink={}
for reaction, mmu in link.items():
    if mmu!="undefined":
        if mmu in finallink:
            finallink[mmu].append(reaction)
        else:
            finallink[mmu]=[reaction]

with open("result/mmu2reaction.json", 'w') as fp:
    json.dump(finallink, fp)



