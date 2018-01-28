import std from 'Utilities/stdutils';

const host = process.env.TOP_URL || 'https://localhost:4443';

const getElm = id => document.getElementById(id);
const getSize = id => getElm(id)
  .contentWindow.document.documentElement.scrollHeight;
const setSize = (element, height) => {
  element.setAttribute('height', height + 'px');
};

window.addEventListener('load', () => {
  setSize(getElm('paypal-widget'), getSize('paypal-widget'));
});

window.addEventListener('message', event => {
  if (event.origin !== host) return;
  if (event.data.app)
    setSize(getElm('paypal-widget'), event.data.app.height);
}, false);

(() => {
  // 目印のaタグからパラメータとってきたら消す
  const atag = document.getElementsByClassName('paypal-widget');
  const option = {};
  option['language'] = atag[0].dataset.language;
  option['usd']  = atag[0].dataset.usd;
  option['jpy']  = atag[0].dataset.jpy;
  option['length']  = atag[0].dataset.length;
  option['weight']  = atag[0].dataset.weight;
  option['from']  = atag[0].dataset.from;
  atag[0].style.display = 'none';

  const iframe = document.createElement('iframe');
  iframe.src = '/api/' + '?' + std.encodeFormData(option);
  iframe.frameBorder = 0;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.marginHeight=0;
  iframe.marginWidth=0;
  iframe.scrolling = 'no';
  iframe.id = 'paypal-widget';
  // atagの隣にiframeを挿入
  atag[0].parentNode.insertBefore(iframe,atag[0]);
})();



