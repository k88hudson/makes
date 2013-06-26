module.exports = function (app, make, s3) {
  var Validator = require("validator").Validator;
  var check = require("validator").check;
  var url = require("url");

  // Set up custom validation for Mongo objIDs
  Validator.prototype.isMakeID = function() {
    if ( !this.str.match(/^[0-9a-fA-F]{24}$/) ) {
      this.error(this.msg ||this.str + ' is not a valid makeID.');
    }
    return this;
  };

  // Generate our s3 urls
  function generateS3Url(id) {
    return s3.url("_id/" + id);
  }

  return {

    // Basic error handling
    errorHandler: function (err, req, res, next) {
      var status = err.status || 500;
      console.log( "Error:", err );
      res.send(status, err);
    },

    // Checking the ID's type
    checkID: function (req, res, next) {
      if (check(req.params.id).isMakeID()) {
        next();
      }
    },

    // Getting makeID - param or req.makeID
    getMakeById: function(req, res, next) {
      var makeID = req.params.id || req.makeID;
      make.id(req.params.id).then( function(err, data) {
        req.makeData = data[0];
        if (!req.makeData) {
          return next("No make was found - getbyID");
        }
        next();
      });
    },

    // Get special make
    getMakeByUrl: function(req, res, next) {
      var makeURL = req.protocol + "://" + req.get('host') + req.url;
      make.url(makeURL).then( function(err,data) {
        req.makeData = data[0];
        if (!req.makeData) {
          return next("No make was found -getbyURL");
        }
        next();
      });
    },

    // Check if the URL is special or not, and add 'embedUrl' to the makeData accordingly
    setEmbedUrl: function(req, res, next) {
      if (!req.makeData) {
        return next("No make was found -setEmbed");
      }
      // Does this have a special url on our hostname?
      if (app.locals.hostname === url.parse(req.makeData.url).hostname) {
        req.makeData.embedUrl = generateS3Url(req.makeData._id);
      } else {
        req.makeData.embedUrl = req.makeData.url;
      }
      next();
    }

  };
};
