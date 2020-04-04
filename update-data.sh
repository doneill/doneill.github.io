 #!/bin/bash 

# pipe result to geojson file
curl 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases_US/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&token=' | jq '.features[] | select(.properties.Province_State=="Washington")' > temp.geojson
# append comma after each feature
jq -s . temp.geojson > ./source/gallery/data/counties-wa-point.geojson
rm temp.geojson

# update geojson data
python3 wa-counties-covid.py
python3 covid19.py
