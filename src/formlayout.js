 const host = process.env.TOP_URL || 'https://localhost:4443';

jQuery(function($) {
  // ah-placeholder
  $('.add-placeholder').ahPlaceholder({
    placeholderColor: 'silver',
    placeholderAttr: 'placeholder',
    likeApple: true
  });

  // validate
  $('#user-sign-up').validate({
    groups: {
      usersname: 'first-name last-name'
    },
    errorPlacement: function(error, element) {
      if (element.attr('name') == 'first-name'
        || element.attr('name') == 'last-name' ) {
        error.appendTo('.multi-name-field');
      } else if (element.attr('name') == 'quantity') {
        error.appendTo('.multi-quantity-field');
      } else {
        error.insertAfter(element);
      }
    }
  });

  // exresize
  $('body').exResize({
    contentsWatch : true,
    callback: function(api){
      const bodySize = api.getSize();
      parent.postMessage({ bodySize }, host);
    }
  });
});

