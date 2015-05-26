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

exports.userProfileList = {
  name: "userProfileList",
  description: "I list all the full profile of a user",
  inputs: {
    required: ['userName'],
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

exports.userAuthenticate = {
  name: "userAuthenticate",
  description: "I Authenticate Users",
  inputs: {
    required: ['userName', 'password'],
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
        console.log("Returning: " + token);
        if (err) {
          connection.response.errors = err;
          //You want to return if token is expired, so client can handle
          next(connection, true);   
        }

        connection.response.token = token;
        next(connection, true);
      });

  }
};


exports.sendFeedback = {
  name: "sendFeedback",
  description: "I send feedback to the admin",
  inputs: {
    required: ['message'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      api.notify.sendFeedback(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.status = users;
      next(connection, true);
    });
  }
};