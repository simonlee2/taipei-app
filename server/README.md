# Taipei App Server

## Overview

**Server:** Express

**Database:** PostgreSQL

**Spatial Database:** PostGIS

**ORM:** knex, knex-postgis

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
