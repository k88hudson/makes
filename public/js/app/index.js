require(['locals', 'jquery', 'lib/login'], function (locals, $, login) {
  $('body').append("<div>HELLO</div>");
  login.setup({
    onLogin: function(data){
      console.log(data);
    }
  });
});
