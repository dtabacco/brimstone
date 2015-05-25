exports.default = {
  notify: function(api) {
    return {
    	//Common Properties
    	senderAddress: "barnum@merck.com",
    	questionBaseLink: "https://barnum.merck.com/viewquestionR.html?id=",

    	//Feedback Message
    	feedbackRecipient: "david_tabacco@merck.com",
    	feedbackSubject: "Application Feedback",

    	//Original Poster Question Message
    	originalPosterSubject: "New Response To Your Question",
    	originalPosterGreeting: "Dear ",
    	originalPosterBody: "<br><br>A community member just posted a new answer to your question:<br>",
   		questionLink: ">View Answer",

    	//Participant Answer Message
    	participantSubject: "New Response To A Question You Are Watching",
    	participantPosterGreeting: "Dear ",
    	participantBody: "<br><br>A community member just posted a new answer to a question you are watching:<br>",

        //Accepted Answer Message
        participantAcceptedSubject: "Your Answer Has Been Selected As The Best Answer",
        participantAcceptedPosterGreeting: "Dear ",
        participantAcceptedBody: "<br><br>You posted an answer that was accepted as the best answer.  You have been awarded <font color='#007D86'><b>10 points</b></font> in Barnuum<br>",
        participantAcceptedPosterClosing: "Thanks For Participating",

    }
  }
}
