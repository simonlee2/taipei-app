#!/bin/sh

set -e

cd js
npm install
npm config set unsafe-perm=true
# create tables
node migrate.js

# populate tables
node populate.js
