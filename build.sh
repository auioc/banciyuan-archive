#!/bin/sh

mkdir temp
mkdir public
mkdir public/assets

npm install

echo '{"compress":{"pure_funcs":["console.debug"]},"ecma":2017}' >temp/terser.json

node_modules/.bin/browserify src/main.ts -p tsify |
    node_modules/.bin/terser \
        --config-file temp/terser.json \
        >public/assets/bundle.js

node_modules/.bin/html-minifier-terser \
    --minify-js \
    --collapse-whitespace \
    --remove-comments \
    index.html >public/index.html

cp assets/main.css public/assets/main.css
