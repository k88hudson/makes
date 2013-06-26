module.exports = function (env) {
  var warnings = {
    "S3_BUCKETY": "You need an s3 bucket to publish :("
  };

  for ( w in warnings ) {
    if ( warnings.hasOwnProperty(w) ) {
      console.log( "**********************" );
      console.log( "WARNING ******: " + w + ": " + warnings[ w ] );
      console.log( "**********************" );
    }
  }
};
