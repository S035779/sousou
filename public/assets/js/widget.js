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
  var atag  = document.getElementsByClassName('paypal-widget');
  var size  = atag[0].dataset.size;
  var option = {};
  option['token']  = atag[0].dataset.token;
  option['id']     = atag[0].dataset.id;
  atag[0].style.display = 'none';

  var iframe = document.createElement('iframe');
  iframe.src = '/' + size + '?'
    + encodeFormData(option);
  switch(size) {
    case 'small':
      iframe.width = '640px';
      iframe.height = '480px';
      break;
    case 'medium':
      iframe.width = '800px';
      iframe.height = '600px';
      break;
    case 'large':
      iframe.width = '960px';
      iframe.height = '720px';
      break;
  }
  iframe.scrolling = 'no';
  iframe.frameBorder = 0;
  iframe.marginWidth = 0;
  iframe.marginHeight = 0;
  iframe.id = 'paypal-widget';

  // atagの隣にiframeを挿入
  atag[0].parentNode.insertBefore(iframe,atag[0]);
})();
