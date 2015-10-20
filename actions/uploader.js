exports.action = {
  name: 'uploader',
  description: 'uploader',
  inputs: {
    //required: [], optional: ['file1', 'file2', 'key1', 'key2']
    required: [], optional: ['file1', 'file', 'id']
  }, 
  outputExample: null,
  run: function(api, connection, next){
    console.log("\r\n\r\n")
    console.log(connection.params);
    console.log("\r\n\r\n")
    console.log("Image Attributes")

    file_path = connection.params.file.path;
    console.log("file_path: " + file_path)
    // - public\listing_images\e71e02492637559fd656b464ec6dcbcb.jpg

    modified_path = file_path;  
    // - public\listing_images\e71e02492637559fd656b464ec6dcbcb.jpg

    connection.response.path = modified_path;
    console.log("modified_path: " + modified_path )

    console.log("ID: " + connection.params.id)
    // - ID: 55ecffbcf06be814344010df - this is the listing ID

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
      console.log(token.username + " is tryng to add an image to a listing")

      api.mongo.addImage(api, connection, modified_path, token.username, function(err, listing) {
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
          console.log("Added Image to Listing in Mongo")
          console.log("Calling Global Next(True)")
          next(connection, true);
        }
      });
    });
  }
};