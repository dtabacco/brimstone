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
      api.mongo.userFind(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.users = users;
      next(connection, true);
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
