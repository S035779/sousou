const getSize = () => window.document.documentElement.scrollHeight;

const post = message => {
  parent.postMessage(message, 'https://localhost:4443');
};

$('body').exResize(function(){
  console.log('exResize!!');
  console.log(getSize());
  post(getSize());
});

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
});

