#!/bin/sh

rm -rf dist
mkdir -p dist dist/scripts
yarn
cp node_modules/github-api/dist/GitHub.bundle.js* dist/scripts/
cp -r src/* dist
cp manifest.json dist


# sed '"number"!=typeof t.page' 'true'
sed -i '' "s/typeof options.page !== 'number'/false/g" dist/scripts/GitHub.bundle.js
sed -i '' "s/___TOKEN___/$GH_TOKEN/g" dist/scripts/background-entry.js
sed -i '' "s/___USERNAME___/$GH_USERNAME/g" dist/scripts/background-entry.js
