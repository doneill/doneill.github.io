---
title: Process geojson with jq
date: 2020-03-31 18:18:25
tags:
- esri
- arcgis rest
- geojson
---

Esri Feature Services support geojson output, this url gets the county level covid-19 data

```bash
# get raw data
curl 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases_US/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&token='
```

Sample output

```
{"type":"FeatureCollection","features":[{"type":"Feature","id":1,"geometry":{"type":"Point","coordinates":[-82.4617065799999,34.2233337800001]},"properties":{"OBJECTID":1,"Province_State":"South Carolina","Country_Region":"US","Last_Update":1585698236000,"Lat":34.22333378,"Long_":-82.46170658,"Confirmed":4,"Recovered":0,"Deaths":0,"Active":0,"Admin2":"Abbeville","FIPS":"45001","Combined_Key":"Abbeville, South Carolina, US","Incident_Rate":null,"People_Tested":null}},
```

The raw geojson format isn't returned so nicely formatted so we can pipe the response through [jq](https://stedolan.github.io/jq/) to pretty print it: 

```bash
curl 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases_US/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&token=' | jq '.'
```

We can use jq to return all features:

```bash
curl 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases_US/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&token=' | jq '.features[]'
```

Sample result

```json
{
  "type": "Feature",
  "id": 2173,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -102.4258673,
      40.0034683900001
    ]
  },
  "properties": {
    "OBJECTID": 2173,
    "Province_State": "Colorado",
    "Country_Region": "US",
    "Last_Update": 1585702369000,
    "Lat": 40.00346839,
    "Long_": -102.4258673,
    "Confirmed": 2,
    "Recovered": 0,
    "Deaths": 0,
    "Active": 0,
    "Admin2": "Yuma",
    "FIPS": "08125",
    "Combined_Key": "Yuma, Colorado, US",
    "Incident_Rate": null,
    "People_Tested": null
  }
```

The function `select(boolean_expression)` will return features that are true for the expression.  We can filter our data by State with `select(.properties.Province_State=="Washington")`: 

```bash
# get Washington county data
curl 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases_US/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&token=' | jq '.features[] | select(.properties.Province_State=="Washington")'
```

Sample result: 

```json
{
  "type": "Feature",
  "id": 2162,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -120.7380126,
      46.45738486
    ]
  },
  "properties": {
    "OBJECTID": 2162,
    "Province_State": "Washington",
    "Country_Region": "US",
    "Last_Update": 1585710693000,
    "Lat": 46.45738486,
    "Long_": -120.7380126,
    "Confirmed": 161,
    "Recovered": 0,
    "Deaths": 3,
    "Active": 0,
    "Admin2": "Yakima",
    "FIPS": "53077",
    "Combined_Key": "Yakima, Washington, US",
    "Incident_Rate": null,
    "People_Tested": null
  }
}
```

Then you can pipe the results to a local geojson file

```bash
# pipe result to geojson file
curl 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases_US/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&token=' | jq '.features[] | select(.properties.Province_State=="Washington")' > counties-wa-point.geojson
```
