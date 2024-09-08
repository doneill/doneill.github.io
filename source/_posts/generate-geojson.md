---
title: Generating GeoJSON in SQLite
date: 2024-09-08 12:20:25
tags:
- sqlite
- geojson
---

[GeoJSON](https://geojson.org/) is an open standard based on JSON to represent geographic features.  It supports points, lines, polygons, and multipart collections of the previous feature types. This post demonstrates ways of leveraging point location data in a SQLite database as latitude and longitude and converting into GeoJSON for usage as a map layer. Given a SQLite **locations** table with the following schema: 

```
uuid  TEXT
timestamp TEXT 
json  TEXT 
data  BLOB  
```
and the `data` column has the point location data with accuracy values in json format:

```json
{
    "location":
    {
        "lat": 13.5494602,
        "lon": 104.2505927
    },
    "recorded_at": "2024-09-08T01:33:36.625Z",
    "additional":
    {
        "accuracy": 6.78,
    },
}
```

First let's filter out any points with accuracy levels above a certain threshold, e.g. 25M, by using JSON parsing:

```sql
SELECT *
FROM locations
WHERE json_extract(json(data), '$.additional.accuracy') > 25;
```

The `json_extract(json(data), '$.additional.accuracy')` extracts the `accuracy` value from the `additional` object in the JSON data.

Now we want to format the existing JSON data in the `data` column as GeoJSON.  We can do this with the following query: 

```sql
SELECT 
    id,
    uuid,
    timestamp,
    json_object(
        'type', 'Feature',
        'geometry', json_object(
            'type', 'Point',
            'coordinates', json_array(
                json_extract(json(data), '$.location.lon'),
                json_extract(json(data), '$.location.lat')
            )
        ),
        'properties', json_object(
            'id', id,
            'uuid', uuid,
            'timestamp', timestamp
        )
    ) AS geojson
FROM locations;
```
This creates a GeoJSON feature object for each row which includes a point geometry and properties from the other columns. This results GeoJSON for each row in the table as individual points:

```json
{
    "type": "Feature",
    "geometry":
    {
        "type": "Point",
        "coordinates":
        [
            104.2505927,
            13.5494602
        ]
    },
    "properties":
    {
        "id": 547,
        "uuid": "af801da8-5f2e-42d6-b059-b5f7ce96f30c",
        "timestamp": "2024-09-08T01:33:36.625Z"
    }
}
```

In order to create single GeoJSON file representing all of the rows in the table we need to use a Common Table Expression (CTE) with a subquery that creates individual GeoJSON feature objects for each point and wrap this in a GeoJSON `FeatureCollection`: 

```sql
WITH point_features AS (
  SELECT 
    json_object(
      'type', 'Feature',
      'geometry', json_object(
        'type', 'Point',
        'coordinates', json_array(
          json_extract(json(data), '$.location.lon'),
          json_extract(json(data), '$.location.lat')
        )
      ),
      'properties', json_object(
        'id', id,
        'uuid', uuid,
        'timestamp', timestamp
      )
    ) AS feature
  FROM locations
)
SELECT json_object(
  'type', 'FeatureCollection',
  'features', json_group_array(feature)
) AS geojson_collection
FROM point_features;
```

This results in a single row with one column named `geojson_collection` containing a complete GeoJSON `FeatureCollection` object with all rows in the table: 

```json
{
  "type": "FeatureCollection",
  "features":
  [
    {
        "type": "Feature",
        "geometry":
        {
            "type": "Point",
            "coordinates":
            [
                104.2505927,
                13.5494602
            ]
        },
        "properties":
        {
            "id": 547,
            "uuid": "af801da8-5f2e-42d6-b059-b5f7ce96f30c",
            "timestamp": "2024-09-08T01:33:36.625Z"
        }
    },
  ]
}
```

Copy the results into Sublime Text and view in a sample web view with [MapPreview](https://gh.jdoneill.com/2020/08/15/mappreview/)
