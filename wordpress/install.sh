#!/bin/sh
ASSETS=/home/fwpresearch/public_html/assets
PLUGIN=/home/fwpresearch/public_html/dev/wp-content/plugins/paypal-shortcode
TODAY=$(date "+%Y%m%d")

mv $ASSETS/js/app.bundle.js        $ASSETS/js/app.bundle_${TODAY}.js
mv $ASSETS/js/widget.bundle.js     $ASSETS/js/widget.bundle_${TODAY}.js
mv $ASSETS/js/app.bundle.js.map    $ASSETS/js/app.bundle_${TODAY}.js.map
mv $ASSETS/js/widget.bundle.js.map $ASSETS/js/widget.bundle_${TODAY}.js.map
cp dist/*.js $ASSETS/js/
cp dist/*.js.map $ASSETS/js/

mv $ASSETS/css/style.css     $ASSETS/css/style_${TODAY}.css
mv $ASSETS/css/style.css.map $ASSETS/css/style_${TODAY}.css.map
cp dist/*.css $ASSETS/css/
cp dist/*.css.map $ASSETS/css/

mv $ASSETS/image/favicon.ico     $ASSETS/image/favicon_${TODAY}.ico
mv $ASSETS/image/myanmaphoto.png $ASSETS/image/myanmaphoto_${TODAY}.png
cp dist/*.png $ASSETS/image/
cp dist/*.ico $ASSETS/image/

mv $PLUGIN/paypal-shortcode.php $PLUGIN/paypal-shortcode_${TODAY}.php
cp wordpress/paypal-shortcode.php $PLUGIN/
