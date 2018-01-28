import std from 'Utilities/stdutils';
import jQuery from 'jquery';
//import {} from 'jquery-jpostal-ja';
const host = process.env.TOP_URL || 'https://localhost:4443';

jQuery(function($) {
  const { language } = std.decodeFormData(
    $(location).attr('search').split('?')[1], '&', '=', true);
  const isLangJp = language === 'jp';

  // jpostal-ja
  //$('#postal_code').jpostal({   
  //  postcode : [
  //    '#postal_code'
  //  ],
  //  address : {
  //    '#state':           '%3',
  //    '#city':            '%4',
  //    '#line1':           '%5',
  //    '#line2':           '%6',
  //    '#recipient_name':  '%7'
  //  }
  //});

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
      usersname: 'first-name last-name'
      , quantitys: 'quantity currency'
    },
    errorPlacement: function(error, element) {
      if (element.attr('name') == 'first-name'
        || element.attr('name') == 'last-name' ) {
        error.appendTo('.multi-name-field');
      } else if (element.attr('name') == 'quantity'
        || element.attr('name') == 'currency') {
        error.appendTo('.multi-quantity-field');
      } else {
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

