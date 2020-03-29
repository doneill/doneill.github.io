import json
import requests
import lxml.html as lh
import pandas as pd
from htmlmin import minify

# ///////////////////////////////////////////////////
# scrape url table and convert to panda datatable
# ///////////////////////////////////////////////////

url = 'https://www.doh.wa.gov/Emergencies/Coronavirus/TSPD'
page = requests.get(url)
doc = lh.fromstring(page.content)
tr_elements = doc.xpath('//tr')

col = []
i = 0

for header in tr_elements[0]:
  i+=1
  name = header.text_content()
  col.append((name, []))

for j in range(1, len(tr_elements)):
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

with open('./source/gallery/data/counties-wa.geojson') as f:
  geojson = json.load(f)

for i in df.index:
  if i < 34:
    for feature in geojson['features']:
      countyName =  feature['properties']['NAME']
      datacountyName = str.strip(df['County'][i])

      if (countyName == datacountyName):
        totalCases = df['Positive/Confirmed Cases'][i]
        totalDeaths = df['Deaths'][i]
        feature['properties']['COVID_CONFIRMED'] = totalCases
        feature['properties']['COVID_DEATHS'] = totalDeaths

    # print out results
    print(datacountyName, totalCases, totalDeaths)

with open('./source/gallery/data/counties-wa.geojson', 'w') as f:
  f.seek(0)
  json.dump(geojson, f, indent=2)
  f.truncate()
f.close
