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
                email:connection.params.email, zipcode:connection.params.zipcode, company_ind:connection.params.company_ind, company_name:connection.params.company_name, created_at:created_at, last_login:created_at};

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


  /***************** Search for User ****************************/
  api.mongo.userFind = function(api, connection, next) {

    var query = {username:connection.params.username}

    api.mongo.db.users.find(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
      //connection.response.content = results; 
      //console.log(results)
      next(err, results);   
    });
  };


  
  /***************** Edit User Password ****************************/
  api.mongo.userPasswordEdit = function(api, connection, next) {

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
          company_ind = results[i].company_ind;
          company_name = results[i].company_name;
          created_at = results[i].created_at;
          last_login =  results[i].last_login;
        }


        //Create JSON Entry to update in MongoDB
        entry = {username:username, password:password, firstname:firstname, lastname:lastname, 
                email:email, zipcode:zipcode, company_ind:company_ind, company_name:company_name, created_at:created_at, last_login:last_login}; 
  
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
        //next(err, results);   
      });
  } 

  /***************** Edit User Profile ****************************/
  api.mongo.userEdit = function(api, connection, next) {

      var query = {username:connection.params.username}

      //Find User who's answer was accepted
      api.mongo.db.users.find(query, function doneSearching(err, results) {
        if (err) { 
            next(err, false); 
        } 

        console.log("Account getting updated " + results[0].username)



        //Copy all users attributes so they are not lost in update and increment accepted answer count
        for (var i = 0; i < results.length; i++) {
          o_id = results[i]._id;
          username = connection.params.username;
          password = results[i].password;
          firstname = connection.params.firstname;
          lastname = connection.params.lastname;
          email = connection.params.email;
          zipcode = connection.params.zipcode;
          company_ind = connection.params.company_ind;
          company_name = connection.params.company_name;
          created_at = results[i].created_at;
          last_login =  results[i].last_login;
        }


        //Create JSON Entry to update in MongoDB
        entry = {username:connection.params.username, password:connection.params.password, firstname:connection.params.firstname, lastname:connection.params.lastname, 
                email:connection.params.email, zipcode:connection.params.zipcode, company_ind:connection.params.company_ind, company_name:connection.params.company_name, created_at:created_at, last_login:last_login}; 
  
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
        //next(err, results);   
      });
  } 

  
/***************** Add a listing ****************************/
api.mongo.listingAdd = function(api, connection, next) {
 
  var now = new Date(); 
  var created_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();

  //make', 'model', 'dimensions','condition

  //Create JSON Entry to Add to MongoDB
  var entry = { title:connection.params.title, description:connection.params.description,  username:connection.params.username, price:connection.params.price, 
              location:connection.params.location, zipcode:connection.params.zipcode, make:connection.params.make, model:connection.params.model, dimensions:connection.params.dimensions,
              condition:connection.params.condition, contact_phone:connection.params.contact_phone, contact_email:connection.params.contact_email,  created_at:created_at, status:"open", views:0, image:null};

  console.log(connection.params.questionBody)

  //Insert JSON Entry to Add to MongoDB
  api.mongo.db.listings.insert(entry, {safe : true}, function doneCreatingListingEntry(err, results) {
    if (err) { 
       next(err, false); 
    }
    next(err, results);  

  });
};

/***************** Edit User Profile ****************************/
  api.mongo.addImage = function(api, connection, image_path, next) {

      var BSON = mongodb.BSONPure;
      var o_id = new BSON.ObjectID(connection.params.id);
      var query = { "_id":o_id};

      console.log("Searching for ", query)

      //Find User who's answer was accepted
      api.mongo.db.listings.find(query, function doneSearching(err, results) {
        if (err) { 
            next(err, false); 
        } 

        console.log("Results Length " + results.length)

        for (var i = 0; i < results.length; i++) {

          if  (results[i].image) {
            console.log("Image Already Exists")
            var fs = require('fs');

            //Notes - Windows and Unix will both accept / path notation, so no need to use os separator

            console.log("Image Location: " + results[i].image)
            console.log(__dirname)
            filepath1 = __dirname.replace("initializers", "public")
            console.log(filepath1)
            filepath2 = filepath1 + "/" + results[i].image
            console.log(filepath2)
            filepath3 = filepath2.replace("/", "/")
            console.log(filepath3)

            fs.unlink(filepath3, function (err) {
              if (err) next(err, false); 
              console.log('successfully deleted ' + filepath3);
            });
          }

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
          created_at = results[i].created_at;
          status = results[i].status;
          views = results[i].views;
          contact_email = results[i].contact_email
          contact_phone = results[i].contact_phone 
          image = image_path;
        }

        
        //Create JSON Entry to update in MongoDB
        entry = {username:username, title:title, description:description, price:price, location:location, zipcode:zipcode, make:make, model:model, condition:condition,
                 created_at:created_at, contact_email:contact_email, contact_phone:contact_phone, status:status, views:views, image:image}; 
  
        //Update MongoDB
        api.mongo.db.listings.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingListingWithImage(err, results) {
            if (err) { 
              next(err, false); 
            } 
            next(err, results);    
        });
        
        //next(err, results); 
         
      });
  } 

  /****************** Update View Count ************************/
 api.mongo.updateViewCount = function(api, connection) {

  var BSON = mongodb.BSONPure;
  var o_id = new BSON.ObjectID(connection.params.id);
  var query = { "_id":o_id};

  //Find the Question
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
      created_at = results[i].created_at;
      contact_email = results[i].contact_email
      contact_phone = results[i].contact_phone
      status = results[i].status;
      views = results[i].views + 1;
      image = results[i].image;
    }

    //Create JSON Entry to update in MongoDB
    entry = {username:username, title:title, description:description, price:price, location:location, zipcode:zipcode, make:make, model:model, condition:condition,
                 created_at:created_at, contact_email:contact_email, contact_phone:contact_phone, status:status, views:views, image:image}; 

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

  //Find the Question
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

      //connection.response.content = results; 
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

      next(err, results);   
    });
  };

  /***************** Delete All Listings ****************************/
  api.mongo.listingsDelete = function(api, connection, next) {

    var query = {}

    api.mongo.db.listings.remove(query, function doneDeleting(err, results) {
      if (err) { 
        next(err, false); 
      } 
      connection.response.content = results; 
      next(err, true);   
    });
  };


  /***************** Delete All Listings ****************************/
  api.mongo.listingsDeleteID = function(api, connection, next) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.id);
    var query = { "_id":o_id};

    api.mongo.db.listings.remove(query, function doneDeleting(err, results) {
      if (err) { 
        next(err, false); 
      } 
      next(err, true);   
    });
  };

















  /***************** editQuestion ****************************/
  api.mongo.editQuestion = function(api, connection, next) {

        var BSON = mongodb.BSONPure;
        var o_id = new BSON.ObjectID(connection.params.id);
        var query = { "_id":o_id};

        var results = [];

        //Find the Question
        api.mongo.db.questions.find(query, function doneSearchingForQuestion(err, result) {
            if (err) { 
              next(err, false); 
            } 

            //Load existing data so it is not lost in update
            for (var i = 0; i < result.length; i++) {
              answer_record = result[i].answers;
              questionTitle = result[i].questionTitle;
              questionBody = result[i].questionBody;
              username = result[i].username;
              tags = result[i].tags;
              question_id = result[i]._id;
              notify_users = result[i].notify;
              created_at = result[i].created_at;
              status = result[i].status;
              views = result[i].views;
              numAnswers = result[i].numAnswers;
            }         

            //Do Updates Here....
            questionTitle = connection.params.questionTitle;
            questionBody = connection.params.questionBody;
            tags = connection.params.tags;

            //Create JSON Entry to update in MongoDB
            entry = {questionTitle:questionTitle, questionBody:questionBody,  username:username, tags:tags, notify:notify_users, created_at:created_at, status:status, views:views, answers:answer_record, numAnswers:numAnswers}

            //Update MongoDB
            api.mongo.db.questions.update({ "_id": o_id }, entry, {safe : true}, function doneAddingAnswer(err, results) {
              if (err) { 
               next(err, false); 
              }  
              console.log(results)
              
              console.log("Re-search for " + query )
              api.mongo.db.questions.find(query, function doneSearchingForQuestion(err, result) {
              if (err) { 
                next(err, false); 
              } 

              connection.response.content = result; 
              next(err, result);   
              });  
            });

        });
  };

  


  /***************** Get Question by ID and Add Extra ****************************/
  api.mongo.questionsGetFullExtra = function(api, connection, next) {

        var BSON = mongodb.BSONPure;
        var o_id = new BSON.ObjectID(connection.params.id);
        var query = { "_id":o_id};

        var results = [];

        //Find the Question
        api.mongo.db.questions.find(query, function doneSearchingForQuestion(err, results) {
            if (err) { 
              next(err, false); 
            } 

            var numRunningQueries = 0;
            var i;

            //Populate the score of the Question Asker
            var question_user_query = {"username":results[0].username}
            api.mongo.db.users.find(question_user_query, function doneSearchingForUser(err, q_id_results) {
              if (err) { 
                next(err, false); 
              } 

              if (q_id_results[0].acceptedAnswers)
              {
                results[0].userdata_acceptedAnswers = q_id_results[0].acceptedAnswers;
              }
              else {
                results[0].userdata_acceptedAnswers = 0
              }

              results[0].userdata_answerCount = q_id_results[0].answerCount;
   
              //Only try to populate users score info if there are answers
              if (results[0].answers) {

                console.log("Answers were found")
                for (i = 0; i < results[0].answers.length; i++) {
                  ++numRunningQueries;
                  var user_query = {"username":results[0].answers[i].username}
                  console.log("Running " + JSON.stringify(user_query))
                  console.log("Running " + user_query)

                  api.mongo.db.users.find(user_query, function doneSearchingForUser(err, id_results) {
                    if (err) { throw err;}
                    --numRunningQueries;
                    console.log('Found ' + JSON.stringify(id_results))

                    for (var j = 0; j < results[0].answers.length; j++)
                      {
                        if (id_results[0].username === results[0].answers[j].username){
                          //Copy all attributes from User Record to Answer Records
                          results[0].answers[j].userdata_acceptedAnswers = id_results[0].acceptedAnswers;
                          results[0].answers[j].userdata_answerCount = id_results[0].answerCount;
                        }
                      }
                    if (numRunningQueries === 0) {
                      console.log("Exit Condition Met")
                      connection.response.content = results; 
                      next(err, results);
                    }
                  });
                };
              } 
              else {
                console.log("No Answers Yet")
                connection.response.content = results; 
                next(err, results);
              }
            });
        });
  };




  /******************  Add Vote  *** ***************/
   api.mongo.addVote = function(api, connection, next) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.question_id);
    var query = { "_id":o_id};

    var answer_record = [];
    var update = true;

    //Find the Question
    api.mongo.db.questions.find(query, function doneSearching(err, result) {
      if (err) { 
         next(err, false); 
      } 

      //Load existing data so it is not lost in update
      for (var i = 0; i < result.length; i++) {

        answer_record = result[i].answers;
        questionTitle = result[i].questionTitle;
        questionBody = result[i].questionBody;
        username = result[i].username;
        tags = result[i].tags;
        notify = result[i].notify;
        created_at = result[i].created_at;
        status = result[i].status;
        views = result[i].views;
        numAnswers = result[i].numAnswers
      }

      console.log("Starting the Answer Loop: Looking for: " + connection.params.answer_id + connection.params.vote )
      //Update the accepted status of the answer
      for (var i = 0; i < answer_record.length; i++) {

        if (connection.params.vote === "up" && i === parseInt(connection.params.answer_id)) {

            //Check to see if Voter is NOt in the Existing voters array
            // Position will be returned or -1 if not present
            if (answer_record[i].voters.indexOf(connection.params.userName) === -1) {
              console.log("Matched Up and Answer ID")
              answer_record[i].upvote = answer_record[i].upvote + 1;
              answer_record[i].voters.push(connection.params.userName);
            }
            else {
              console.log("Used Already Voted");
              update = false;
              next(err, "duplicate")
            }
        }
        if (connection.params.vote === "down" && i === parseInt(connection.params.answer_id)) {

          if (answer_record[i].voters.indexOf(connection.params.userName) === -1) {
          console.log("Matched Down and Answer ID")
          answer_record[i].downvote = answer_record[i].downvote + 1;
          answer_record[i].voters.push(connection.params.userName);
          }
          else {
            console.log("Used Already Voted");
            update = false;
            next(err, "duplicate")
          }
        }
      }

      if (update) {
      entry = {questionTitle:questionTitle, questionBody:questionBody,  username:username, tags:tags, notify:notify, created_at:created_at, status:status, views:views, answers:answer_record, numAnswers:numAnswers}

      //Create JSON Entry to update in MongoDB
      api.mongo.db.questions.update({ "_id": o_id }, entry, {safe : true}, function doneupdatingQuestions(err, results) {
        if (err) { 
          next(err, false); 
        } 
        console.log(results)
        connection.response.content = results; 
        next(err, true);     
        });
      }
    });
   };

   
   /****************** Delete Answer ************************/
   api.mongo.deleteAnswer = function(api, connection, token_user, next) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.question_id);
    var query = { "_id":o_id};

    var answer_record = [];
    var best_answer_username;

    answerMessage = connection.params.message;

    api.mongo.db.questions.find(query, function doneSearching(err, result) {
      if (err) { 
         next(err, false); 
      } 

      //Load existing data so it is not lost in update
      for (var i = 0; i < result.length; i++) {

        answer_record = result[i].answers;
        questionTitle = result[i].questionTitle;
        questionBody = result[i].questionBody;
        username = result[i].username;
        tags = result[i].tags;
        notify = result[i].notify;
        created_at = result[i].created_at;
        status = result[i].status;
        views = result[i].views;
        numAnswers = result[i].numAnswers
      }

      console.log("answer_record length:" + answer_record.length)

      //Go Through all the answers
      for (var i = 0; i < answer_record.length; i++) {

        console.log("i = " + i )
        console.log("answer_id =" + answer_record[i].id)
        console.log("delete answer_id = " + connection.params.answer_id  )

        //This will return the answer we want to delete
        if (answer_record[i].id === parseInt(connection.params.answer_id)) {
          //answer_record[i].
          
          console.log("Will remove answer_id " + connection.params.answer_id )
          console.log("deleting " + answer_record[i].username + ' ' + answer_record[i].answerBody )
          
          //Remove element at the index where the match occured and remove only 1 element
          answer_record.splice(i, 1);

          //Reduce the number of answers
          numAnswers = numAnswers - 1;
        }

      }

      //Otherwise answers will be an empty array and crash on load
      if (numAnswers === 0) {
        answer_record = null;
        console.log("clearing answers array")
      }

      entry = {questionTitle:questionTitle, questionBody:questionBody,  username:username, tags:tags, notify:notify, created_at:created_at, status:status, views:views, answerMessage:answerMessage, answers:answer_record, numAnswers:numAnswers}

      console.log(entry)

      //Security
      if (token_user === username) {

        api.mongo.db.questions.update({ "_id": o_id }, entry, {safe : true}, function doneupdatingQuestions(err, results) {
          if (err) { 
            next(err, false); 
          } 
          console.log("updated results\n")
          results.userScoreAdjust = username;
          console.log(results)
          connection.response.content = results; 
          //next(err, best_answer_username); 
          next (err, results)    
        });
      } 
      else {
        console.log("Not Authorized")
        next(err, "Unauthorized");
      }
    });
  };

  /****************** Accept Answer ************************/
   api.mongo.acceptAnswer = function(api, connection, token_user, next) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.question_id);
    var query = { "_id":o_id};

    var answer_record = [];
    var best_answer_username;

    answerMessage = connection.params.message;

    api.mongo.db.questions.find(query, function doneSearching(err, result) {
      if (err) { 
         next(err, false); 
      } 

      //Load existing data so it is not lost in update
      for (var i = 0; i < result.length; i++) {

        answer_record = result[i].answers;
        questionTitle = result[i].questionTitle;
        questionBody = result[i].questionBody;
        username = result[i].username;
        tags = result[i].tags;
        notify = result[i].notify;
        created_at = result[i].created_at;
        status = 'closed';
        views = result[i].views;
        numAnswers = result[i].numAnswers
      }

      console.log("answer_record length:" + answer_record.length)

      //Update the accepted status of the answer
      for (var i = 0; i < answer_record.length; i++) {

        if (i === parseInt(connection.params.answer_id)) {
          answer_record[i].accepted = "yes";
          best_answer_username = answer_record[i].username;
        }
       
      }

      console.log(answerMessage)

      entry = {questionTitle:questionTitle, questionBody:questionBody,  username:username, tags:tags, notify:notify, created_at:created_at, status:status, views:views, answerMessage:answerMessage, answers:answer_record, numAnswers:numAnswers}

      console.log(entry)

       //Create Array of information to push during the notification
      notify_info = [];
      notify_info.push({best:best_answer_username})
      notify_info.push({question_id:connection.params.question_id})
      notify_info.push({asker:username})
      notify_info.push({questionTitle:questionTitle})
      notify_info.push({answerMessage:answerMessage})

      if (token_user === username) {

        api.mongo.db.questions.update({ "_id": o_id }, entry, {safe : true}, function doneupdatingQuestions(err, results) {
          if (err) { 
            next(err, false); 
          } 
          console.log("updated results\n")
          console.log(results)
          connection.response.content = results; 
          //next(err, best_answer_username); 
          next (err, notify_info)    
        });
      } 
      else {
        console.log("Not Authorized")
        next(err, "Unauthorized");
      }
    });
  };

  /***************** Get My Questions ****************************/
  api.mongo.questionsGetMine = function(api, connection, next) {

    // TO DO Need to search on user ID
    var query = {username:connection.params.userName};

    api.mongo.db.questions.find(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 

      connection.response.content = results; 
      next(err, true);   
    });
  };

   /***************** Get My Answers ****************************/
  api.mongo.answersGetMine = function(api, connection, next) {

    var query = {"answers.username":connection.params.userName};

    api.mongo.db.questions.find(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 

      connection.response.content = results; 
      next(err, true);   
    });
  };



  /***************** Delete All products ****************************/
  api.mongo.questionsDelete = function(api, connection, next) {

    var query = {}

    api.mongo.db.questions.remove(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 

      connection.response.content = results; 
      next(err, true);   
    });
  };



  /***************** Add a User ****************************/
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
          firstName = results[i].firstname;
          lastName = results[i].lastname;
          email = results[i].email;
          created_at = results[i].created_at;
          last_login = lastLogin;
        }

        //Create JSON Entry to update in MongoDB
        entry = {username:username, password:password, firstname:firstname, lastname:lastname, 
                email:email, zipcode:zipcode, company_ind:company_ind, company_name:company_name, created_at:created_at, last_login:last_login}; 
  
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



  /***************** Search for User ****************************/
  api.mongo.userGetEmail = function(api, search_username, next) {

        console.log("search for: " + search_username)
        var query = {username:search_username}

        api.mongo.db.users.find(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          console.log("MongoDB result: " + results[0])
          //connection.response.content = results; 
          next(err, results);   
        });
  };



  
  /***************** Get Archive of questions ****************************/
  api.mongo.questionArchive = function(api, connection, next) {

        api.mongo.db.questionarchive.find({}, {_id:0}, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          //connection.response.content = results; 
          console.log("Questions:" + results)
          next(err, results);   
        });
  };


  
  /***************** Get Archive of Search ****************************/
  api.mongo.searchArchive = function(api, connection, next) {

        api.mongo.db.searcharchive.find({}, {_id:0}, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          //connection.response.content = results; 
          console.log("Searches:" + results)
          next(err, results);   
        });
  };

   /***************** Get Archive of Search ****************************/
  api.mongo.AddsearchArchive = function(api, connection, next) {

        console.log ("adding search to archive: " + connection.params.query)

        //Create JSON Entry to update in MongoDB
        
        archentry = { searchquery:connection.params.query}
          api.mongo.db.searcharchive.insert(archentry, {safe : true}, function doneCreatingQuestionEntry(err, results) {
            if (err) { 
               //next(err, false); 
            } 
            console.log("Added Search to Archive")
          });
  };

   /***************** Delete All products ****************************/
  api.mongo.questionsArchiveDelete = function(api, connection, next) {

    var query = {}

    api.mongo.db.questionarchive.remove(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 

      console.log("Deleted the Question Archive")
      connection.response.content = results; 
      next(err, true);   
    });
  };

   /***************** Delete All products ****************************/
  api.mongo.searchArchiveDelete = function(api, connection, next) {

    var query = {}

    api.mongo.db.searcharchive.remove(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
      console.log("Deleted the Search Archive")
      connection.response.content = results; 
      next(err, true);   
    });
  };

  /***************** Search for Most Recent ****************************/
  api.mongo.searchRecent = function(api, connection, next) {

    var query = {$natural:-1}
    //_id contains a timestamp in it, which can be searched via $natural
    //var query = {created_at:-1}

    api.mongo.db.questions.find().limit(5).sort(query, function doneSearching(err, results) {
      if (err) { 
        next(err, false); 
      } 
      console.log("Found Most Recent")
      connection.response.content = results; 
      next(err, true);   
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
