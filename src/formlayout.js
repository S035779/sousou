import postal from 'Utilities/postCodeRegex';
const host = process.env.TOP_URL || 'https://localhost:4443';

jQuery(function($) {
  // ah-placeholder
  $('.add-placeholder').ahPlaceholder({
    placeholderColor: 'silver',
    placeholderAttr: 'placeholder',
    likeApple: true
  });

  // validate
  $.validator.addMethod("phone", function(value, element) {
    return this.optional(element)
      || /^[\d,-]+$/.test(value);
  }, "Please specify the correct phone number for your delivery");

  $.validator.addMethod('postal_code', function (value, element) { 
      return this.optional(element)
      || postal.regex($('[name=country_code]').val(), value)
  }, 'Please enter a valid postal code.');

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

  // exresize
  $('div#app').exResize({
    contentsWatch : true,
    callback: function(api){
      const app = api.getSize();
      parent.postMessage({ app }, host);
    }
  });
});

