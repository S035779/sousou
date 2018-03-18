# Souou

SANDBOX HOME PAGE    : https://www.sandbox.paypal.com/

GLOBAL SETTING

IPN NOTIFICATION     : ON
IPN NOTIFY URL       : http://example.com/api/payment/notify

PAYPAL EXPRESS SETTING

AUTO REDIRECT        : ON
REDIRECT URL         : http://example.com/dev/?page_id=91

WEBPAY PRO HOSTED SETTING

PRO HOSTED ENCODE    : WEB: UTF-8, IPN/LOG: UTF-8
AUTO REDIRECT        : ON
REDIRECT URL         : http://example.com/dev/?page_id=91

BUILD & RELEASE

BUILD                : yarn run build
RELEASE              : sudo yarn run release
START                : sudo systemctl restart sousou

/etc/apache2/conf.d/r_proxy.conf

# cat r_proxy.conf
<IfModule mod_proxy.c>
  ProxyRequests Off
  <Proxy *>
    Require all granted
  </Proxy>
  ProxyPass         /api/ http://localhost:8081/api/ retry=0 timeout=300 
  ProxyPassReverse  /api/ http://localhost:8081/api/
</IfModule>

EOL
