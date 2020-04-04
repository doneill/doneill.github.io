import json
import datetime

with open('./source/gallery/data/counties-wa.geojson') as g:
  counties = json.load(g)

with open('./source/gallery/data/counties-wa-point.geojson') as f:
  features = json.load(f)

for county in counties['features']:
  name = county['properties']['NAME']
  for feature in features:
    esriFieldTypeDate = feature['properties']['Last_Update']
    datetimeVal = esriFieldTypeDate / 1000.0
    timestamp = datetime.datetime.fromtimestamp(datetimeVal).strftime('%Y-%m-%d %H:%M:%S')
    admin2 = feature['properties']['Admin2']
    confirmed = feature['properties']['Confirmed']
    deaths = feature['properties']['Deaths']
    if (name == admin2):
      county['properties']['COVID_CONFIRMED'] = confirmed
      county['properties']['COVID_DEATHS'] = deaths
      county['properties']['UPDATED'] = timestamp
    
      # print out results
      print(name, county['properties']['COVID_CONFIRMED'], county['properties']['COVID_DEATHS'], county['properties']['UPDATED'])

with open('./source/gallery/data/counties-wa.geojson', 'w') as f:
  f.seek(0)
  json.dump(counties, f, indent=2)
  f.truncate()
f.close