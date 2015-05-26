var request = require('request');
var querystring = require('querystring');
var jwt = require('jsonwebtoken');

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
    console.log("username:" + connection.params.userName)

    var authbody = '{ "api_key":"' + api.user.api_key +'", "username":"' + connection.params.userName + '", "password":"' + connection.params.password + '"}'

    request.post({
      headers: {'content-type' : 'application/json'},
      url:     api.user.auth_url,
      body:    authbody
    }, function(err, response, auth){

      console.log(auth)

      if (err) {
        console.log('ERROR: '+JSON.stringify(err));
        next("Server Error", true)
      }

      authObj = JSON.parse(auth)
      if (authObj.error) {
        console.log('an error was returned')
        //next (true, token);
        next (false, token);
      }

      else if (auth) {
        var profile = {
          username: connection.params.userName
        }
        token = jwt.sign(profile, secret, { expiresInMinutes: 60*5 });
   
        //Return the Token to the user
        next (false, token);

        var userObject = JSON.parse(auth)
        console.log(userObject)
        //console.log(userObject.user.email)
        //console.log(userObject.user.first_name)
        //console.log(userObject.user.last_name)

        //Add Create Date and Last Login
        var now = new Date(); 
        userObject.user.created_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();
        userObject.user.lastLogin = now.toLocaleDateString() + " " + now.toLocaleTimeString();
        console.log(userObject)
        
        //console.log(JSON.stringify(user));
        console.log("Copy over to Mongo if necessary")

        api.mongo.userFind(api, connection, function(err, result) {
          console.log("6 - Callback returned for Mongo  userFind")
          if (err) {
            connection.response.errors = err;
            next(connection, false);
          }  
          console.log(result)
          if (result.length === 0) {
            console.log("7A - Adding to Mongo")
            api.mongo.userAdd(api, connection, userObject, function(err, user) {
              console.log("8 - CallBack from Adding to Mongo")
        
              if (err) {
                connection.response.errors = err;
                next(connection, false);
              }
              console.log("User was added: " + user)
            });
          } 
          else {
            console.log("user already exists in Mongo")
            console.log(user)
            console.log("Doing Last Login Time Update")

            api.mongo.userUpdateLastLoginTime(api, connection, function(err, user) {
              console.log("9 - CallBack from Updating LastLoginTime in Mongo")
              if (err) {
                connection.response.errors = err;
                next(connection, false);
              }
            });
          }
        });
      }
      
      else {
        console.log('unknown error!');
        next (true, token);
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
