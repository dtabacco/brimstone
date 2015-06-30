exports.listingAdd = {
  name: "listingAdd",
  description: "I create a new listing",
  inputs: {
    required: ['username', 'title', 'description', 'price', 'location', 'zipcode'],
    optional: ['make', 'model', 'dimensions','condition'],
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