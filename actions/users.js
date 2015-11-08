exports.userAdd = {
  name: "userAdd",
  description: "I register a new user",
  inputs: {
    required: ['username', 'password', 'firstname', 'lastname', 'email', 'zipcode', 'city'],
    optional: ['company_ind', 'company_name', 'contact_phone'],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

      api.mongo.userAdd(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.users = users;
      next(connection, true);
    });
  }
};

exports.usersList = {
  name: "usersList",
  description: "I list all the users",
  inputs: {
    required: [],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      api.mongo.usersList(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.users = users;
      next(connection, true);
    });
  }
};

exports.userListLite = {
  name: "userListLite",
  description: "I list all the users in a lite fashion",
  inputs: {
    required: [],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      api.mongo.usersListLite(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.users = users;
      next(connection, true);
    });
  }
};


exports.usersDelete = {
  name: "usersDelete",
  description: "I Delete all the users",
  inputs: {
    required: [],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      api.mongo.usersDelete(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.users = users;
      next(connection, true);
    });
  }
};

exports.usersDeleteID = {
  name: "usersDeleteID",
  description: "I Delete a user",
  inputs: {
    required: ['id'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      api.mongo.usersDeleteID(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.users = users;
      next(connection, true);
    });
  }
};


exports.userEdit = {
  name: "userEdit",
  description: "I edit a user profile",
  inputs: {
    required: ['username', 'firstname', 'lastname', 'email', 'zipcode', 'city'],
    optional: ['company_ind', 'company_name', 'contact_phone'],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      //console.log(connection.parameters)

      /***** This function requires Security *******/
      console.log("Token: " + connection.rawConnection.req.headers.authorization)
      //Assign Token from Header into Token Variable
      var token = connection.rawConnection.req.headers.authorization

      //Verify Token from the header
      api.user.verifyHeaderToken(api, token, function(err, token) {
        console.log("Returning: " + token);
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        console.log(token.username + " is tryng to edit a profile")

        api.mongo.userEdit(api, connection, token.username, function(err, users) {
          if (err) {
            connection.response.errors = err;
            next(connection, false);
          }
          if (users === "Unauthorized") {
              console.log("Returning Unauthorized")
              connection.response = "Unauthorized"
              connection.rawConnection.responseHttpCode = 403;
              next(connection, true);
            }
          else {
            connection.response = users;
            connection.rawConnection.responseHttpCode = 200;
            next(connection, true);
          }
        });
      }); 
  }
};


exports.userPasswordEdit = {
  name: "userPasswordEdit",
  description: "I edit a user password",
  inputs: {
    required: ['username', 'password'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      console.log(connection.parameters)
      /***** This function requires Security *******/
      console.log("Token: " + connection.rawConnection.req.headers.authorization)
      //Assign Token from Header into Token Variable
      var token = connection.rawConnection.req.headers.authorization

       //Verify Token from the header
      api.user.verifyHeaderToken(api, token, function(err, token) {
        console.log("Returning: " + token);
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        console.log(token.username + " is tryng to update a password")
        console.log("TEST")

        api.mongo.userPasswordEdit(api, connection, token.username, function(err, users) {
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        if (users === "Unauthorized") {
            console.log("Returning Unauthorized")
            connection.response = "Unauthorized"
            connection.rawConnection.responseHttpCode = 403;
            next(connection, true);
          }
        else {
          connection.response = users;
          next(connection, true);
        }
      });
    });
  }
};

exports.userProfileList = {
  name: "userProfileList",
  description: "I list all the full profile of a user",
  inputs: {
    required: ['username'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

       /***** This function requires Security *******/
      console.log("Token: " + connection.rawConnection.req.headers.authorization)
      //Assign Token from Header into Token Variable
      var token = connection.rawConnection.req.headers.authorization

      if (!token) {
        console.log("No token")
        connection.response = "Unauthorized"
        connection.rawConnection.responseHttpCode = 403;
        next(connection, true);
        return;
      }

      //Verify Token from the header
      api.user.verifyHeaderToken(api, token, function(err, token) {
        console.log("Returning: " + token);
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        
        console.log(token.username + " is tryng to load the full profile")
        
        

        api.mongo.userFind(api, connection, token.username, function(err, users) {
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        if (users === "Unauthorized") {
            console.log("Returning Unauthorized")
            connection.response = "Unauthorized"
            connection.rawConnection.responseHttpCode = 403;
            next(connection, true);
          }
        else {
          connection.response.users = users;
          next(connection, true);
        }
      });
    });
  }
};

exports.userProfileLite = {
  name: "userProfileLite",
  description: "I list all the lite profile of a user",
  inputs: {
    required: ['username'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      api.mongo.userProfileLite(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.users = users;
      next(connection, true);
    });
  }
};

exports.userAuthenticate = {
  name: "userAuthenticate",
  description: "I Authenticate Users",
  inputs: {
    required: ['username', 'password'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

      api.user.authenticate(api, connection, function(err, token) {
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        
        if (token) {
          if (token.length > 0) {
           connection.response.token = token; 
          }
        }
        else {
          console.log("Invalid Credentials")  
          connection.rawConnection.responseHttpCode = 401;
          connection.response.error = "Invalid Credentials";
        }
      
       next(connection, true);
      });
  }
};

exports.userVerifyToken = {
  name: "userVerifyToken",
  description: "I Verify Tokens and Return username",
  inputs: {
    required: ['token'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

      console.log("Verifying Token");
      //console.log(connection);

      api.user.verifyToken(api, connection, function(err, token) {
        
        if (err) {
          connection.response.errors = err;
          //You want to return if token is expired, so client can handle
          next(connection, true);   
        }
        else {
          console.log("Returning: " + token);  
          connection.response.token = token;
          next(connection, true);
        }
    });

  }
};



exports.forgotPassword = {
  name: "forgotPassword",
  description: "I Reset Passwords",
  inputs: {
    required: ['email'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

      console.log("Resetting Password");
      //console.log(connection);

      api.mongo.forgotPassword(api, connection, function(err, mail) {
        console.log("returning")
        
        if (err) {
          connection.response.errors = err;
          //You want to return if token is expired, so client can handle
          next(connection, true);   
        }
        if (mail.error) {
          console.log("Mail Error")
          connection.response.error = mail.error;
          next(connection, true);
        }
        else {
          console.log(mail.email)
          console.log(mail.session) 
          //connection.response.token = mail;
          connection.response.message = "Success"
          next(connection, true);
        }

        //Send Email to User
        api.notify.sendForgotPassword(api, connection, mail, function(err, result) {
          console.log(result)
        });

    });

  }
};


exports.resetPassword = {
  name: "resetPassword",
  description: "I reset a user password",
  inputs: {
    required: ['token', 'password'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

    var token = connection.params.token;
    console.log(token)

   // Check that Token was provided and return immediately if not present
    if (!token || token == 'undefined') {
      console.log("No token")
      connection.response = "no session id was provided"
      connection.rawConnection.responseHttpCode = 403;
      next(connection, true);
      return;
    }

    

      //Verify Token (SessionID) to find out which username is invoking request
      api.user.verifyHeaderToken(api, token, function(err, token) {
        try {
          console.log("Callback - verifyHeaderToken")
          console.log("Returning: " + token);
          if (err) {
            console.log("verifyHeaderToken err" )
            //connection.rawConnection.responseHttpCode = 405;
            //connection.response.errors = err;
            //next(connection, true);
            throw err;
           
          }

          else if (!token || token == 'undefined') {
            console.log("Token Verification Failed")
            connection.response = "Token Verification Failed"
            connection.rawConnection.responseHttpCode = 403;
            next(connection, true);
            return;
          }
          else {

            try {

              //tokenError == "valid";
              if (!token.username) {
                console.log(token.username)
                console.log("Invalid")
                //tokenError = "Invalid"
                throw "SESSIONID Invalid";
              }

              console.log(token.username + " is tryng to reset a password")
              api.mongo.userPasswordEdit(api, connection, token.username, function(err, users) {
                if (err) {
                  connection.response.errors = err;
                  next(connection, false);
                }
                console.log(users)
                //console.log(tokenError)
                if (users === "Unauthorized") {
                  console.log("Returning Unauthorized")
                  connection.response = "Unauthorized"
                  connection.rawConnection.responseHttpCode = 403;
                  next(connection, true);
                }
                else {
                  connection.response = users;
                  next(connection, true);
                }
              });
             
            }
            catch (err) {
              console.log("token username could not be found")
              connection.response = "SessionID Invalid"
              connection.rawConnection.responseHttpCode = 401;
              next(connection, true);
              console.log("Returned Catch 401 Next")
            }
          } // End ELSE
          console.log("Done")
        }
        catch (err) {
          console.log("Exception during verifyHeaderToken:" + err)
        }

      });

    


     
  }
};
