---
title: Cloud Native Geospatial
date: 2026-05-01 17:40:25
tags:
- geospatial
- cloud-native
- geotiff
- stac
- zarr
---


Traditional GIS workflows assume data lives on a local filesystem. With cloud-native the data lives in object storage, S3, GCS, Azure, etc. and your compute moves to the data. This post introduces the technology stack for the following cloud-native geospatial formats

- [STAC: SpatioTemporal Asset Catalog](https://stacspec.org)
- [COG: Cloud Optimzed GeoTIFF](https://cogeo.org/)
- [Zarr](https://zarr.dev/)
- [Virtual Zarr](https://virtualzarr.cloud/)

## STAC

A JSON-based open specification for describing a libary system for spatial data 

- STAC Catalog
The top level entry point representing a logical group of other catalogs, collections, and item objects.

- Collection
A named grouping of related items that share a common sensor, processing level, and data format. An example collection could be sentinel-2-l2a.


- Item: represents a GeoJSON feature
A single acquisition over a specific place at a specific time.  It is metadata record that points to the data.

- Asset
Each item has a dictionary of named assets, the source data files

How they nest

```
  Catalog  (Earth Search)
  └── Collection  (sentinel-2-l2a)
      └── Item  (S2B_10SEG_20240816_0_L2A)
          ├── Asset: red   → https://sentinel-cogs.s3…/B04.tif
          ├── Asset: nir   → https://sentinel-cogs.s3…/B08.tif
          └── Asset: scl   → https://sentinel-cogs.s3…/SCL.tif
```

## Cog

A regular GeoTIFF restructured under the following conditions:

- Tiles replace scanlines for efficient HTTP reads
- Overiew pyramids baked in to all inexpensive low-resolution read
- Header first in the file supporting a single HTTP `GET` to fetch all data

The cloud optimization is transparent to the GeoTIFF whereby you can open in with any GDAL tooling.

## Zarr

Chunked, compressed, N-dimensional array storage known as tensors.

- Chunks are individual files or objects in storage allowing for independent reads
- Native [Dask](https://docs.dask.org) integration

For satellite time-series, a typical store layout is

`(time=T, band=B, y=Y, x=X)   chunked as (1, 1, 512, 512)`

This equates to fetching one band at one time step is one chunk read.

## Virtual Zarr

Enables performant cloud optimized access to achival data formats like netCDF and HDF5 without duplicated any data. The key insight is you don't need to convert Zarr to use Zarr APIs.

[kerchunk](https://fsspec.github.io/kerchunk/) scans the internal byte layout of the existing files, e.g. COGs, NetCDF, etc., and writes a tiny JSON reference file that maps to Zarr chunk addresses to HTTP byte-range requests resulting in a heterogeneous collection of COGs in object storage appears as a unified queryable Zarr dataset without any data movement.

## When to use each approach

- Virtual Zarr
  - Exploring a new dataset or performaning a single query
  - Don't have control over the source data

- Zarr
  - Repeatd analysis of the same area of interest
  - Data shared with multiple clients/users
  - Require custom chunking for time-series queries
