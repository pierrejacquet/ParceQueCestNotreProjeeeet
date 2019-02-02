while read p; do
  echo "$p"
  wget "http://rest.kegg.jp/get/${p}/kgml" -O ${p}.xml
done <list.txt