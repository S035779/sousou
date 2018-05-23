import std from 'Utilities/stdutils';
import jQuery from 'jquery';
import {} from 'jquery-jpostal-ja';
const host = process.env.TOP_URL || 'https://localhost:4443';

jQuery(function($) {
  const { language } = std.decodeFormData(
    $(location).attr('search').split('?')[1], '&', '=', true);
  const isLangJp = language === 'jp';

  // jpostal-ja
  $('#postal_code').jpostal({   
    postcode :  [ '#postal_code' ]
    , address : { '#address1': '%3 %4 %5', '#address2': '%6' }
  });

  // ah-placeholder
  $('.add-placeholder').ahPlaceholder({
    placeholderColor: 'silver',
    placeholderAttr: 'placeholder',
    likeApple: true
  });

  // validate
  $.validator.addMethod('email', function(value, element) {
    return this.optional(element)
      || std.regexEmail(value);
  }, "Please specify the correct email address.");

  $.validator.addMethod('phone', function(value, element) {
    return this.optional(element)
      || std.regexNumber(value);
  }, "Please specify the correct phone number.");

  $.validator.addMethod('postal_code', function (value, element) { 
      return this.optional(element)
      || std.regexZip(value, $('[name=country_code]').val())
  }, 'Please specify thie correct postal code.');

  $('#user-sign-up').validate({
    rules: {
      phone: {
        phone: true
      },
      email: {
        email: true
      },
      postal_code: {
        postal_code: true
      }
    },
    groups: {
      //usersname: 'first-name last-name',
      quantitys: 'quantity currency'
    },
    errorPlacement: function(error, element) {
      //if (element.attr('name') == 'first-name'
      //  || element.attr('name') == 'last-name' ) {
      //  error.appendTo('.multi-name-field');
      //} else
      if (element.attr('name') == 'postal_code'
        || element.attr('name') == 'address1' ) {
        error.appendTo('.multi-postal-field');
      } else
      if (element.attr('name') == 'quantity'
        || element.attr('name') == 'currency') {
        error.appendTo('.multi-quantity-field');
      }
      else {
        error.insertAfter(element);
      }
    }
  });

  $.extend($.validator.messages, {
    required:     isLangJp
      ? "必須項目です" : 'This field is required.',
    email:        isLangJp
      ? "メールアドレスを入力してください"
      : 'Please specify the correct email address.',
    phone:        isLangJp
      ? "有効な電話番号を入力してください。"
      : 'Please specify the correct phone number.',
    postal_code:  isLangJp
      ? "有効な郵便番号を入力してください。"
      : 'Please specify thie correct postal code.'
  });

  // exresize
  $('#app').exResize({
    contentsWatch : true,
    callback: function(api){
      const app = api.getSize();
      parent.postMessage({ app }, host);
    }
  });

});

// browser name
$.extend({
  browser_group: (function(){
    var appName = window.navigator.appName.toLowerCase();
    var browser_string = "unknown"

    if (appName.indexOf("microsoft") > -1) {
      browser_string = "MS";
    } else {
      browser_string = "Others";
    }
    return browser_string;
  })(),
  browser_name: (function(){
    var userAgent = window.navigator.userAgent.toLowerCase();
    var appVersion = window.navigator.appVersion.toLowerCase();
    var browser_string = "unknown"

    if (userAgent.indexOf("msie") > -1) {
      if (appVersion.indexOf("msie 6.0") > -1) {
        browser_string = "IE6";
      }
      else if (appVersion.indexOf("msie 7.0") > -1) {
        browser_string = "IE7";
      }
      else if (appVersion.indexOf("msie 8.0") > -1) {
        browser_string = "IE8";
      }
      else if (appVersion.indexOf("msie 9.0") > -1) {
        browser_string = "IE9";
      }
      else if (appVersion.indexOf("msie 10.0") > -1) {
        browser_string = "IE10";
      }
    }
    else if (appVersion.indexOf("trident/7.0") > -1) {
      browser_string = "IE11";
    }
    else if (userAgent.indexOf("edge") > -1) {
      browser_string = "Edge";
    }
    else if (userAgent.indexOf("firefox") > -1) {
      browser_string = "Firefox";
    }
    else if (userAgent.indexOf("opera") > -1) {
      browser_string = "Opera";
    }
    else if (userAgent.indexOf("chrome") > -1) {
      browser_string = "Chrome";
    }
    else if (userAgent.indexOf("safari") > -1) {
      browser_string = "Safari";
    }
    return browser_string;
  })()
});
