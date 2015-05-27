var request = require('request');
var querystring = require('querystring');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

var secret = "mysecret";

var user = function (api, next) {
  api.user = {};
  api.user._start  = function(api, next){
    console.log("User API started");
  };


  api.user.verifyHeaderToken = function(api, header_token, next) {

      console.log("Token was received: " + header_token)
  
      jwt.verify(header_token, secret, function(err, decodedToken) {
        if (err) {
          next(err);
        }
        console.log(decodedToken)
        if (decodedToken !== undefined) {
          console.log(decodedToken.username)
        } 
        else {
          console.log("Token is null, must be expired")
          decodedToken = "Expired";
        }
        next (false, decodedToken);
      });
     
  };

  api.user.verifyToken = function(api, connection, next) {

      console.log("Token was received: " + connection.params.token)
  
      jwt.verify(connection.params.token, secret, function(err, decodedToken) {
        if (err) {
          next(err);
        }
        console.log(decodedToken)
        if (decodedToken !== undefined) {
          console.log(decodedToken.username)
        } 
        else {
          console.log("Token is null, must be expired")
          decodedToken = "Expired";
        }
        console.log("Returning decodedToken")
        next (false, decodedToken);
      });
     
  };

  /***************** Search for questions ****************************/
  api.user.authenticate = function(api, connection, next) {

    var token = null;
    console.log("username:" + connection.params.username)

    password_attempt_hash = crypto.createHash('sha256').update(connection.params.password).digest('hex');

    //Find the User Attempting to Login
    api.mongo.userFind(api, connection, function(err, result) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }  

      var password_store_hash = result[0].password
      console.log("password Stored:" + password_store_hash)
      console.log("password Attempted:" + password_attempt_hash)

      //Good Password
      if (password_attempt_hash === password_store_hash) {  
        
        //Create Info to put in the Token
        var profile = {
          username: connection.params.userName
        }

        //Create the Token
        token = jwt.sign(profile, secret, { expiresInMinutes: 60*5 });

        //Return the Token to the user
        next (false, token);
      }
      
      //Bad password
      else {
        
        next (false, token);
      }
        
    });
  };  


  api.user._stop =  function(api, next){
    next();
  };

  next();
}

/////////////////////////////////////////////////////////////////////
// exports
exports.user = user;
