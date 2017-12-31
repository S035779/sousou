<?php
/*
Plugin Name: PayPal Shortcode
Plugin URI: https://www.example.com/
Descrioption: Generator of shortcode for PayPal Payment.
Author: Marimo Design.,Inc.
Version: 1.0
Author URI: https://www.example.com/
*/

function display_paypal_payment($arr, $content="") {
  $def = array(
    'language' => 'jp',
    'usd' => 600,
    'jpy' => 57000,
    'length' => 60,
    'weight' => 30,
    'from' => '東京都',
  );
  
  $opt = shortcode_atts($def, $arr);
  
  $content = preg_replace('/[\r\n]/', '', $content);
  $content = preg_replace("/'/", "\\\\", $content);

  ob_start();
?>
<div class="buynow">
  <a href="/" target="blank" class="paypal-widget"
    data-language="<?php echo $opt['language']; ?>"
    data-usd="<?php echo $opt['usd']; ?>"
    data-jpy="<?php echo $opt['jpy']; ?>"
    data-length="<?php echo $opt['length']; ?>"
    data-weight="<?php echo $opt['weight']; ?>"
    data-from="<?php echo $opt['from']; ?>"
  >This site is here!</a>
  <script src="/assets/js/widget.js"></script>
</div>
<?php  
  return ob_get_clean();
}
add_shortcode('show_paypal_payment', 'display_paypal_payment');
