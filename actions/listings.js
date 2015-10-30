exports.listingAdd = {
  name: "listingAdd",
  description: "I create a new listing",
  inputs: {
    required: ['username', 'title', 'description', 'price', 'location', 'zipcode', 'contact_email', 'category'],
    optional: ['make', 'model', 'dimensions','condition', 'contact_phone', 'delivery', 'unit', 'payment'],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

      api.mongo.listingAdd(api, connection, function(err, listing) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.listing = listing;
      next(connection, true);
    });
  }
};

exports.listingRenew = {
  name: "listingRenew",
  description: "I renew a listing",
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
       //Verify Token from the header
      api.user.verifyHeaderToken(api, token, function(err, token) {
        console.log("Returning: " + token);
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        console.log(token.username + " is tryng to renew a listing")

        api.mongo.listingRenew(api, connection,token.username, function(err, listing) {
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        if (listing === "Unauthorized") {
          console.log("Returning Unauthorized")
          connection.response = "Unauthorized"
          connection.rawConnection.responseHttpCode = 403;
          next(connection, true);
        }
        else {
          connection.response.listing = listing;
          next(connection, true);
        }
      });
    });
  }
};

exports.listingEdit = {
  name: "listingEdit",
  description: "I edit a listing",
  inputs: {
    required: ['username', 'title', 'description', 'price', 'location', 'zipcode', 'contact_email', 'category'],
    optional: ['make', 'model', 'dimensions','condition', 'contact_phone', 'delivery', 'unit', 'payment'],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

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
        console.log(token.username + " is tryng to update a listing")
      
        api.mongo.listingEdit(api, connection, token.username, function(err, listing) {
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        if (listing === "Unauthorized") {
            console.log("Returning Unauthorized")
            connection.response = "Unauthorized"
            connection.rawConnection.responseHttpCode = 403;
            next(connection, true);
          }
        else {
        connection.response.listing = listing;
        next(connection, true);
      }
      });
    });
  }
};


exports.listingImageRemove = {
  name: "listingImageRemove",
  description: "I remove a listing image",
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
       //Verify Token from the header
      api.user.verifyHeaderToken(api, token, function(err, token) {
        console.log("Returning: " + token);
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        console.log(token.username + " is tryng to remove an image from a listing")

        api.mongo.listingImageRemove(api, connection, token.username, function(err, listing) {
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        if (listing === "Unauthorized") {
            console.log("Returning Unauthorized")
            connection.response = "Unauthorized"
            connection.rawConnection.responseHttpCode = 403;
            next(connection, true);
        }
        else {
          connection.response.listing = listing;
          next(connection, true);
        }
      });
    });
  }
};

exports.getListing = {
  name: "getListing",
  description: "I get a listing by ID",
  inputs: {
    required: ['id'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

    api.mongo.getListing(api, connection, function(err, listing) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.listing = listing;
      next(connection, true);

      //Update the View Count for the Question
      api.mongo.updateViewCount(api, connection);
      
    }); 
  }
};

exports.getAllListing = {
  name: "getAllListing",
  description: "I get all listings",
  inputs: {
    required: [],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

    api.mongo.getAllListing(api, connection, function(err, listing) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.listing = listing;
      next(connection, true);
      
    }); 
  }
};

exports.getMyListings = {
  name: "getMyListings",
  description: "I get your listings",
  inputs: {
    required: ['username'],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){

    api.mongo.getMyListings(api, connection, function(err, listing) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      connection.response.listing = listing;
      next(connection, true);

    }); 
  }
};

exports.listingsDelete = {
  name: "listingsDelete",
  description: "I Delete all the listings",
  inputs: {
    required: [],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      api.mongo.listingsDelete(api, connection, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      next(connection, true);
    });
  }
};

exports.listingsDeleteID = {
  name: "listingsDeleteID",
  description: "I Delete a listing",
  inputs: {
    required: ['id'],
    optional: ['authorization'],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      /***** This function requires Security *******/
      console.log("Token: " + connection.params.authorization)
      //Assign Token from Header into Token Variable
      var token = connection.params.authorization
       //Verify Token from the header
      api.user.verifyHeaderToken(api, token, function(err, token) {
        console.log("Returning: " + token);
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        console.log(token.username + " is tryng to delete a listing") 
        api.mongo.listingsDeleteID(api, connection,token.username, function(err, listing) {
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        if (listing === "Unauthorized") {
          console.log("Returning Unauthorized")
          connection.response = "Unauthorized"
          connection.rawConnection.responseHttpCode = 403;
          next(connection, true);
          }
        else {
        next(connection, true);
        }
      });
    });
  }
};

exports.listingSearch = {
  name: "listingSearch",
  description: "I Search for relevant listings",
  inputs: {
    required: ['query', 'zip'],
    optional: ['category'],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
      api.mongo.listingSearch(api, connection, function(err, listings) {
        if (err) {
          connection.response.errors = err;
          next(connection, false);
        }
        connection.response.listing = listings
        //connection.response.status = 'success';
        next(connection, true);
        

      }); 
  }
};
