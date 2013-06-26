
module.exports = function (app, s3, make) {

  function staticPage( view ) {
    return function( req, res ) {
      res.render( view + ".html", { view: view } );
    }
  }

  function generateUrl( subdomain, slug ) {
    return app.locals.hostname + "/" + subdomain + "/" + slug;
  }

  return {
    index: staticPage("index"),
    details: function (req, res) {
      res.render("details.html", req.makeData);
    },
    locals: function (req, res) {
      res.set('Content-Type', 'application/javascript');
      res.render('js/locals.js', {
        csrf: res.locals.csrf
      });
    }
  };
};
