var nodemailer = require("nodemailer");


var notify = function (api, next) {
  api.notify = {};
  api.notify._start  = function(api, next){
      console.log("Notify API started");
  };

    // Create a SMTP transporter object
  var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: api.config.notify.email,
          pass: api.config.notify.password
      }
  });
  
  api.notify.sendForgotPassword = function(api, connection, mail, next) {
  
    var email_link = api.config.notify.baselink + mail.session;

    // Message object
    var message = {

    // sender info
    from: '"Password Reset" <partialpallet@gmail.com>',

    // Comma separated list of recipients
    to: mail.email,

    // Subject of the message
    subject: 'Password Reset', 

    // HTML body
    html: 'You requested a password reset for <b>partialpallet<b>: ' + '<a href=' + email_link + '>' + email_link + '</a>' + '<br><br>' 
  };
  console.log(message)

      transporter.sendMail(message, function(error, info) {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            next (error, false);
        }
        else {
          console.log('Message sent successfully!');
          next (false, "Sent");
        }
      });
  }

  api.notify._stop =  function(api, next){
    next();
  };

  next();
}

/////////////////////////////////////////////////////////////////////
// exports
exports.notify = notify;
