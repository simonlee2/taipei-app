# Taipei App Server

## Overview

**Server:** Express

**Database:** PostgreSQL

**Spatial Database:** PostGIS

**ORM:** knex, knex-postgis

**Debug View:** leaflet, codemirror

## Requirements

1. NodeJS
2. postgres
3. postGIS

## Build

1. Install dependencies
```
npm install
```
2. Create database with defined schema
```
node migrate.js
```
3. Populate tables with data
```
node populate.js

```

## Usage

1. Run server
```
npm run devstart
```

## API

All points are returned as GeoJSONs with coordinates and other properties

### `GET /cafes`: 

Fetches all cafes in the database

### `GET /cafes/:point:/within/:radius`:

Fetches all cafes within `radius` meters of `point`

### `GET /cafes/:point/nearest/:k`:

Fetches `k` nearest cafest from `point`

### `GET /sql?q={query}`:

Sends query to database, where the result is parsed as GeoJSON. Use for debug view only

## Debug

Navigate to [localhost:3000/test](localhost:3000/test) to launch debug view where you can test SQL queries against the database and have a visual feedback of the results. 
Launch debug view
