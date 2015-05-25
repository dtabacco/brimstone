var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport();

var notify = function (api, next) {
  api.notify = {};
  api.notify._start  = function(api, next){
      console.log("Notify API started");
  };
  
  api.notify.sendFeedback = function(api, connection, next) {
    console.log("Sending Feedback")

    var message = {
        from: api.config.notify.senderAddress,
        to: api.config.notify.feedbackRecipient,  
        subject: api.config.notify.feedbackSubject, 
        text: connection.params.message
      };

      transporter.sendMail(message, function(error, info) {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            next (error, false);
        }
        console.log('Message sent successfully!');
         next (false, "Sent");
      });
  }

   api.notify.sendAcceptAnswerEmail = function(api, connection, next) {
    console.log("Sending AcceptAnswer Email")

    console.log(notify_info[0].best)
    console.log(notify_info[1].question_id)
    console.log(notify_info[2].asker)
    console.log(notify_info[3].questionTitle)
    console.log(notify_info[4].answerMessage)


    if (notify_info[4].answerMessage == 'undefined') {
      notify_info[4].answerMessage = "None"
    }

    var email_link = api.config.notify.questionBaseLink + notify_info[1].question_id; 
    console.log(email_link)
    
    //Retrieve Email Address from Mongo Account
    api.mongo.userGetEmail(api, notify_info[0].best, function(err, result) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }
      var message = {
          from: api.config.notify.senderAddress,
          to: result[0].email,  
          subject: api.config.notify.participantAcceptedSubject, 
          html: api.config.notify.participantAcceptedPosterGreeting + result[0].firstName + "," + api.config.notify.participantAcceptedBody +
            '<br>Original Question:<br>' + 
            '<i><font color="#007D86">"' + notify_info[3].questionTitle + '"</font></i><br>' +
            '<br>Personalized Message From ' + notify_info[2].asker + ' (asker):<br>' + 
            '<i><font color="#007D86">"' + notify_info[4].answerMessage  + '"</font></i><br>' +
            '<br>The original question and answers can be found here: ' + '<a href=' + email_link + '>' + email_link + '</a>' + '<br><br>' +  
            api.config.notify.participantAcceptedPosterClosing
      };

        transporter.sendMail(message, function(error, info) {
          if (error) {
              console.log('Error occurred');
              console.log(error.message);
              next (error, false);
          }
          console.log('Message sent successfully!');
           next (false, "Sent");
        });
    });
  }

  api.notify.sendEmail = function(api, notify_info, next) {

    console.log("Sending Email")

    //Get data from here
    console.log(notify_info)
    console.log(notify_info[0].notify)
    console.log(notify_info[1].question_id)
    console.log(notify_info[2].asker)
    console.log(notify_info[3].answer_username)
    console.log(notify_info[4].questionTitle)

    var email_link = api.config.notify.questionBaseLink + notify_info[1].question_id; 
    console.log(email_link)

    //Retrieve Email Address from Mongo Account
    api.mongo.userGetEmail(api, notify_info[2].asker, function(err, result) {
      if (err) {
        connection.response.errors = err;
        next(connection, false);
      }

      console.log(result)

      //Send Original Poster Message
      var message = {
          from: api.config.notify.senderAddress,
          to: result[0].email,   //Original Poster Email
          subject: api.config.notify.originalPosterSubject, 
          html: api.config.notify.originalPosterGreeting + result[0].firstName + "," + api.config.notify.originalPosterBody +
            '<i><font color="#007D86">"' + notify_info[4].questionTitle + '"</font></i><br><br>' +
            '<a href=' + email_link + api.config.notify.questionLink + '</a>'   
        };

      transporter.sendMail(message, function(error, info) {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            return;
        }
        console.log('Message sent successfully To Original Poster!');
      });
    });

    //Send a Message to all the people on the Notify List (Does not Include the Original Poster) 
    for (var i = 0; i < notify_info[0].notify.length; i++) {
      
      if (notify_info[0].notify[i] !== notify_info[2].asker) {
        console.log("Look up: " + notify_info[0].notify[i]);

        //Retrieve Email Address from Mongo Account
        api.mongo.userGetEmail(api, notify_info[0].notify[i], function(err, result) {
          if (err) {
            connection.response.errors = err;
            next(connection, false);
          }

          console.log("Sending Message to: " + result[0].email)

          var message = {
            from: api.config.notify.senderAddress,
            to: result[0].email,
            subject: api.config.notify.participantSubject, 
            html: api.config.notify.participantPosterGreeting + result[0].firstName + ',' + api.config.notify.participantBody +
              '<i><font color="#007D86">"' + notify_info[4].questionTitle + '"</font></i><br><br>' +
              '<a href=' + email_link + api.config.notify.questionLink + '</a>'
          };

          transporter.sendMail(message, function(error, info) {
            if (error) {
                console.log('Error occurred');
                console.log(error.message);
                return;
            }
            console.log('Message sent successfully!');
          });
        });
      }
    };
    next (false, "Sent");
  };

  api.notify._stop =  function(api, next){
    next();
  };

  next();
}

/////////////////////////////////////////////////////////////////////
// exports
exports.notify = notify;
