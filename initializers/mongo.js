var mongojs = require('mongojs');
var mongodb = require('mongodb');
var crypto = require('crypto');

var mongo = function (api, next) {
  api.mongo = {};
  api.mongo._start  = function(api, next){
      console.log("Mongo_start");
      api.mongo.url = api.config.mongo.url;
      api.mongo.port = api.config.mongo.port;
      api.mongo.database = api.config.mongo.database;
      api.mongo.collections = api.config.mongo.collections;
      api.mongo.connString = api.mongo.url + ":" + api.mongo.port + '/' + api.mongo.database;
      api.mongo.db = mongojs(api.mongo.connString,api.mongo.collections);

      var query = {username:'test'}
      api.mongo.db.users.find(query, function doneSearching(err, results) {
        if (err) { console.log(err);}
        
        console.log("Mongo_started:  Connected to " + api.mongo.database );
        });

      next();
  };


  /***************** Add a User ****************************/
  api.mongo.userAdd = function(api, connection, next) {

    //Capture the Date/Time of the Registration
    var now = new Date(); 
    var created_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();

    //Hash Password before storing
    hashed_password = crypto.createHash('sha256').update(connection.params.password).digest('hex');

    //Create JSON Entry to Add to MongoDB
    var entry = { username:connection.params.username, password:hashed_password, firstname:connection.params.firstname, lastname:connection.params.lastname, 
                email:connection.params.email, zipcode:connection.params.zipcode, company_ind:connection.params.company_ind, company_name:connection.params.company_name, 
                city:connection.params.city, contact_phone:connection.params.contact_phone, created_at:created_at, last_login:created_at};

    console.log("Printing Entry as it will be registered")
    console.log(entry)

   //Insert JSON Entry to Add to MongoDB
    api.mongo.db.users.insert(entry, {safe : true}, function doneCreatingUserEntry(err, results) {
      if (err) { 
         next(err, false); 
      }
      next(err, results);  

    });
  };

  /***************** Get All Users ****************************/
  api.mongo.usersList = function(api, connection, next) {

    var query = {}

    api.mongo.db.users.find(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
      next(err, results);   
    });
  };  

  /***************** Delete All Users ****************************/
  api.mongo.usersDelete = function(api, connection, next) {

    var query = {}

    api.mongo.db.users.remove(query, function doneDeleting(err, results) {
      if (err) { 
        next(err, false); 
      } 
      connection.response.content = results; 
      next(err, true);   
    });
  };


  /***************** Delete All Users ****************************/
  api.mongo.usersDeleteID = function(api, connection, next) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.id);
    var query = { "_id":o_id};

    api.mongo.db.users.remove(query, function doneDeleting(err, results) {
      if (err) { 
        next(err, false); 
      } 
      next(err, true);   
    });
  };

  
  /***************** Search for User and return lite profile ****************************/
  api.mongo.userProfileLite = function(api, connection, next) {

    var query = {username:connection.params.username}
    var projection = {email:1, zipcode:1, city:1, contact_phone:1}

    api.mongo.db.users.find(query, projection, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 

      console.log(results)
      next(err, results);   
    });
  };

  /***************** Search for User ****************************/
  api.mongo.userFind = function(api, connection, next) {

    var query = {username:connection.params.username}

    var projection = {username:1, firstname:1, lastname:1, city:1, email:1, zipcode:1, contact_phone:1, company_ind:1, company_name:1, created_at:1, last_login:1}

    api.mongo.db.users.find(query, projection, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
      //connection.response.content = results; 
      //console.log(results)
      next(err, results);   
    });
  };

    /***************** Search for User ****************************/
  api.mongo.userGetPassword = function(api, connection, next) {

    var query = {username:connection.params.username}

    var projection = {password:1}

    api.mongo.db.users.find(query, projection, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
      //connection.response.content = results; 
      //console.log(results)
      next(err, results);   
    });
  };


  
  /***************** Edit User Password ****************************/
  api.mongo.userPasswordEdit = function(api, connection, token_user, next) {

      var query = {username:connection.params.username}

      //Find User who's answer was accepted
      api.mongo.db.users.find(query, function doneSearching(err, results) {
        if (err) { 
            next(err, false); 
        } 

        console.log("Account getting updated " + results[0].username)

        //Hash Password before storing
        hashed_password = crypto.createHash('sha256').update(connection.params.password).digest('hex');

        //Copy all users attributes so they are not lost in update and increment accepted answer count
        for (var i = 0; i < results.length; i++) {
          o_id = results[i]._id;
          username = results[i].username;
          password = hashed_password;
          firstname = results[i].firstname;
          lastname = results[i].lastname;
          email = results[i].email;
          zipcode = results[i].zipcode;
          city = results[i].city;
          contact_phone = results[i].contact_phone;
          company_ind = results[i].company_ind;
          company_name = results[i].company_name;
          created_at = results[i].created_at;
          last_login =  results[i].last_login;
        }


        //Create JSON Entry to update in MongoDB
        entry = {username:username, password:password, firstname:firstname, lastname:lastname, 
                email:email, zipcode:zipcode, contact_phone:contact_phone, city:city, company_ind:company_ind, company_name:company_name, created_at:created_at, last_login:last_login}; 
  
        if (token_user === username) {

          //Update MongoDB
          api.mongo.db.users.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingScore(err, results) {
            if (err) { 
              next(err, false); 
            } 
            api.mongo.db.users.find(query, function doneSearching(err, results) {
              if (err) { 
                  next(err, false); 
              } 
              next(err, results); 
            });
          });
        }

        else {
          console.log("Not Authorized")
          next(err, "Unauthorized");
        }
       
      });
  } 

  /***************** Edit User Profile ****************************/
  api.mongo.userEdit = function(api, connection, token_user, next) {

      var query = {username:connection.params.username}

      //Find User who's answer was accepted
      api.mongo.db.users.find(query, function doneSearching(err, results) {
        if (err) { 
            next(err, false); 
        } 

        console.log("Account getting updated " + results[0].username)

        //Copy all users attributes so they are not lost in update
        for (var i = 0; i < results.length; i++) {
          o_id = results[i]._id;
          username = connection.params.username;
          password = results[i].password;
          firstname = connection.params.firstname;
          lastname = connection.params.lastname;
          email = connection.params.email;
          zipcode = connection.params.zipcode;
          contact_phone = connection.params.contact_phone;
          city = connection.params.city;
          company_ind = connection.params.company_ind;
          company_name = connection.params.company_name;
          created_at = results[i].created_at;
          last_login =  results[i].last_login;
        }


        //Create JSON Entry to update in MongoDB
        entry = {username:username, password:password, firstname:firstname, lastname:lastname, 
                email:email, zipcode:zipcode, contact_phone:contact_phone, city:city, company_ind:company_ind, company_name:company_name, created_at:created_at, last_login:last_login}; 
        console.log("Printing Update")
        console.log(entry)

        //Check Security
        console.log(token_user)
        console.log(username)
        if (token_user === username) {
          //Update MongoDB
          api.mongo.db.users.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingScore(err, results) {
            if (err) { 
              next(err, false); 
            } 

            api.mongo.db.users.find(query, function doneSearching(err, results) {
            if (err) { 
                next(err, false); 
            } 
            next(err, results); 
            });
          });
        }
        else {
          console.log("Not Authorized")
          next(err, "Unauthorized");
        }
         
      });
  } 

  /***************** Update Last Login Time ****************************/
  api.mongo.userUpdateLastLoginTime = function(api, connection, next) {

    var query = {username:connection.params.username};

    console.log("Updating " + connection.params.username + " in MongoDB")

    //Find User who provided Answer
    api.mongo.db.users.find(query, function doneSearching(err, results) {
        if (err) { 
          next(err, false); 
        }

        console.log("Account that gets the login time Update: " + results[0].username)
        var now = new Date(); 
        lastLogin = now.toLocaleDateString() + " " + now.toLocaleTimeString();
        console.log("last Login " + lastLogin) 

        //Copy all users attributes so they are not lost in update and increment answer count
        for (var i = 0; i < results.length; i++) {
          o_id = results[i]._id;
          username = results[i].username;
          firstname = results[i].firstname;
          lastname = results[i].lastname;
          email = results[i].email;
          contact_phone = results[i].contact_phone;
          city = results[i].city;
          zipcode = results[i].zipcode;
          created_at = results[i].created_at;
          last_login = lastLogin;
          password = results[i].password;
          company_ind = results[i].company_ind;
          company_name = results[i].company_name;
        }

        //Create JSON Entry to update in MongoDB
        entry = {username:username, password:password, firstname:firstname, lastname:lastname, 
                email:email, zipcode:zipcode, contact_phone:contact_phone, city:city, company_ind:company_ind, company_name:company_name, created_at:created_at, last_login:last_login}; 
  
        //Update MongoDB
        api.mongo.db.users.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingScore(err, results) {
          if (err) { 
            next(err, false); 
          } 
          console.log(results)  
        });
        
        next (err, "Updated"); 
      });
  };  

  
/***************** Add a listing ****************************/
api.mongo.listingAdd = function(api, connection, next) {
 
  var created_at = new Date(); 
  //var created_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();

  //make', 'model', 'dimensions','condition

  //Create JSON Entry to Add to MongoDB
  var entry = { title:connection.params.title, description:connection.params.description,  username:connection.params.username, price:connection.params.price, 
              location:connection.params.location, zipcode:connection.params.zipcode, make:connection.params.make, model:connection.params.model, dimensions:connection.params.dimensions,
              condition:connection.params.condition, contact_phone:connection.params.contact_phone, contact_email:connection.params.contact_email, delivery:connection.params.delivery, unit:connection.params.unit, payment:connection.params.payment, 
              created_at:created_at, updated_at:created_at,  status:"active", views:0, image:null, thumbnail:null};

  //Insert JSON Entry to Add to MongoDB
  api.mongo.db.listings.insert(entry, {safe : true}, function doneCreatingListingEntry(err, results) {
    if (err) { 
       next(err, false); 
    }
    next(err, results);  

  });
};

/***************** Add Image to Listing ****************************/
  api.mongo.addImage = function(api, connection, image_path, token_user, next) {

      var BSON = mongodb.BSONPure;
      var o_id = new BSON.ObjectID(connection.params.id);
      var query = { "_id":o_id};

      console.log("Searching for ", query)

      var updated_at = new Date(); 
      //var updated_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();

      //Find the listing where we will add the image link
      api.mongo.db.listings.find(query, function doneSearching(err, results) {
        if (err) { 
            next(err, false); 
        } 

        console.log("Results Length " + results.length)

        //Should never return more than 1 result
        for (var i = 0; i < results.length; i++) {

          if (token_user === results[i].username) {
            // If Image exists already, delete the old image first
            if (results[i].image) {
              console.log("Image Already Exists")
              var fs = require('fs');

              //Notes - Windows and Unix will both accept / path notation, so no need to use os separator
              console.log("Image Location: " + results[i].image)
              console.log(__dirname)
              // --- /home/brimstoneuser/brimstone/initializers
              // --- C:\Users\tabacco\Desktop\brimstone\initializers
              
              filepath1 = __dirname.replace("initializers", "")
              console.log(filepath1)
              // --- /home/brimstoneuser/brimstone/
              // --- C:\Users\tabacco\Desktop\brimstone\
              filepath2 = filepath1 +  results[i].image
              console.log(filepath2)
              // --- /home/brimstoneuser/brimstone//public/listing_images/upload_036c41fd741e0f38af8d22c3b561b7b5.jpg
              // --- C:\Users\tabacco\Desktop\brimstone\public\listing_images\c40e1871fce1b3a5f29108b766c9db27.jpg
              //filepath3 = filepath2.replace("/", "/")
              //console.log(filepath3)

              fs.unlink(filepath2, function (err) {
                if (err) console.log("failed to delete image"); 
                console.log('successfully deleted image ' + filepath2);
              });
            }

            if (results[i].thumbnail) {
              console.log("Thumbnail Image Already Exists")
              var fs = require('fs');

              //Notes - Windows and Unix will both accept / path notation, so no need to use os separator
              console.log("Image Location: " + results[i].thumbnail)
              console.log(__dirname)
              
              filepath1 = __dirname.replace("initializers", "")
              console.log(filepath1)
              filepath2 = filepath1 + "/" + results[i].thumbnail
              console.log(filepath2)
              filepath3 = filepath2.replace("/", "/")
              console.log(filepath3)

              fs.unlink(filepath3, function (err) {
                if (err) console.log("failed to delete thumbnail: " + err); 
                console.log('successfully deleted thumbnail' + filepath3);
              });
            }

            //Create Thumbnail
            //image_path = public\listing_images\e71e02492637559fd656b464ec6dcbcb.jpg
            
            //Change backslashes to forward slashes globally
            console.log(image_path)
            //If it's a windows machine, this will convert to normal notation
            image_path_cleaned = image_path.replace(/\\/g,"/")
            console.log(image_path_cleaned)
            image_filename = image_path_cleaned.split('/');
            console.log(image_filename)

            var Thumbnail = require('thumbnail');
            var thumbnail = new Thumbnail('public/listing_images', 'public/listing_images');
            thumbnail.ensureThumbnail(image_filename[2], 150, null, function (err, filename) {
              // "filename" is the name of the thumb in '/path/to/thumbnails'
              if (err) console.log("error with thumbnail " + err)
              console.log(filename)
              thumbnail_path = image_filename[0] + '/' + image_filename[1] + '/' + filename
              console.log(thumbnail_path)

              //Reset to 0, because for loop variable gets lost in callback
              var i = 0;

              //Add the new image to the listing
              o_id = results[i]._id;
              username = results[i].username;
              title = results[i].title;
              description = results[i].description;
              price = results[i].price;
              location = results[i].location;
              zipcode = results[i].zipcode;
              make = results[i].make;
              model = results[i].model;
              dimensions = results[i].dimensions;
              condition = results[i].condition;
              delivery = results[i].delivery;
              unit = results[i].unit;
              payment =  results[i].payment;
              created_at = results[i].created_at;
              updated_at = updated_at;
              status = results[i].status;
              views = results[i].views;
              contact_email = results[i].contact_email;
              contact_phone = results[i].contact_phone; 
              image = image_path;
              thumbnail = thumbnail_path;

               //Create JSON Entry to update in MongoDB
              entry = {username:username, title:title, description:description, price:price, location:location, zipcode:zipcode, make:make, model:model, dimensions:dimensions, condition:condition,
                       created_at:created_at, updated_at:updated_at, contact_email:contact_email, contact_phone:contact_phone, delivery:delivery, unit:unit, payment:payment, status:status, views:views, 
                       image:image, thumbnail:thumbnail}; 
        
              //Update MongoDB
              api.mongo.db.listings.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingListingWithImage(err, results) {
                  if (err) { 
                    next(err, false); 
                  } 
                  console.log("Done Updating Mongo - initiating next()")
                  next(err, results);    
              }); //End Mongo Listing Update Callback

            }); //End Thumbnail Creation Callback
          }
          else {
            console.log("Not Authorized")
            next(err, "Unauthorized");
          }
        } //End FOR Loop
      }); //End Listing Search callback
  } 

  /****************** Update View Count ************************/
 api.mongo.updateViewCount = function(api, connection) {

  var BSON = mongodb.BSONPure;
  var o_id = new BSON.ObjectID(connection.params.id);
  var query = { "_id":o_id};

  //Find the Listing
  api.mongo.db.listings.find(query, function doneSearching(err, results) {
    if (err) { 
      next(err, false); 
    } 

    //Load existing data so it is not lost in update
    for (var i = 0; i < results.length; i++) {
      o_id = results[i]._id;
      username = results[i].username;
      title = results[i].title;
      description = results[i].description;
      price = results[i].price;
      location = results[i].location;
      zipcode = results[i].zipcode;
      make = results[i].make;
      model = results[i].model;
      dimensions = results[i].dimensions;
      condition = results[i].condition;
      delivery = results[i].delivery;
      unit = results[i].unit;
      payment =  results[i].payment;
      created_at = results[i].created_at;
      updated_at = results[i].updated_at;
      contact_email = results[i].contact_email
      contact_phone = results[i].contact_phone
      status = results[i].status;
      views = results[i].views + 1;
      image = results[i].image;
      thumbnail = results[i].thumbnail;
    }

    //Create JSON Entry to update in MongoDB
    entry = {username:username, title:title, description:description, price:price, location:location, zipcode:zipcode, make:make, model:model, dimensions:dimensions, condition:condition,
                 created_at:created_at, updated_at:updated_at, contact_email:contact_email, contact_phone:contact_phone, delivery:delivery, unit:unit, payment:payment, status:status, views:views, 
                 image:image, thumbnail:thumbnail}; 

    //Update MongoDB
    api.mongo.db.listings.update({ "_id": o_id }, entry, {safe : true}, function doneAddingViewUpdate(err, results) {
      if (err) { 
       next(err, false); 
      }  
    });
  });
};


/***************** Get Listing by ID ****************************/
api.mongo.getListing = function(api, connection, next) {

  var BSON = mongodb.BSONPure;
  var o_id = new BSON.ObjectID(connection.params.id);
  var query = { "_id":o_id};

  var results = [];

  api.mongo.db.listings.find(query, function doneSearchingForListing(err, results) {
      if (err) { 
        next(err, false); 
      } 
      next(err, results);
  });
};

  /***************** Get All Available listings ****************************/
  api.mongo.getAllListing = function(api, connection, next) {

    var query = {}

    api.mongo.db.listings.find(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
       var today = new Date(); 
       for (var i = 0; i < results.length; i++) {
        results[i].updated_at = new Date(results[i].updated_at)
        
        //Returns number of millseconds between dates
        numofMillseconds = today - results[i].updated_at
     
        // 86400000 is the number of milleseconds in a day
        numofDays = numofMillseconds / 86400000;
        if (numofDays > 30) {
          results[i].status = "expired"
        }
        else {
          results[i].status = "active"
        }
      };
      
      next(err, results);   
    });
  };

  
  /***************** Get My listings ****************************/
  api.mongo.getMyListings = function(api, connection, next) {

    var query = {username:connection.params.username};

    api.mongo.db.listings.find(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
      var today = new Date(); 

      for (var i = 0; i < results.length; i++) {
        results[i].updated_at = new Date(results[i].updated_at)

        //Returns number of millseconds between dates
        numofMillseconds = today - results[i].updated_at
     
        // 86400000 is the number of milleseconds in a day
        numofDays = numofMillseconds / 86400000;
        //.log(numofDays)
        if (numofDays > 30) {
          results[i].status = "expired"
        }
        else {
          results[i].status = "active"
        }
      };

      next(err, results);   
    });
  };

  /***************** Delete All Listings ****************************/
  api.mongo.listingsDelete = function(api, connection, next) {

    var fs = require('fs');

    filepath = __dirname.replace("initializers", "public/listing_images/")

    console.log(__dirname)
    console.log(filepath)

    var query = {}

    api.mongo.db.listings.remove(query, function doneDeleting(err, results) {
      if (err) { 
        next(err, false); 
      } 
      connection.response.content = results; 
      next(err, results);   
    });


    path = filepath;
    
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            console.log("Deleting " + curPath)
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        //fs.rmdirSync(path);
      }
    
    console.log("files are gone")

      
  };


  /***************** Delete Listing by ID ****************************/
  api.mongo.listingsDeleteID = function(api, connection, token_user, next) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.id);
    var query = { "_id":o_id};

    console.log("Delete: " + query)

    //Find the Listing
    api.mongo.db.listings.find(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 

      console.log("Located listing to delete")

      for (var i = 0; i < results.length; i++) {

        if (token_user === results[i].username) {

          if (results[i].image) {
            console.log("Image Exists")
            var fs = require('fs');

            console.log("Image Location: " + results[i].image)
            console.log(__dirname)
          
            filepath1 = __dirname.replace("initializers", "")
            filepath2 = filepath1 + "/" + results[i].image
            filepath3 = filepath2.replace("/", "/")

            fs.unlink(filepath3, function (err) {
              if (err) next(err, false); 
              console.log('successfully deleted ' + filepath3);

              api.mongo.db.listings.remove(query, function doneDeleting(err, results) {
                if (err) { 
                  next(err, false); 
                } 
                next(err, true);   
              });
            });
          }
          else {
            api.mongo.db.listings.remove(query, function doneDeleting(err, results) {
              if (err) { 
                next(err, false); 
              } 
              next(err, true);   
            });
          }
        }
        else {
          console.log("Not Authorized")
          next(err, "Unauthorized");
        }  
      }
    });

  };

  /***************** listingRenew ****************************/
  
  api.mongo.listingRenew = function(api, connection, token_user, next) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.id);
    var query = { "_id":o_id};

    var updated_at = new Date(); 

    //Find the Listing
    api.mongo.db.listings.find(query, function doneSearchingForListing(err, results) {
      if (err) { 
        next(err, false); 
      } 

      //Load existing data so it is not lost in update, and new fields come from update
      for (var i = 0; i < results.length; i++) {
        o_id = results[i]._id;
        username = results[i].username;
        title = results[i].title;
        description = results[i].description;
        price = results[i].price;
        location = results[i].location;
        zipcode = results[i].zipcode;
        make = results[i].make;
        model = results[i].model;
        dimensions = results[i].dimensions;
        delivery = results[i].delivery;
        unit = results[i].unit;
        payment =  results[i].payment;
        condition = results[i].condition;
        created_at = results[i].created_at;
        contact_email = results[i].contact_email;
        contact_phone = results[i].contact_phone;
        status = results[i].status;
        views = results[i].views;
        image = results[i].image;
        thumbnail = results[i].thumbnail;
        updated_at = updated_at;
      }         

      //Create JSON Entry to update in MongoDB
      entry = {username:username, title:title, description:description, price:price, location:location, zipcode:zipcode, make:make, model:model, dimensions:dimensions, condition:condition,
           created_at:created_at, updated_at:updated_at, contact_email:contact_email, contact_phone:contact_phone, delivery:delivery, unit:unit, payment:payment, status:status, views:views, 
           image:image, thumbnail:thumbnail}; 

      if (token_user === username) {

        //Update MongoDB
        api.mongo.db.listings.update({ "_id": o_id }, entry, {safe : true}, function doneWithUpdate(err, results) {
          if (err) { 
           next(err, false); 
          }  
          console.log(results)
          
          console.log("Re-search for " + query )
          api.mongo.db.listings.find(query, function doneSearchingForListing(err, result) {
          if (err) { 
            next(err, false); 
          }  
          next(err, result);   
          });  
        });
      }
      else {
        console.log("Not Authorized")
        next(err, "Unauthorized");
      }
    });
  };

  /***************** editListing ****************************/
  api.mongo.listingEdit = function(api, connection, token_user, next) {

    if (connection.params.make == 'undefined' ) {
      connection.params.make = ""
    }

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.id);
    var query = { "_id":o_id};

    var now = new Date(); 
    var updated_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();

    //Find the Listing
    api.mongo.db.listings.find(query, function doneSearchingForQuestion(err, results) {
      if (err) { 
        next(err, false); 
      } 

      //Load existing data so it is not lost in update, and new fields come from update
      for (var i = 0; i < results.length; i++) {
        o_id = results[i]._id;
        username = results[i].username;
        title = connection.params.title;
        description = connection.params.description;
        price = connection.params.price;
        location = connection.params.location;
        zipcode = connection.params.zipcode;
        make = connection.params.make;
        model = connection.params.model;
        dimensions = connection.params.dimensions;
        delivery = connection.params.delivery;
        unit = connection.params.unit;
        payment =  connection.params.payment;
        condition = connection.params.condition;
        created_at = results[i].created_at;
        contact_email = connection.params.contact_email;
        contact_phone = connection.params.contact_phone;
        status = results[i].status;
        views = results[i].views;
        image = results[i].image;
        thumbnail = results[i].thumbnail;
        updated_at = updated_at;
        console.log(updated_at)
      }         

      var now = new Date();
      updated_at = now;

      //Create JSON Entry to update in MongoDB
      entry = {username:username, title:title, description:description, price:price, location:location, zipcode:zipcode, make:make, model:model, dimensions:dimensions, condition:condition,
           created_at:created_at, updated_at:updated_at, contact_email:contact_email, contact_phone:contact_phone, delivery:delivery, unit:unit, payment:payment, status:status, views:views, 
           image:image, thumbnail:thumbnail}; 

      if (token_user === username) {
        //Update MongoDB
        api.mongo.db.listings.update({ "_id": o_id }, entry, {safe : true}, function doneWithUpdate(err, results) {
          if (err) { 
           next(err, false); 
          }  
          console.log(results)
          
          console.log("Re-search for " + query )
          api.mongo.db.listings.find(query, function doneSearchingForListing(err, result) {
          if (err) { 
            next(err, false); 
          }  
          next(err, result);   
          });  
        });
      }
      else {
        console.log("Not Authorized")
        next(err, "Unauthorized");
      }

    });
  };

    /***************** ListingImageRemove ****************************/
  api.mongo.listingImageRemove = function(api, connection, token_user, next) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.id);
    var query = { "_id":o_id};

    var now = new Date(); 
    var updated_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();

    //Find the Listing
    api.mongo.db.listings.find(query, function doneSearchingForQuestion(err, results) {
      if (err) { 
        next(err, false); 
      } 

      //Load existing data so it is not lost in update, and new fields come from update
      for (var i = 0; i < results.length; i++) {
        o_id = results[i]._id;
        username = results[i].username;
        title = results[i].title;
        description = results[i].description;
        price = results[i].price;
        location = results[i].location;
        zipcode = results[i].zipcode;
        make = results[i].make;
        model = results[i].model;
        dimensions = results[i].dimensions;
        condition = results[i].condition;
        delivery = results[i].delivery;
        unit = results[i].unit;
        payment = results[i].payment;
        created_at = results[i].created_at;
        contact_email = results[i].contact_email;
        contact_phone = results[i].contact_phone;
        status = results[i].status;
        views = results[i].views;
        previous_image = results[i].image;
        previous_thumbnail = results[i].thumbnail;
        image = null;
        thumbnail = null;
        updated_at = updated_at;
      }

      if (token_user === username) {

        if (previous_image) {
          var fs = require('fs');

          console.log("Image Location: " + previous_image)
          console.log(__dirname)
          
          filepath1 = __dirname.replace("initializers", "")
          filepath2 = filepath1 + "/" + previous_image
          filepath3 = filepath2.replace("/", "/")

          fs.unlink(filepath3, function (err) {
            if (err) console.log("failed to delete image");  
            console.log('successfully deleted image ' + filepath3);  
          });
        }    

         if (previous_thumbnail) {
          var fs = require('fs');

          console.log("Image Location: " + previous_thumbnail)
          console.log(__dirname)
          
          filepath1 = __dirname.replace("initializers", "")
          filepath2 = filepath1 + "/" + previous_thumbnail;
          filepath3 = filepath2.replace("/", "/")

          fs.unlink(filepath3, function (err) {
            if (err) console.log("failed to delete thumbnail"); 
            console.log('successfully deleted thumbail ' + filepath3);  
          });
        }      

        //Create JSON Entry to update in MongoDB
        entry = {username:username, title:title, description:description, price:price, location:location, zipcode:zipcode, make:make, model:model, condition:condition,
             created_at:created_at, updated_at:updated_at, contact_email:contact_email, contact_phone:contact_phone, delivery:delivery, unit:unit, payment:payment, status:status, views:views, 
             image:image, thumbnail:thumbnail}; 

        //Update MongoDB
        api.mongo.db.listings.update({ "_id": o_id }, entry, {safe : true}, function doneWithUpdate(err, results) {
          if (err) { 
           next(err, false); 
          }  
          console.log(results)
          
          console.log("Re-search for " + query )
          api.mongo.db.listings.find(query, function doneSearchingForListing(err, result) {
          if (err) { 
            next(err, false); 
          }  
          next(err, result);   
          });  
        });
      }
      else {
        console.log("Not Authorized")
        next(err, "Unauthorized");
      }
    });
  };

  /***************** Search for Listings ****************************/
  api.mongo.listingSearch = function(api, connection, next) {

    var query = {};

    console.log("phrase " + connection.params.query)
    console.log("Zip " + connection.params.zip)

    if (connection.params.zip === "null" && connection.params.query === "*") {
      console.log("Null Zip Code with * Query")
       query =  {};
    }
    else if (connection.params.zip === "null") {
      console.log("Zip code is null")
       query =  { $text: { $search: connection.params.query } };
    }
    else if (connection.params.zip !== "null" && connection.params.query === "*" ) {
      console.log("Zip code with * query")
       query =  { zipcode:connection.params.zip };
    }

    else  {
      console.log("Zip code with specific query")
      query = { $text: { $search: connection.params.query }, zipcode:connection.params.zip}
    }

    api.mongo.db.listings.find(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
      var today = new Date(); 

      for (var i = 0; i < results.length; i++) {
        results[i].updated_at = new Date(results[i].updated_at)

        //Returns number of millseconds between dates
        numofMillseconds = today - results[i].updated_at
     
        // 86400000 is the number of milleseconds in a day
        numofDays = numofMillseconds / 86400000;
        //.log(numofDays)
        if (numofDays > 30) {
          results[i].status = "expired"
        }
        else {
          results[i].status = "active"
        }
      };

      next(err, results);   
    });
  };



  

  api.mongo._stop =  function(api, next){
      next();
  };

  next();
}

/////////////////////////////////////////////////////////////////////
// exports
exports.mongo = mongo;
