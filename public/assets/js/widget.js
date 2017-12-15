/**
 * encodeFormData
 *
 * @param {object} data 
 * @returns {string}
 */
var encodeFormData = function(data) {
  if (!data) return ""
  var pairs = [];
  for(var name in data) {
    if (!data.hasOwnProperty(name)) continue;
    if (typeof data[name] === "function") continue;
    var value = data[name].toString();
    name = encodeURIComponent(name.replace(" ", "+"));
    value = encodeURIComponent(value.replace(" ", "+"));
    pairs.push(name + "=" + value);
  }
  return pairs.join('&');
};

(function(){

  'use strict';

  // 目印のaタグからパラメータとってきたら消す
  var atag = document.getElementsByClassName('paypal-widget');
  var language = atag[0].dataset.language;
  var option = {};
  option['usd']  = atag[0].dataset.usd;
  option['jpn']  = atag[0].dataset.jpn;
  option['length']  = atag[0].dataset.length;
  option['weight']  = atag[0].dataset.weight;
  option['from']  = atag[0].dataset.from;
  atag[0].style.display = 'none';

  var iframe = document.createElement('iframe');
  iframe.src = '/' + language + '?' + encodeFormData(option);
  iframe.width = '640px';
  iframe.height = '1800px';
  iframe.scrolling = 'no';
  iframe.frameBorder = 0;
  iframe.marginWidth = 0;
  iframe.marginHeight = 0;
  iframe.id = 'paypal-widget';

  // atagの隣にiframeを挿入
  atag[0].parentNode.insertBefore(iframe,atag[0]);
})();
