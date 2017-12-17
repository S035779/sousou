jQuery(function($) {
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
			if (element.attr('name') == 'first-name'
      || element.attr('name') == 'last-name' ) {
				error.appendTo('.multi-field');
			} else 
			if (element.attr('name') == 'quantity') {
				error.appendTo('.milti-field');
			} else error.insertAfter(element);
		}
	});
	
});
