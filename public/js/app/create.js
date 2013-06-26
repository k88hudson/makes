require(['locals', 'jquery', 'lib/login'], function (locals, $, login) {
  $('body').append("<div>HELLO</div>");
  login.setup({
    csrf: locals.csrf,
    onLogin: function(data){
      console.log(data);
    },
    onLogout: function() {
      console.log("logout");
    }
  });
});
