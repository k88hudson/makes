define([ 'jquery', 'persona'],
  function( $ ) {

  var login = {
    setup: function( options ) {
      var noop = function(){};
      options = options || {};
      options.onLogin = options.onLogin || noop;
      options.onLogout = options.onLogOut || noop;

      $('.login').click(function(){
        navigator.id.request();
      });
      $('.logout').click(function(){
        navigator.id.logout();
      });

      navigator.id.watch({
        loggedInUser: null,
        onlogin: function(assertion) {
          $.ajax({
            type: "POST",
            url: "/persona/verify",
            headers: {
              "X-CSRF-Token": options.csrf
            },
            data: { assertion: assertion },
            success: function(data, status, xhr) {
              $('.login').hide();
              $('.logout').show();
              options.onLogin( data );
            },
            error: function(xhr, status, err) {
              $('.login').show();
              $('.logout').hide();
              navigator.id.logout();
              options.onLogout();
            }
          });
        },
        onlogout: function() {
          $('.login').show();
          $('.logout').hide();
          navigator.id.logout();
          options.onLogout();
        }
      });
    }
  };

  return login;

});
