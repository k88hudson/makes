var express = require('express'),
    path = require('path'),
    http = require('http'),
    habitat = require('habitat'),
    knox = require('knox'),
    nunjucks = require('nunjucks'),
    makeAPI = require('makeapi'),
    expressPersona = require('express-persona');

habitat.load();

var app = express(),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'views')), { autoescape: true }),
    env = new habitat(),
    checkConfig = require('./lib/checkConfig')(env),
    make = makeAPI.makeAPI({
      apiURL: env.get('MAKE_ENDPOINT'),
      auth: env.get('MAKE_AUTH')
    }),
    s3 = knox.createClient({
      key: env.get("S3_KEY"),
      secret: env.get("S3_SECRET"),
      bucket: env.get("S3_BUCKET")
    }),
    middleware = require('./lib/middleware')(app, make, s3),
    routes = require('./routes')(app, s3, make);

app.configure(function(){
  app.set('port', env.get('PORT'));
  nunjucksEnv.express(app);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use( express.cookieParser() );
  app.use( express.cookieSession({
    key: "makes.sid",
    secret: env.get( "SESSION_SECRET" ),
    cookie: {
      maxAge: 2678400000,
      secure: !!env.get( "FORCE_SSL" )
    },
    proxy: true
  }));
  app.use(express.csrf());
  app.use(express.methodOverride());

  app.locals({
    hostname: env.get( "HOSTNAME" ),
    makeEndpoint: env.get( "MAKE_ENDPOINT" ),
    personaAudience: env.get( "PERSONA_AUDIENCE" ),
  });

  app.use(function( req, res, next ) {
    res.locals({
      email: req.session.email || '',
      csrf: req.session._csrf
    });
    next();
  });

  app.use(app.router);
  app.use(middleware.errorHandler);
  app.use(require('stylus').middleware(path.join(__dirname, '/public')));
  app.use(express.static(path.join(__dirname, '/public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Routes yo
app.get('/', routes.index);
app.get('/:id', middleware.getMakeById, middleware.setEmbedUrl, routes.details);
app.get('/details/:subdomain/:slug', middleware.getMakeByUrl, middleware.setEmbedUrl, routes.details);


//Config
app.get('/js/locals.js', routes.locals);

expressPersona( app, { audience: env.get('PERSONA_AUDIENCE') });

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
