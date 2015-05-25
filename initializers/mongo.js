var mongojs = require('mongojs');
var mongodb = require('mongodb');

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


/***************** Add a Question ****************************/
api.mongo.questionAdd = function(api, connection, next) {

      //Add the person who asked the question to the notifier list
      var notify_users = [];
      notify_users.push(connection.params.userName);  


      var now = new Date(); 
      //var created_at = now;
      var created_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();


      //Create JSON Entry to Add to MongoDB
      var entry = { questionTitle:connection.params.questionTitle, questionBody:connection.params.questionBody,  username:connection.params.userName, tags:connection.params.tags, 
                  notify:notify_users, created_at:created_at, status:"open", views:0, numAnswers:0};

      console.log(connection.params.questionBody)

       //Insert JSON Entry to Add to MongoDB
        api.mongo.db.questions.insert(entry, {safe : true}, function doneCreatingQuestionEntry(err, results) {
          if (err) { 
             next(err, false); 
          }
          connection.response.content = results; 
          next(err, results);  

          archentry = { questionTitle:connection.params.questionTitle}
          api.mongo.db.questionarchive.insert(archentry, {safe : true}, function doneCreatingQuestionEntry(err, results) {
            if (err) { 
               //next(err, false); 
            } 
            console.log("Added Question to Archive")

          });

        });
  };

  
   /***************** Remove an answer count from the user's profile ****************************/
  api.mongo.lowerUserAnswerCount = function(api, user, next) {

    var query = {username:user}

    //Find User who provided Answer
    api.mongo.db.users.find(query, function doneSearching(err, results) {
        if (err) { 
          next(err, false); 
        }

        console.log("Account that gets the Answer Count Update: " + results[0].username)

        //Copy all users attributes so they are not lost in update and increment answer count
        for (var i = 0; i < results.length; i++) {
          o_id = results[i]._id;
          username = results[i].username;
          firstName = results[i].firstName;
          lastName = results[i].lastName;
          email = results[i].email;
          answerCount = results[i].answerCount - 1;
          acceptedAnswers = results[i].acceptedAnswers;
          distinction = results[i].distinction;
          created_at = results[i].created_at;
          lastLogin =  results[i].lastLogin;
        }

        //Create JSON Entry to update in MongoDB
        entry = {username:username, email:email, acceptedAnswers:acceptedAnswers, answerCount:answerCount, distinction:distinction, created_at:created_at, lastLogin:lastLogin, firstName:firstName, lastName:lastName}
        
        //Update MongoDB
        api.mongo.db.users.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingScore(err, results) {
          if (err) { 
            next(err, false); 
          } 
          console.log(results) 
          next(err, results); 
        });
        
        next (err, "Updated"); 
      });
  }

  /***************** Add an answer to a question ****************************/
  api.mongo.updateUserAnswerCount = function(api, notify_info, next) {

    var query = {username:notify_info[3].answer_username}

    //Find User who provided Answer
    api.mongo.db.users.find(query, function doneSearching(err, results) {
        if (err) { 
          next(err, false); 
        }

        console.log("Account that gets the Answer Count Update: " + results[0].username)

        //Copy all users attributes so they are not lost in update and increment answer count
        for (var i = 0; i < results.length; i++) {
          o_id = results[i]._id;
          username = results[i].username;
          firstName = results[i].firstName;
          lastName = results[i].lastName;
          email = results[i].email;
          answerCount = results[i].answerCount + 1;
          acceptedAnswers = results[i].acceptedAnswers;
          distinction = results[i].distinction;
          created_at = results[i].created_at;
          lastLogin =  results[i].lastLogin;
        }

        //Create JSON Entry to update in MongoDB
        entry = {username:username, email:email, acceptedAnswers:acceptedAnswers, answerCount:answerCount, distinction:distinction, created_at:created_at, lastLogin:lastLogin, firstName:firstName, lastName:lastName}
        
        //Update MongoDB
        api.mongo.db.users.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingScore(err, results) {
          if (err) { 
            next(err, false); 
          } 
          console.log(results) 
          next(err, results); 
        });
        
        next (err, "Updated"); 
      });
  }

 /***************** Add an answer to a question ****************************/
  api.mongo.updateUserScore = function(api, connection, user, next) {

      var query = {username:user}

      //Find User who's answer was accepted
      api.mongo.db.users.find(query, function doneSearching(err, results) {
        if (err) { 
            next(err, false); 
        } 

        console.log("Account that gets points: " + results[0].username)

        //Copy all users attributes so they are not lost in update and increment accepted answer count
        for (var i = 0; i < results.length; i++) {
          o_id = results[i]._id;
          username = results[i].username;
          firstName = results[i].firstName;
          lastName = results[i].lastName;
          email = results[i].email;
          answerCount = results[i].answerCount;
          acceptedAnswers = results[i].acceptedAnswers + 1;
          distinction = results[i].distinction;
          created_at = results[i].created_at;
          lastLogin =  results[i].lastLogin;
        }

        //Create JSON Entry to update in MongoDB
        entry = {username:username, email:email, acceptedAnswers:acceptedAnswers, answerCount:answerCount, distinction:distinction, created_at:created_at, lastLogin:lastLogin, firstName:firstName, lastName:lastName}
        //console.log("Object that will be sent to update: " + JSON.stringify(entry))
        //console.log(o_id)

        //Update MongoDB
        api.mongo.db.users.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingScore(err, results) {
            if (err) { 
              next(err, false); 
            } 
            console.log(results) 
            next(err, results); 
          });
        next(err, results);   
      });
  } 

/***************** Add an answer to a question ****************************/
  api.mongo.answerAdd = function(api, connection, next) {

    //First get the existing record
    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.question_id);
    var query = { "_id":o_id};

    var answer_record = [];
    var notify_users = [];
    var answer_id = 0;
    var upvote = 0;
    var downvote = 0;
    var voters = [];

    var now = new Date(); 
    var answer_created_at = now.toLocaleDateString() + " " + now.toLocaleTimeString();

    //Find User who's answer was accepted
    api.mongo.db.questions.find(query, function doneSearching(err, result) {
     
      if (err) { 
        next(err, false); 
      } 

      //console.log("Located Question")
      //console.log("Length: " + result.length)

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
        numAnswers = result[i].numAnswers + 1;
      }

      answer_id_collection =  [];
      if (answer_record) {
        console.log("Answers were found")

        //Create a collection of all the in-use IDs
        for (i = 0; i < answer_record.length; i++) {
          answer_id_collection.push(answer_record[i].id)
        }
        console.log("Existing IDs " + answer_id_collection )

        var found = false;
        //Set answer_ID initially to the next value - will work if there are no deletes
        answer_id = answer_record.length;
        while (found == false) {

          console.log("Checking to see if " + answer_id + " " + "can be used")
          if (answer_id_collection.indexOf(answer_id) === -1) {
            console.log(answer_id + " is available")
            found = true;
          }
          else {
            console.log(answer_id + " is not available, incrementing + 1")
            answer_id = answer_id + 1;

          }
        }
        
      }

      //This will happen during the initial question, since there will be no answer array
      if (!answer_record) {
        answer_record = [];
         answer_id = answer_record.length;   //will be 0
      }

      //Set the ID to the length of answers to ensure it will be the next available number
      //answer_id = answer_record.length;



      /***** Update Existing Answers Array with new answer ****/
      answer_record.push({username: connection.params.userName, answerBody:connection.params.answer, created_at:answer_created_at, id:answer_id, upvote:upvote, downvote:downvote, voters:voters, accepted:"no"}) 

      /***** Update Notification List with new answer username ****/
      //Enhance this to check to see if user is in list already
      if (notify_users.indexOf(connection.params.userName) == -1) {
        notify_users.push(connection.params.userName)
      }
      else {
        console.log("User was already in the notify list")
      }

      //Create Array to Store Users that will be notified
      notify_info = [];
      notify_info.push({notify:notify_users})
      notify_info.push({question_id:question_id})
      notify_info.push({asker:username})

      //adding this for UpdatingAnswerCount only
      notify_info.push({answer_username: connection.params.userName})
      notify_info.push({questionTitle:questionTitle})

      //Create JSON Entry to update in MongoDB
      entry = {questionTitle:questionTitle, questionBody:questionBody,  username:username, tags:tags, notify:notify_users, created_at:created_at, status:status, views:views, answers:answer_record, numAnswers:numAnswers}

      //Update MongoDB
      api.mongo.db.questions.update({ "_id": o_id }, entry, {safe : true}, function doneAddingAnswer(err, results) {
        if (err) { 
         next(err, false); 
        }  
        console.log(results)
        connection.response.content = results; 
        next(err, notify_info);     
      });
    }); 
  };

  
  /***************** editAnswer ****************************/
  api.mongo.editAnswer = function(api, connection, next) {

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
            answerBody = connection.params.answerBody;

            //Iterate through the answers and find the right one to update
            for (var i = 0; i < answer_record.length; i++) {

              if (connection.params.answer_id == answer_record[i].id) {
                answer_record[i].answerBody = connection.params.answerBody;
              }
              /*
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
              */
            
            }

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

  
  /***************** Get Question by ID ****************************/
  api.mongo.questionsGetSimple = function(api, connection, next) {

        var BSON = mongodb.BSONPure;
        var o_id = new BSON.ObjectID(connection.params.id);
        var query = { "_id":o_id};

        var results = [];

        //Find the Question
        api.mongo.db.questions.find(query, function doneSearchingForQuestion(err, results) {
            if (err) { 
              next(err, false); 
            } 
            connection.response.content = results; 
            next(err, results);
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


  /****************** Update View Count ************************/
   api.mongo.updateViewCount = function(api, connection) {

    var BSON = mongodb.BSONPure;
    var o_id = new BSON.ObjectID(connection.params.id);
    var query = { "_id":o_id};

    var answer_record = [];

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
        views = result[i].views + 1;
        answerMessage = result[i].answerMessage;
        numAnswers = result[i].numAnswers;
      }

      //Create JSON Entry to update in MongoDB
      entry = {questionTitle:questionTitle, questionBody:questionBody,  username:username, tags:tags, notify:notify, created_at:created_at, status:status, views:views, answers:answer_record, answerMessage:answerMessage, numAnswers:numAnswers}

      //Update MongoDB
      api.mongo.db.questions.update({ "_id": o_id }, entry, {safe : true}, function doneAddingViewUpdate(err, results) {
        if (err) { 
         next(err, false); 
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

  /***************** Get All Available products ****************************/
  api.mongo.questionsAll = function(api, connection, next) {

    var query = {}

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
  api.mongo.userAdd = function(api, connection, user, next) {

    console.log("Adding " + connection.params.userName + " To MongoDB")

    //var ldap_email = user.mail;
    //var firstName = user.givenName;
    //var lastName = user.sn;
    var ldap_email = user.user.email
    var firstName = user.user.first_name;
    var lastName = user.user.last_name;
    var created_at = user.user.created_at;
    var lastLogin = user.user.lastLogin;

    console.log(user)
    var entry = { username:connection.params.userName, email:ldap_email, firstName:firstName, lastName:lastName, answerCount:0, acceptedAnswers:0, distinction:"", created_at:created_at, lastLogin:lastLogin};
    console.log(entry)

    api.mongo.db.users.insert(entry, {safe : true}, function doneCreatingUserEntry(err, results) {
      if (err) { 
        next(err, false); 
      } 
      connection.response.content = results; 
      next(err, true);   
    });
  };

    /***************** Add a Simulation User ****************************/
  api.mongo.userAddSim = function(api, connection, user, next) {

    console.log("Adding " + connection.params.userName + " To MongoDB")

    var ldap_email = user.mail;
    var firstName = user.firstName;
    var lastName = user.lastName;
    var created_at = user.created_at;
    var lastLogin = user.lastLogin;

    var entry = { username:connection.params.userName, email:ldap_email, firstName:firstName, lastName:lastName, answerCount:0, acceptedAnswers:0, distinction:"", created_at:created_at, lastLogin:lastLogin};

    api.mongo.db.users.insert(entry, {safe : true}, function doneCreatingUserEntry(err, results) {
      if (err) { 
        next(err, false); 
      } 
      connection.response.content = results; 
      next(err, true);   
    });
  };

  /***************** Add a User ****************************/
  api.mongo.userUpdateLastLoginTime = function(api, connection, next) {

    var query = {username:connection.params.userName};

    console.log("Updating " + connection.params.userName + " in MongoDB")

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
          firstName = results[i].firstName;
          lastName = results[i].lastName;
          email = results[i].email;
          answerCount = results[i].answerCount;
          acceptedAnswers = results[i].acceptedAnswers;
          distinction = results[i].distinction;
          created_at = results[i].created_at;
          lastLogin = lastLogin;
        }

        //Create JSON Entry to update in MongoDB
        entry = {username:username, email:email, acceptedAnswers:acceptedAnswers, answerCount:answerCount, distinction:distinction, created_at:created_at, lastLogin:lastLogin, firstName:firstName, lastName:lastName}
        
        //Update MongoDB
        api.mongo.db.users.update({ "_id": o_id  }, entry, {safe : true}, function doneUpdatingScore(err, results) {
          if (err) { 
            next(err, false); 
          } 
          console.log(results) 
          next(err, results); 
        });
        
        next (err, "Updated"); 
      });
  };

  /***************** Search for User ****************************/
  api.mongo.userFind = function(api, connection, next) {

        var query = {username:connection.params.userName}

        api.mongo.db.users.find(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 

          //connection.response.content = results; 
          next(err, results);   
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


  /***************** Get All Users ****************************/
  api.mongo.usersList = function(api, connection, next) {

        var query = {}

        api.mongo.db.users.find(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 

          //connection.response.content = results; 
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

          connection.response.content = results; 
          next(err, true);   
        });
  };
  

/***************** Get Leaderboard for top 10 ****************************/
  api.mongo.leaderboardTopTen = function(api, connection, next) {

        var query = {acceptedAnswers:-1} // -1 is descending order, 1 is ascending (starting at 0)
        var projection = {username:1, acceptedAnswers:1, _id:0}

       //api.mongo.db.users.find(query, projection,  function doneSearching(err, results) {
        api.mongo.db.users.find().limit(50).sort(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          //connection.response.content = results; 
          next(err, results);   
        });
  };

    /***************** Get Statistics on questions ****************************/
  api.mongo.statsAllUsers = function(api, connection, next) {

        var query = {} 

       //api.mongo.db.users.find(query, projection,  function doneSearching(err, results) {
        api.mongo.db.users.find(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          //connection.response.content = results; 
          console.log("Total Users:" + results.length)
          next(err, results.length);   
        });
  };


  /***************** Get Statistics on questions ****************************/
  api.mongo.statsAllQuestions = function(api, connection, next) {

        var query = {} 

       //api.mongo.db.users.find(query, projection,  function doneSearching(err, results) {
        api.mongo.db.questions.find(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          //connection.response.content = results; 
          console.log("Total Questions:" + results.length)
          next(err, results.length);   
        });
  };

  
  /***************** Get Statistics on questions ****************************/
  api.mongo.statsOpenQuestions = function(api, connection, next) {

        var query = {status:"open"} 

       //api.mongo.db.users.find(query, projection,  function doneSearching(err, results) {
        api.mongo.db.questions.find(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          //connection.response.content = results; 
          console.log("Open Questions:" + results.length)
          next(err, results.length);   
        });
  };

  /***************** Get Statistics on questions ****************************/
  api.mongo.statsClosedQuestions = function(api, connection, next) {

        var query = {status:"closed"} 

       //api.mongo.db.users.find(query, projection,  function doneSearching(err, results) {
        api.mongo.db.questions.find(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          //connection.response.content = results; 
          console.log("closed Questions:" + results.length)
          next(err, results.length);   
        });
  };

  /***************** Get Statistics on questions ****************************/
  api.mongo.statsLastDay = function(api, connection, next) {

        var now = new Date();

        console.log("Now Native:" + now)

        console.log("Now:" + now.toLocaleString() )

        now.setDate(now.getDate()-1);

        var lastday = now.toLocaleDateString() + " " + now.toLocaleTimeString();

        console.log("Yesterday " + lastday)
        //var query = {created_at: {$gte: "3/5/2015 11:34:43 AM" }} 
        var query = {created_at: {$gte: lastday }}
        //var query = {created_at: {$gte: "3/6/2015 6:34:43 PM" }}

        console.log(query)

        /*created_at: {
        $gte:"Mon May 30 18:47:00 +0000 2015",
        $lt: "Sun May 30 20:40:36 +0000 2010"
        }
        */
        api.mongo.db.questions.find(query, function doneSearching(err, results) {
          if (err) { 
            next(err, false); 
          } 
          //connection.response.content = results; 
          console.log("Questions in last 24 hours:" + results.length)
          next(err, results.length);   
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
