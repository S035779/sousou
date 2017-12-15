jQuery(function($) {
/*
	// minimalect
	$('#month').minimalect({
		placeholder: '1',
    onchange: function() {
      $('#month').trigger('change');
    }
	});

	$('#country_code').minimalect({
		placeholder: '日本',
    onchange: function() {
      $('#country_code').trigger('change');
    }
	});

	$('#quantity').minimalect({
		placeholder: '1',
    onchange: function() {
      $('#quantity').trigger('change');
    }
	});

	$('#payment').minimalect({
		placeholder: 'クレジットカード（PayPal）',
    onchange: function() {
      $('#payment').trigger('change');
    }
	});
*/
	// ah-placeholder
	$('.add-placeholder').ahPlaceholder({
		placeholderColor: 'silver', // プレースホルダーの文字色
		placeholderAttr: 'placeholder', // プレースホルダーに使用する文字の取得属性
		likeApple: true // プレースホルダーが消えるタイミングを入力が始まってからにするか
	});

	// validate
	$('#user-sign-up').validate({
		// ユーザー氏名の2フィールドを1つとして扱うオプション
		groups: {
			usersname: 'first-name last-name'
		},
		errorPlacement: function(error, element) {
			if (element.attr('name') == 'first-name' || element.attr('name') == 'last-name' ) {
				error.appendTo('.multi-field');
			} else {
				error.insertAfter(element);
			}
		}
	});
	
});
