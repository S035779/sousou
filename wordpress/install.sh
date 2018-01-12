#!/bin/sh
ASSETS=/home/fwpresearch/public_html/assets
PLUGIN=/home/fwpresearch/public_html/dev/wp-content/plugins/paypal-shortcode
TODAY=$(date "+%Y%m%d")

mv $ASSETS/app.bundle.js        $ASSETS/app.bundle_${TODAY}.js
mv $ASSETS/widget.bundle.js     $ASSETS/widget.bundle_${TODAY}.js
mv $ASSETS/app.bundle.js.map    $ASSETS/app.bundle_${TODAY}.js.map
mv $ASSETS/widget.bundle.js.map $ASSETS/widget.bundle_${TODAY}.js.map
cp ../dist/*.js $ASSETS/js/
cp ../dist/*.js.map $ASSETS/js/

mv $ASSETS/style.css     $ASSETS/style_${TODAY}.css
mv $ASSETS/style.css.map $ASSETS/style_${TODAY}.css.map
cp ../dist/*.css $ASSETS/css/
cp ../dist/*.css.map $ASSETS/css/

mv $ASSETS/close.png       $ASSETS/close_${TODAY}.png
mv $ASSETS/loading.gif     $ASSETS/loading_${TODAY}.gif
mv $ASSETS/next.png        $ASSETS/next_${TODAY}.png
mv $ASSETS/favicon.ico     $ASSETS/favicon_${TODAY}.ico
mv $ASSETS/myanmaphoto.png $ASSETS/myanmaphoto_${TODAY}.png
mv $ASSETS/prev.png        $ASSETS/prev_${TODAY}.png
cp ../dist/*.png $ASSETS/image/
cp ../dist/*.gif $ASSETS/image/
cp ../dist/*.ico $ASSETS/image/

mv $PLUGIN/paypal-shortcode.php $PLUGIN/paypal-shortcode_${TODAY}.php
cp $PLUGIN/paypal-shortcode.php $PLUGIN/
