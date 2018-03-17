# Souou

SANDBOX HOME PAGE   : https://www.sandbox.paypal.com/
RECEIVEIPN MESSAGE  : http://example.com/api/payment/notify
PRO HOSTED ENCODE   : WEB: UTF-8, IPN/LOG: UTF-8
AUTO REDIRECT       : ON
REDIRECT URL        : http://example.com/dev/
IPN NOTIFICATION    : ON
BUILD               : yarn run build
RELEASE             : sudo yarn run release
START               : sudo systemctl restart sousou

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

