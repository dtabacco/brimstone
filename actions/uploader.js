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
    //console.log(connection.params.file1.path)
    //console.log(connection.params.file1.name)
    //console.log(connection.params.file1.type)

    //connection.response.name = connection.params.file1.name
    //file_path = connection.params.file1.path
    file_path = connection.params.file.path
    
    //1
    //modified_path = file_path.replace("public\\listing_images\\", "listing_images/")

    modified_path = file_path  

    connection.response.path = modified_path
    console.log("modified_path: " + modified_path )

    console.log("ID: " + connection.params.id)

    api.mongo.addImage(api, connection, modified_path, function(err, users) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      
      console.log("Added Image to Listing in Mongo")
      next(connection, true);
    });
  }
};