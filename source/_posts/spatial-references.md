---
title: Spatial References in Mobile APIs
date: 2019-05-24 20:46:25
tags:
- arcgis runtime
- google maps
---


Modern Web mapping platforms have adopted [WGS 84 / Psuedo Mercator -- Spherical Mercator](https://en.wikipedia.org/wiki/Web_Mercator_projection) projected coordinate system, or more commonly known as Web Mercator.  When working with most web mapping platforms points are in WGS84 and the APIs do the converting behind the scenes when showing the points in an app.  Esri's ArcGIS Runtime platform does things a little differently, taking the Android API as an example, the spatial reference of an `ArcGISMap` is based on the first layer added to the map, all subsequent layers are automatically reprojected to the initial layers spatial reference when needed.  

ArcGIS online basemaps are in Web Mercator, like other web mapping platforms, and when added as the first layer in an ArcGIS Runtime application it sets Web Mercator as the spatial reference of the map.  When getting a location represented as a point from the API you will get the coordinates in Web Mercator.  This is different from other mapping APIs.  Taking Google Maps as an example whereby the underlying basemap you see in apps is in Web Mercator when you get a location represented as a point it will return WGS84 coordinates to work with the API.  While in Google Maps the API handles the reprojection for you, the ArcGIS Runtime API requires the developer to handle to reprojection. 

The ArcGIS Android API provides a `GeometryUtil` class that has a bunch of static methods to allow you to manipulate geometries.  One such method for dealing with projections is `GeometryUtil.project()`. This class becomes quite useful when integrating between APIs that use spatial coordinates. 

The ArcGIS Android `MapView` class can give us the center of the area visible to the user as a point in the spatial reference of the map.  To work with other spatial APIs you can use the `GeometryUtil.project()` method to convert the point to WGS85.

```kotlin
// get the center point of the map
val centerPnt = mapView.visibleArea.extent.center
val centerPntWGS84 = GeometryEngine.project(centerPnt, SpatialReferences.getWgs84())

// convert lat/lon as String
val lat = centerPntWGS84.x.toString()
val lon = centerPntWGS84.y.toString()
```

We can use the resulting String representation of the WGS84 latitude and longitude to send to Google's place search API to get a list of predictions based on search input and the center of the map representing the location of where to set a radius around which to search:

```kotlin
@GET("api/place/autocomplete/json")
fun getPredictions(@Query("key") apikey: String, 
                    @Query("input") input: String, 
                    @Query("location") location: String, 
                    @Query("radius") radius: String): Call<Prediction>
```

The results will be centered around the location you send it instead of null island. 

You can also easily convert screen points to map coordinates in both Google and ArcGIS Android APIs, but they are accessed differently.  The Google Maps API for Android provides a `Projection.toScreenLocation()` method to translate between screen location and geographic coordinates, in the ArcGIS Android API this can be done with `MapView.screenToLocation()`.  These methods honor the returned point in the projection workflow described above. 

Check out the weather-mpp on [GitHub](https://github.com/doneill/weather-map) for a working example of using Google Places API to zoom to a location result from a places search and map it on an ArcGIS Android Basemap.  
