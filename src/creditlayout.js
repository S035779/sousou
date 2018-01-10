const getElm = id => document.getElementById(id);
const getSize = id => ({
  width:    getElm(id).contentWindow.document.documentElement.scrollWidth
  , height: getElm(id).contentWindow.document.documentElement.scrollHeight
});
const setSize = (element, width, height) => {
  element.setAttribute('width', width + 'px');
  element.setAttribute('height', height + 'px');
};

jQuery(function($) {
  // exresize
  $('#credit').exResize(function(api){
    console.log('exResize!!');
    //const credit = getSize('credit');
    //console.log(credit);
    //setSize(getElm('credit'), credit.width, credit.height);
  });

  $(window).resize(function(){
    console.log('resize!!');
    //const credit = getSize('credit');
    //console.log(credit);
    //setSize(getElm('credit'), credit.width, credit.height);
  });
});

$(window).load(function(){
  //setSize(getElm('credit'), 590, 560);
});
