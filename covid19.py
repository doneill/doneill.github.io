import json
import requests
import lxml.html as lh
import pandas as pd
from htmlmin import minify

# ///////////////////////////////////////////////////
# scrape url table and convert to panda datatable
# ///////////////////////////////////////////////////

url = 'https://www.worldometers.info/coronavirus/country/us/'
page = requests.get(url)
doc = lh.fromstring(page.content)
tr_elements = doc.xpath('//tr')

col = []
i = 0

if not tr_elements:
  print("No row elements at " + url)
else:
  for header in tr_elements[0]:
    i+=1
    name = header.text_content()
    col.append((name, []))

  for j in range(1, 55):
    tr_element = tr_elements[j]

    i = 0
    for row in tr_element.iterchildren():
      data = row.text_content()
      min_data = minify(data)
      value = min_data.replace(',', '')
      if i > 0:
        try:
          data = int(value)
        except:
          pass

      col[i][1].append(value)
      i+=1

d = {title:column for (title,column) in col}
df = pd.DataFrame(d)

# ///////////////////////////////////////////////////
# update states.geojson with covid data from datatable
# ///////////////////////////////////////////////////

with open('./source/gallery/data/states.geojson') as f:
  geojson = json.load(f)

for i in df.index:
  if i < 52:
    for feature in geojson['features']:
      stateName =  feature['properties']['NAME']
      dataStateName = str.strip(df['USAState'][i])

      if (stateName == dataStateName):
        feature['properties']['COVID_CONFIRMED'] = df['TotalCases'][i]
        feature['properties']['COVID_NEW'] = df['NewCases'][i]
        feature['properties']['COVID_DEATHS'] = df['TotalDeaths'][i]

    # print out results
    print(df['USAState'][i], df['TotalCases'][i], df['NewCases'][i], df['TotalDeaths'][i])

with open('./source/gallery/data/states.geojson', 'w') as f:
  f.seek(0)
  json.dump(geojson, f, indent=2)
  f.truncate()
f.close