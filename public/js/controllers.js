//Global Variables
var glb_answers = 0;
var glb_answer_storage = [];
var user_temp;
var glb_tags;
var glb_answer_username;
var glb_AcceptedAnswerMultiplier = 10;
var glb_answer_id = null;
var glb_delete_status = null;

var glb_symbols = {
    '@': '%40',
    '&amp;': '%26',
    '*': '%2A',
    '+': '%2B',
    '/': '%2F',
    '=': "%3D",
    '"': "%22", 
   	'&': "%26",
   	";": "%3B",
    '<': '%3C',
    '>;': '%3E',
    ':': '%3A',
    '&nbsp;': '+'
};

var BarnumApp = angular.module('AnalyticsOverflow', ['app.config'], function( appConfig) {
	
	//Print Out Environment Information When module is instantiated
	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	console.log("Environment Configuration: " + restURLEndpoint)
});

	BarnumApp.directive('myRepeatDirective', function() {
		return function(scope, element, attrs) {
			if (scope.$last){
				var num = scope.$index + 1;
				glb_answers = num;
				scope.updateAnswers();
			}
		};
	});	



	var DataManager = function($scope, $http, $filter, $location, $window) {
		$scope.applyHTML = function(index, last) {
			console.log("Applying Scope" + index)
			$scope.$apply(); //this triggers a $digest, without this line, the new ans divs don't show up
			document.getElementById("ans" + index).innerHTML = glb_answer_storage[index];
		};
		
	};

	BarnumApp.controller('questionManager', function( $scope, $http, $filter, $location, $window, $sce, $document, appConfig) {

		//For access Purposes
		$scope.user = {};
		$scope.user.authenticated = false;
		
		var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
		//console.log("Environment Configuration: " + restURLEndpoint)

		//Load session token into User's Token Scope
		if ($window.sessionStorage.barnum_token) {
			$scope.user.token = $window.sessionStorage.barnum_token;
			//console.log("Loaded Token from SessionStorage: " + $scope.user.token)
		}
		//console.log("You have a token: " + $scope.user.token)

		$scope.question = {};
		$scope.answers = {};
		$scope.loggedin = {};
		$scope.preview_data = {};
		$scope.tags = {};
		$scope.stats = {};
		$scope.question.title = "";
		$scope.question.description = "";

		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

		//Add Authorization to calls
		$http.defaults.headers.post["Authorization"] = $scope.user.token;
		
		$scope.checkLoginStatus = function(){
			console.log("--> Checking Login Status");

			//Define Rest Endpoint for Token Verification
			$scope.tokenQuery = restURLEndpoint + '/api/users/verifyToken';
			
			//Define token variable for verification
			postData = 'token=' + $scope.user.token; 			

			//Execute Post request
			$http.post($scope.tokenQuery, postData)
			.success(function(response) {
				$scope.users = response;
				//console.log(response)
				//console.log(response.token)

				if (response.token === "Expired") {
					sessionStorage.removeItem('barnum_token');
				}
				else {
					$scope.user.username = response.token.username;
					$scope.loggedin.username = response.token.username;
					$scope.user.authenticated = true;
					//console.log("Success: Username: " + $scope.user.username)
					//console.log($scope.user.username + ":" + $scope.loggedin.username + ":" + $scope.user.authenticated);
				}
							 	
			})
			.error(function(data, status, headers, config) {
				console.log("Error Verifying Token")
			});
		}

		$scope.populateTypeahead = function(answer_id, vote) {

		    console.log("--> Populating TypeAhead")

			$scope.typeAheadQuery = restURLEndpoint + '/api/archive/questions';

			$http.get($scope.typeAheadQuery)
			.success(function(response) {
				
				//Create an Array to Store the Archived Questions
				TypeAheaddata = []
				for (var i = 0; i < response.questions.length; i++) {
					TypeAheaddata.push(response.questions[i].questionTitle);
				};
		    	//console.log(data)

		    	//Populate the Bootstrap Search Control with the array
		    	$("#mySearch").typeahead({ source:TypeAheaddata });
			 	
			})
			.error(function(data, status, headers, config) {
				if (status === 403) {
					message = "TypeAhead Failed";
					$scope.queryError = message;

				}
				else {
					$scope.queryError = data;
				}
			});
		}


		$scope.voteAnswer = function(answer_id, vote) {

			if (!$scope.loggedin.username) {
       			//$scope.queryError = 'You Must be Logged in to vote';
       			toastr.options.closeButton = true;
				toastr.error('You Must be Logged in to vote')
				return;
				//return $scope.queryError;
      		}
			if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}	

			console.log("Received Vote for: " + answer_id + ":" + vote)

			$scope.authQuery = restURLEndpoint + '/api/questions/' + $scope.question.id + '/answer/' + answer_id + '/vote';
			console.log($scope.authQuery)
			
			//Assign all the incoming scope parameters to the post data variable
			postData = 'vote=' + vote + '&' + 'userName=' + $scope.loggedin.username;
						
			console.log(postData)

			$http.post($scope.authQuery, postData)
			.success(function(response) {
				//$scope.users = response;
				
				console.log(response)
				//Calling this function will update the model and update the screen immediately.
				$scope.getQuestionExtra();
							 	
			})
			.error(function(data, status, headers, config) {
				
				if (status === 403) {
					//message = "You Can Only Vote Once";

					//Added Toaster Button
					toastr.options.closeButton = true;
					toastr.error('You Can Only Vote Once')
					//alert(message)
					//$scope.queryError = message;
				}
				else {
					$scope.queryError = data;
				}
			});
		}

		$scope.updateAnswers = function() {
			$scope.question.answerCount = glb_answers;
		}

		$scope.acceptAnswer = function() {

			var answer_id = null;
			console.log('Index ' + document.getElementById('bookId2').value)
			answer_id = document.getElementById('bookId2').value;
			
			console.log("Answer " + answer_id + " has been accepted");
			if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}	

			console.log("Message: " + $scope.question.message);

			$scope.UpdateQuery = restURLEndpoint + '/api/questions/' + $scope.question.id + '/answer/' + answer_id;
			console.log($scope.UpdateQuery);

			var postData = 'userName=' + $scope.loggedin.username + '&' + 'message=' + $scope.question.message;

			$http.post($scope.UpdateQuery, postData)
			 .success(function(response) {
				$scope.users = response;
				$scope.searching = false;

				//Calling this function will update the model and update the screen immediately.
				$scope.getQuestionExtra();
				
				$scope.statusmsg = 'Answer has been accepted';
				return $scope;
				 	
			})
			.error(function(data, status, headers, config) {
				console.log(status)
				
				if (status === 403) {
					message = "You Are Not Authorized to Accept this answer";
					$scope.queryError = message;
				}
				else {
					$scope.queryError = data;
				}
			});
		}

		$scope.deleteAnswer = function(answer_id, vote) {

			if (!$scope.loggedin.username) {
       			$scope.queryError = 'You Must be Logged in to delete an answer';
				return $scope.queryError;
      		}
			if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}	

			console.log($scope.loggedin.username + " is trying to delete: " + answer_id)

			$scope.deleteQuery = restURLEndpoint + '/api/questions/' + $scope.question.id + '/answer/' + answer_id + '/delete';
			console.log($scope.deleteQuery)

			var postData = 'userName=' + $scope.loggedin.username;

			$http.post($scope.deleteQuery, postData)
			.success(function(response) {
				//$scope.users = response;
				
				console.log(response)

				//Calling this function will update the model and update the screen immediately.
				$scope.getQuestionExtra();
				glb_answer_id = null;
							 	
			})
			.error(function(data, status, headers, config) {
				
				if (status === 403) {
					message = "You Do not have access to delete this answer";
					//alert(message)
					$scope.queryError = message;
				}
				else {
					$scope.queryError = data;
				}
			});
		}

		$scope.setAnswerID = function(answer_id) {
			
			console.log(answer_id)
			glb_answer_id = answer_id;
		}
	
		$scope.getAnswerID = function() {
			
			return glb_answer_id;
		}

		$scope.updateHTML = function(answerBody, index) {
			//console.log()
	
			$scope.preview_data.zero = $sce.trustAsHtml(answerBody);
			//document.getElementById("ans0").innerHTML = answerBody;
			//console.log(document.getElementById("ans0"))
		}

		$scope.createQuestion = function() {

			$scope.question.title = $document[0].getElementById('title').innerHTML;
			$scope.question.description = $document[0].getElementById('article4').innerHTML;
			$scope.question.tags = $document[0].getElementById('comment').innerHTML;

			if (!$scope.loggedin.username) {
       			$scope.queryError = 'You Must be Logged in to create a question';
				return $scope.queryError;
      		}
      		if (!$scope.question.title) {
       			$scope.queryError = 'Question Title Required';
				return $scope.queryError;
      		}

      		if (!$scope.question.description) {
       			//$scope.queryError = 'Question Description Required';
				//return $scope.queryError;
      		}

			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.registerQuery = restURLEndpoint + '/api/questions';

			console.log($scope.registerQuery)

			$scope.question.title = $scope.question.title.replace(/[\u2018\u2019]/g, "'");
			$scope.question.title = $scope.question.title.replace(/[\u201C\u201D]/g, '"');
			$scope.question.title = $scope.question.title.replace(/([&/]|&(amp);)/g, function (m) { return glb_symbols[m]; });


			console.log("Angular sees this before encoding:\n")
			console.log($scope.question.description)

			//var fullQuestion = detectUrlProcessing($scope.question.description)
			var fullQuestion = $scope.question.description

			fullQuestion = sanitize(fullQuestion);
			//Replace Smartquotes with regular quotes based on codes
			//fullQuestion = fullQuestion.replace(/[\u2018\u2019]/g, "'");
			//fullQuestion = fullQuestion.replace(/[\u201C\u201D]/g, '"');

			encodedBody = fullQuestion.replace(/([@*+"=&;/]|&(amp|lt|gt|nbsp);)/g, function (m) { return glb_symbols[m]; });

			//encodedBody = $scope.question.description.replace(/([@*+"=&;/]|&(amp|lt|gt|nbsp);)/g, function (m) { return glb_symbols[m]; });
			encodedBody = encodedBody.replace(/\s+/g, '+');
			console.log(encodedBody)		

			//Tag Cleanup
			if ($scope.question.tags.slice(-1) === ',') {
				$scope.question.tags = $scope.question.tags.substr(0, $scope.question.tags.length-1);
			}

			$scope.question.tags = $scope.question.tags.toLowerCase();	

			postData = 'userName=' + $scope.loggedin.username + '&' + 'questionTitle=' + $scope.question.title + '&' + 'questionBody=' + encodedBody + '&' + 'tags=' + $scope.question.tags;
						
			console.log(postData)

			$http.post($scope.registerQuery, postData)
			.success(function(response) {
			
				//Convert MongoDB _id to id for angular
				response.content.id = response.content._id;
				$scope.question = response.content;
				console.log($scope.question.id)
				//location = "viewQuestionR.html?id=" + $scope.question.id;
				location = "viewquestionR.html?id=" + $scope.question.id;
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});
		};

		$scope.editQuestion = function() {

			$scope.question.title = $document[0].getElementById('title').innerHTML;
			$scope.question.description = $document[0].getElementById('article4').innerHTML;
			$scope.question.tags = $document[0].getElementById('comment').innerHTML;

			if (!$scope.loggedin.username) {
       			$scope.queryError = 'You Must be Logged in to create a question';
				return $scope.queryError;
      		}
      		if (!$scope.question.title) {
       			$scope.queryError = 'Question Title Required';
				return $scope.queryError;
      		}

      		if (!$scope.question.description) {
       			//$scope.queryError = 'Question Description Required';
				//return $scope.queryError;
      		}

      		if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}
			else {
				$scope.queryError = 'Question ID Required';
				return $scope.queryError;
			}

			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.registerQuery = restURLEndpoint + '/api/questions/' + $scope.question.id;

			console.log($scope.registerQuery)

			$scope.question.title = $scope.question.title.replace(/[\u2018\u2019]/g, "'");
			$scope.question.title = $scope.question.title.replace(/[\u201C\u201D]/g, '"');

			console.log("Angular sees this before encoding:\n")
			console.log($scope.question.description)

			//var fullQuestion = detectUrlProcessing($scope.question.description)
			var fullQuestion = $scope.question.description

			console.log("Raw: " + fullQuestion)
			//Replace Smartquotes with regular quotes based on codes
			fullQuestion = sanitize(fullQuestion);
			//fullQuestion = fullQuestion.replace(/[\u2018\u2019]/g, "'");
			//fullQuestion = fullQuestion.replace(/[\u201C\u201D]/g, '"');

			encodedBody = fullQuestion.replace(/([@*+"=&;/]|&(amp|lt|gt|nbsp);)/g, function (m) { return glb_symbols[m]; });

			//encodedBody = $scope.question.description.replace(/([@*+"=&;/]|&(amp|lt|gt|nbsp);)/g, function (m) { return glb_symbols[m]; });
			encodedBody = encodedBody.replace(/\s+/g, '+');
			console.log(encodedBody)		

			//Tag Cleanup
			if ($scope.question.tags.slice(-1) === ',') {
				$scope.question.tags = $scope.question.tags.substr(0, $scope.question.tags.length-1);
			}

			$scope.question.tags = $scope.question.tags.toLowerCase();	
		
			postData = 'userName=' + $scope.loggedin.username + '&' + 'questionTitle=' + $scope.question.title + '&' + 'questionBody=' + encodedBody + '&' + 'tags=' + $scope.question.tags;
						
			console.log(postData)

			$http.put($scope.registerQuery, postData)
			.success(function(response) {
			
				console.log(response.content[0])
				//Convert MongoDB _id to id for angular
				response.content[0].id = response.content[0]._id;
				$scope.question = response.content[0];

				$scope.question.id = response.content[0].id; 
				console.log($scope.question.id)
				//location = "viewQuestionR.html?id=" + $scope.question.id;
				location = "viewquestionR.html?id=" + $scope.question.id;
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});
		};

		$scope.editAnswer = function() {

			$scope.question.answerBody = $document[0].getElementById('newAnswer').innerHTML;

			if (!$scope.loggedin.username) {
       			$scope.queryError = 'You Must be Logged in to create a question';
				return $scope.queryError;
      		}
      		if (!$scope.question.answerBody) {
       			$scope.queryError = 'Answer Required';
				return $scope.queryError;
      		}

      		if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}
			else {
				$scope.queryError = 'Question ID Required';
				return $scope.queryError;
			}
			if (QueryString.ans_id) {
				$scope.question.ans_id = QueryString.ans_id;
			}
			else {
				$scope.queryError = 'Answer ID Required';
				return $scope.queryError;
			}

			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.updateQuery = restURLEndpoint + '/api/questions/' + $scope.question.id + '/answers/' + $scope.question.ans_id ;

			console.log($scope.updateQuery)

			//$scope.question.answerBody = $scope.question.answerBody.replace(/[\u2018\u2019]/g, "'");
			//$scope.question.answerBody = $scope.question.answerBody.replace(/[\u201C\u201D]/g, '"');
			$scope.question.answerBody = sanitize($scope.question.answerBody);

			console.log("Angular sees this before encoding:\n")
			console.log($scope.question.answerBody)

			encodedBody = $scope.question.answerBody.replace(/([@*+"=&;/]|&(amp|lt|gt|nbsp);)/g, function (m) { return glb_symbols[m]; });

			encodedBody = encodedBody.replace(/\s+/g, '+');
			console.log(encodedBody)		
		
			postData = 'userName=' + $scope.loggedin.username + '&' + 'answerBody=' + encodedBody;
						
			console.log(postData)

			$http.put($scope.updateQuery, postData)
			.success(function(response) {
			
				console.log(response.content[0])
				//Convert MongoDB _id to id for angular
				response.content[0].id = response.content[0]._id;
				$scope.question = response.content[0];

				$scope.question.id = response.content[0].id; 
				console.log($scope.question.id)
				//location = "viewQuestionR.html?id=" + $scope.question.id;
				location = "viewquestionR.html?id=" + $scope.question.id;
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});
		};

		$scope.createAnswer = function() {
		
			$scope.question.description = document.getElementById('newAnswer').innerHTML;

			/*
			if (!$scope.loggedin.username && glb_loggedin_username) {
				console.log("Username not carried over, but exists globally")
				$scope.loggedin.username = glb_loggedin_username;
			}
			*/
	
			if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}
	
			if (!$scope.loggedin.username) {
       			$scope.queryError = 'You Must be Logged in to answer';
				return $scope.queryError;
      		}
 
      		if (!$scope.question.description) {
       			$scope.queryError = 'You Must Enter an Answer';
				return $scope.queryError;
      		}

			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.registerAnswer = restURLEndpoint + '/api/questions/' + $scope.question.id;

			console.log($scope.registerAnswer)
			console.log("Angular sees this before encoding:\n")
			console.log("Raw HTML Answer: " + $scope.question.description)

			//Do not do this for creating answers..only on processing
			//var fullQuestion = detectUrlProcessing($scope.question.description)

			var fullQuestion = $scope.question.description

			//Replace Smartquotes with regular quotes based on codes
			fullQuestion = sanitize(fullQuestion);
			//fullQuestion = fullQuestion.replace(/[\u2018\u2019]/g, "'")
			//fullQuestion = fullQuestion.replace(/[\u201C\u201D]/g, '"');

			encodedBody = fullQuestion.replace(/([@*+"=&;/]|&(amp|lt|gt|nbsp);)/g, function (m) { return glb_symbols[m]; });
			//encodedBody = $scope.question.description.replace(/([@*+"=/]|&(amp|lt|gt|nbsp);)/g, function (m) { return glb_symbols[m]; });
			
			encodedBody = encodedBody.replace(/\s+/g, '+');

			console.log("Encoded Answer: " + encodedBody)		

			//Assign all the incoming scope parameters to the post data variable

			postData = 'userName=' + $scope.loggedin.username + '&' + 'answer=' + encodedBody;
						
			console.log(postData)

			$http.post($scope.registerAnswer, postData)
			.success(function(response) {
				$scope.users = response;
				$scope.statusmsg = 'Answer has been succesfully created';

				//Calling this function will update the model and update the screen immediately.
				$scope.getQuestionExtra();
				document.getElementById('newAnswer').innerHTML = "";
				return $scope;
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});
		};

		$scope.StatsAllQuestions = function() {
      		
			$scope.queryError = null;
			$scope.statusmsg = null;
		
			$scope.questionQuery = restURLEndpoint + '/api/stats/all/questions';
			console.log($scope.questionQuery)

			$http.get($scope.questionQuery)
			.success(function(response) {

				$scope.stats.question_all = response.stats;
				console.log(response)		 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});
		};

		$scope.StatsOpenQuestions = function() {
      		
			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.searched = true;
			$scope.searching = true;
		
			$scope.questionQuery = restURLEndpoint + '/api/stats/open/questions';
			console.log($scope.questionQuery)

			$http.get($scope.questionQuery)
			.success(function(response) {

				$scope.stats.question_open = response.stats;
				$scope.searching = false;
				console.log(response)
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});
		};

		$scope.StatsClosedQuestions = function() {
      		
			$scope.queryError = null;
			$scope.statusmsg = null;
		
			$scope.questionQuery = restURLEndpoint + '/api/stats/closed/questions';
			console.log($scope.questionQuery)

			$http.get($scope.questionQuery)
			.success(function(response) {

				$scope.stats.question_closed = response.stats;
				console.log(response)
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});
		};
		$scope.StatsUnansweredQuestions = function() {
      		
			$scope.queryError = null;
			$scope.statusmsg = null;		
			$scope.questionQuery = restURLEndpoint + '/api/stats/unanswered/questions';
			console.log($scope.questionQuery)

			$http.get($scope.questionQuery)
			.success(function(response) {

				$scope.stats.question_unanswered = response.stats;
				console.log(response)
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});
		};

		$scope.getMyQuestions = function() {

			if (QueryString.username) {
				$scope.question.username = QueryString.username;
			}
      		
      		console.log("--> Fetching My Questions")
			
			//Define Rest Endpoint
			$scope.questionQuery = restURLEndpoint + '/api/questions/self/' + $scope.question.username ;
			
			//Execute GET Request
			$http.get($scope.questionQuery)
			.success(function(response) {

				for (var i = 0; i < response.content.length; i++) {
					response.content[i].id = response.content[i]._id;
					if (response.content[i].answers) {
						response.content[i].answerCount = response.content[i].answers.length
					}
					else {
						response.content[i].answerCount = 0
					}
				}

				//Reverse order so most recent shows up on top
				$scope.questions = sortByKey(response.content, 'created_at').reverse()				 	
			})
			.error(function(data, status, headers, config) {
				console.log(data);
			});
		};

		$scope.getMyAnswers = function() {

			if (QueryString.username) {
				$scope.question.username = QueryString.username;
			}
      		
			console.log("--> Fetching My Answers")
		
			//Define Rest Endpoint
			$scope.questionQuery = restURLEndpoint + '/api/answers/self/' + $scope.question.username;

			//Execute GET Request
			$http.get($scope.questionQuery)
			.success(function(response) {

				for (var i = 0; i < response.content.length; i++) {
					response.content[i].id = response.content[i]._id;
					if (response.content[i].answers) {
						response.content[i].answerCount = response.content[i].answers.length
					}
					else {
						response.content[i].answerCount = 0
					}
				}

				//Reverse order so most recent shows up on top
				$scope.answers = sortByKey(response.content, 'created_at').reverse()						 	
			})
			.error(function(data, status, headers, config) {
				console.log(data);
			});
		};

		$scope.getRecentQuestions = function() {

			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.searched = true;
			$scope.searching = true;

			console.log("--> Fetching Recent Questions")
		
			//Define REST Endpoint for Recent Questions
			$scope.questionQuery = restURLEndpoint + '/api/questions/search/recent/all' ;

			//Execute GET Request
			$http.get($scope.questionQuery)
			.success(function(response) {

				for (var i = 0; i < response.content.length; i++) {
					response.content[i].id = response.content[i]._id;
				}
				$scope.questions = response.content
				$scope.searching = false;		 	
			})
			.error(function(data, status, headers, config) {
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});
		};

		$scope.getAnswerOnly = function() {

			console.log("retrieving Answer")
			if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}

			if (QueryString.ans_id) {
				$scope.question.ans_id = QueryString.ans_id;
			}

			$scope.queryError = null;
			$scope.statusmsg = null;

			$scope.questionQuery = restURLEndpoint + '/api/questions/simple/' + $scope.question.id ;
			console.log($scope.questionQuery)

			$http.get($scope.questionQuery)
			.success(function(response) {

				console.log($scope.question.ans_id)

				var answerBody = null;
				for (var i = 0; i < response.content[0].answers.length; i++) {
					console.log(response.content[0].answers[i])
					if (response.content[0].answers[i].id == $scope.question.ans_id) {
						answerBody = response.content[0].answers[i].answerBody;
					}
					//response.content[i].id = response.content[i]._id;
				}

				//document.getElementById('newAnswer').innerHTML = response.content[0].answers[1].answerBody;
				document.getElementById('newAnswer').innerHTML = answerBody;

			})

			.error(function(data, status, headers, config) {
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});	

		};

		$scope.getQuestionOnly = function() {

			console.log("retrieving Question")
			if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}

			$scope.queryError = null;
			$scope.statusmsg = null;

			$scope.questionQuery = restURLEndpoint + '/api/questions/simple/' + $scope.question.id ;
			console.log($scope.questionQuery)

			$http.get($scope.questionQuery)
			.success(function(response) {

				document.getElementById('title').innerHTML = response.content[0].questionTitle;
				document.getElementById('article4').innerHTML = response.content[0].questionBody;
				document.getElementById('comment').innerHTML = response.content[0].tags;
			})

			.error(function(data, status, headers, config) {
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});	

		};

		$scope.getQuestionExtra = function() {

			console.log("--> Retrieving Question")
			if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}

			if (!$scope.question.id) {
       			$scope.queryError = 'You Must provide a question ID';
				return $scope.queryError;
			}
      		
			$scope.queryError = null;
	
			//Define REST Endpoint
			$scope.questionQuery = restURLEndpoint + '/api/questions/extra/' + $scope.question.id ;
			
			//Execute GET Request
			$http.get($scope.questionQuery)
			.success(function(response) {

				for (var i = 0; i < response.content.length; i++) {
					//Convert _id to id for Angular
					response.content[i].id = response.content[i]._id;
					//Detect URLs in qquestion body
					response.content[i].questionBody = detectUrlProcessing(response.content[i].questionBody)
				}


				//Normalize Point Scoring for the Person Who asked the question
				response.content[0].userdata_acceptedAnswers = response.content[0].userdata_acceptedAnswers * glb_AcceptedAnswerMultiplier;
				response.content[0].userdata_answerCount = response.content[0].userdata_answerCount;
				all_points = response.content[0].userdata_acceptedAnswers + response.content[0].userdata_answerCount;
				response.content[0].userdata_badgeImage = gamify('image',all_points, false);
				response.content[0].userdata_badgeLabel = gamify('text',all_points);
				response.content[0].userdata_all_points = all_points; 

				if 	(response.content[0].answers) {
					//Normalize Point Scoring for people that Answered
					for (var i = 0; i < response.content[0].answers.length; i++) {
						response.content[0].answers[i].userdata_acceptedAnswers = response.content[0].answers[i].userdata_acceptedAnswers * glb_AcceptedAnswerMultiplier;
						response.content[0].answers[i].userdata_answerCount = response.content[0].answers[i].userdata_answerCount;
						all_points = response.content[0].answers[i].userdata_acceptedAnswers + response.content[0].answers[i].userdata_answerCount;
						response.content[0].answers[i].userdata_badgeImage = gamify('image',all_points, false);
						response.content[0].answers[i].userdata_badgeLabel = gamify('text',all_points);
						response.content[0].answers[i].userdata_all_points = all_points;

						//Detect URLs in Answers
						response.content[0].answers[i].answerBody = detectUrlProcessing(response.content[0].answers[i].answerBody)
					};
					$scope.question.answers = response.content[0].answers;
				}

				//Process Tags
				var tags = [];
				if 	(response.content[0].tags) {

					//Split Tags up by commas
					tags = response.content[0].tags.split(",")

					//Trim Whitespace on Tags
					for (var i = 0; i < tags.length; i++) {
						tags[i] = tags[i].trim();
					};
					
					//Remove Duplicates from the tag array
					tags = tags.filter(function(item, pos) {
    					return tags.indexOf(item) == pos;
					})
				}

				$scope.tags = tags;
				$scope.question = response.content[0];
	
				//console.log("Returned: " + response.content[0].questionBody)

				//Reorder Answers if Closed so Accepted is on top
				if ($scope.question.status === 'closed') {

					//Re-order to put accepted answer on top
					response.content[0].answers = sortByKey(response.content[0].answers, 'accepted').reverse()

					//Assign new order to scope variable
					$scope.question = response.content[0];

					//Set Status for NG-Hide Filters
					$scope.question.closed = true;
				}
				
				//Populate the Question 
				document.getElementById('questionTitle').innerHTML = response.content[0].questionTitle;
				document.getElementById('questionBody').innerHTML = response.content[0].questionBody;

				
				glb_answer_storage = [];
				glb_tags = response.content[0].tags;

				if (response.content[0].answers) {
					for (var i = 0; i < response.content[0].answers.length; i++) {
						glb_answer_storage.push(response.content[0].answers[i].answerBody);

					};
				}
				else {
					$scope.question.answerCount = 0;
				}				 	
			})
			.error(function(data, status, headers, config) {
				console.log(data);
			});
		};
	});

	BarnumApp.controller('emailManager', function( $scope, $http, $filter, $location, $window, appConfig) {	

		$scope.email = {};
		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";	

		var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;

		$scope.sendEmail = function() {
			console.log("Sending Email")

			if (!$scope.email.body) {
	   			$scope.queryError = 'You Must provide a messsage';
				return $scope.queryError;
			}
			console.log($scope.email.body)

			$scope.Query = restURLEndpoint + '/api/feedback';
			
			postData = 'message=' + $scope.email.body;			
			console.log(postData)
			$http.post($scope.Query, postData)
			
			.success(function(response) {
				$scope.email.confirmation = "Thank You";
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});	
		}
	});

	BarnumApp.controller('searchManager', function( $scope, $http, $filter, $location, $window, appConfig) {	
	
		var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;	

		$scope.question = {};
		
		if (QueryString.query) {
			$scope.question.query = QueryString.query;
		}

		if (!$scope.question.query) {
			$scope.question.query = "*"
		}
		//console.log('scope.question.query:' + $scope.question.query )
		
		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";	

		$scope.searchSimilarQuestionsElasticSearch = function() {
			
			$scope.question.query = glb_tags.replace(/,/g, '*').replace(/ /g,'');
			//console.log('query will be: ' + $scope.question.query)

			//Get Question ID, so it can be removed from the recommendations
			if (QueryString.id) {
				$scope.question.id = QueryString.id;
			}
      		
			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.searched = true;
			$scope.searching = true;
		
			//Define Rest Endpoint
			$scope.searchQuery = restURLEndpoint + '/api/questions/search/similar/' + $scope.question.query;

			//Execute GET Rquest
			$http.get($scope.searchQuery)
			.success(function(response) {

				var orig;
				for (var i = 0; i < response.hits.length; i++) {
					response.hits[i].id = response.hits[i]._id;
					if (response.hits[i].questionTitle.length > 100) {
						response.hits[i].questionTitle = response.hits[i].questionTitle.substring(0, 100) + "...";
					}
					if ($scope.question.id === response.hits[i].id) {
						orig = i;
					}
				};

				//Remove the original question from the array of similar questions
				response.hits.splice(orig, 1);

				$scope.questions = response.hits;
				$scope.searching = false;
				$scope.search_complete = true;
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});	

		};

		$scope.searchQuestionsElasticSearch = function() {

			console.log("--> Running Elastic Search")
			if (!$scope.question.query) {
       			$scope.queryError = 'You Must provide a query';
				return $scope.queryError;
			}

			//console.log($scope.question.query)

			//Remove trailing Space if it exists
			if ($scope.question.query.slice(-1) === ' ') {
				$scope.question.query = $scope.question.query.substr(0, $scope.question.query.length-1);
			}
			if ($scope.question.query.slice(-1) === ' ') {
				$scope.question.query = $scope.question.query.substr(0, $scope.question.query.length-1);
			}		

			//Remove Quotes
			$scope.question.query = $scope.question.query.replace(/%22/g,'');  // "
			$scope.question.query = $scope.question.query.replace(/%3F/g,'');  // ?
			$scope.question.query = $scope.question.query.replace(/%26/g,'');  // &
			$scope.question.query = $scope.question.query.replace(/%27/g,'');  // ''
			
			//console.log($scope.question.query)
      		
			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.searched = true;
			$scope.searching = true;
		
			$scope.searchQuery = restURLEndpoint + '/api/questions/search/' + $scope.question.query;

			$http.get($scope.searchQuery)
			
			.success(function(response) {
				
				//Change _id to id so it doesn't break angular
				for (var i = 0; i < response.hits.length; i++) {
					response.hits[i].id = response.hits[i]._id;

					//console.log(response.hits[i].questionBody.length)
					if (response.hits[i].questionTitle.length > 100) {
						response.hits[i].questionTitle = response.hits[i].questionTitle.substring(0, 100) + "...";
					}
					if (response.hits[i].questionBody.length > 200) {
						response.hits[i].questionBody = response.hits[i].questionBody.substring(0, 200) + "...";
					}

					//Very Elegant removal of HTML tags calling function defined below
					response.hits[i].questionBody = strip(response.hits[i].questionBody);
					

					if (response.hits[i].answers) {
				 		response.hits[i].num_of_answers = response.hits[i].answers.length;
				 	}
				 	else  {
				 		response.hits[i].num_of_answers = 0;
				 	}; 
				};

				$scope.questions = response.hits;
		
				$scope.num_of_results = response.hits.length;
				$scope.original_query = $scope.question.query;
				$scope.searching = false;
				$scope.search_complete = true; 	
			})
			.error(function(data, status, headers, config) {
				
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});	
		};

		$scope.searchQuestionsElasticSearchOpen = function() {

			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.searched = true;
			$scope.searching = true;
		
			$scope.searchQuery = restURLEndpoint + '/api/questions/all/open';
		
			console.log('URL:' + $scope.searchQuery)

			$http.get($scope.searchQuery)
			
			.success(function(response) {
				
				//Change _id to id so it doesn't break angular
				for (var i = 0; i < response.hits.length; i++) {
					response.hits[i].id = response.hits[i]._id;

					console.log(response.hits[i].questionBody.length)
					if (response.hits[i].questionTitle.length > 100) {
						response.hits[i].questionTitle = response.hits[i].questionTitle.substring(0, 100) + "...";
					}
					if (response.hits[i].questionBody.length > 200) {
						response.hits[i].questionBody = response.hits[i].questionBody.substring(0, 200) + "...";
					}

					//Very Elegant removal of HTML tags calling function defined below
					response.hits[i].questionBody = strip(response.hits[i].questionBody);
					

					if (response.hits[i].answers) {
				 		response.hits[i].num_of_answers = response.hits[i].answers.length;
				 	}
				 	else  {
				 		response.hits[i].num_of_answers = 0;
				 	}; 
				};

				$scope.questions = response.hits;
		
				$scope.num_of_results = response.hits.length;
				$scope.original_query = $scope.question.query;
				$scope.searching = false;
				$scope.search_complete = true;
			})
			.error(function(data, status, headers, config) {
				
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});	
		};

		$scope.searchQuestionsElasticHotQuestions = function() {
		
			console.log("--> Fetching Hot Questions")

			//Defining REST Endpoint for Hot Questions
			$scope.searchQuery = restURLEndpoint + '/api/questions/search/hot/all';
		
			//Executing GET Request
			$http.get($scope.searchQuery)
			
			.success(function(response) {

				//Change _id to id so it doesn't break angular
				for (var i = 0; i < response.hits.length; i++) {
					//console.log("Printing title " + response.hits[i].questionTitle)
					response.hits[i].id = response.hits[i]._id;
				};

				$scope.questions = response.hits;
				//$scope.num_of_results = response.hits.length;
				//$scope.original_query = $scope.question.query;
			})
			.error(function(data, status, headers, config) {
				console.log(data);
			});	
		};
	
	
		$scope.searchQuestionsElasticSearchUnanswered = function() {

			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.searched = true;
			$scope.searching = true;
		
			$scope.searchQuery = restURLEndpoint + '/api/questions/all/unanswered';
		
			console.log('URL:' + $scope.searchQuery)

			$http.get($scope.searchQuery)
			
			.success(function(response) {
				
				//Change _id to id so it doesn't break angular
				for (var i = 0; i < response.hits.length; i++) {
					response.hits[i].id = response.hits[i]._id;

					console.log(response.hits[i].questionBody.length)
					if (response.hits[i].questionTitle.length > 100) {
						response.hits[i].questionTitle = response.hits[i].questionTitle.substring(0, 100) + "...";
					}
					if (response.hits[i].questionBody.length > 200) {
						response.hits[i].questionBody = response.hits[i].questionBody.substring(0, 200) + "...";
					}

					//Very Elegant removal of HTML tags calling function defined below
					response.hits[i].questionBody = strip(response.hits[i].questionBody);
					

					if (response.hits[i].answers) {
				 		response.hits[i].num_of_answers = response.hits[i].answers.length;
				 	}
				 	else  {
				 		response.hits[i].num_of_answers = 0;
				 	}; 
				};

				$scope.questions = response.hits;
		
				$scope.num_of_results = response.hits.length;
				$scope.original_query = $scope.question.query;
				$scope.searching = false;
				$scope.search_complete = true;
			})
			.error(function(data, status, headers, config) {
				
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});	
		};
	});

	//var UserManager = function($scope, $http, $filter, $location, $window) {
	BarnumApp.controller('UserManager', function( $scope, $http, $filter, $location, $window, appConfig) {

		$scope.user = {};
		$scope.stats = {};
		var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
		//console.log("Configuration: " + restURLEndpoint)	

		if ($window.sessionStorage.barnum_token) {
			$scope.user.token = $window.sessionStorage.barnum_token;
		}

		//This is required or it will send as JSON by default and fail
		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

		$scope.StatsAllUsers = function() {
      		
			$scope.queryError = null;
			$scope.statusmsg = null;
			$scope.searched = true;
			$scope.searching = true;
		
			$scope.questionQuery = restURLEndpoint + '/api/stats/all/users';
			console.log($scope.questionQuery)

			$http.get($scope.questionQuery)
			.success(function(response) {

				$scope.stats.users_all = response.stats;
				$scope.searching = false;
				console.log(response)
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.searched = false;
				$scope.searching = false;
				$scope.queryError = data;
			});
		};
		
		$scope.getTopTen = function() {
      		
			$scope.queryError = null;
			$scope.statusmsg = null;
		
			console.log("--> Loading Leaderboard")

			//Define Rest Endpoint
			$scope.searchQuery = restURLEndpoint + '/api/leaderboard/topten';

			//Execute GET Request
			$http.get($scope.searchQuery)
			.success(function(response) {

				//Convert _id to id for Angular
				for (var i = 0; i < response.topten.length; i++) {
					response.topten[i].id = response.topten[i]._id;
				}

				if 	(response.topten) {

					//Normalize Point Scoring
					console.log("--> Applying Scores")
					for (var i = 0; i < response.topten.length; i++) {
						//console.log("Loading: " + response.topten[i].username)
						response.topten[i].userdata_acceptedAnswers = response.topten[i].acceptedAnswers * glb_AcceptedAnswerMultiplier;
						response.topten[i].userdata_answerCount = response.topten[i].answerCount;
						//Other Score Factors..such as total answers
						all_points = response.topten[i].userdata_acceptedAnswers + response.topten[i].userdata_answerCount;
						response.topten[i].userdata_badgeImage = gamify('image',all_points, false);
						response.topten[i].userdata_badgeLabel = gamify('text',all_points);
						response.topten[i].userdata_all_points = all_points;
						//console.log(response.topten[i].userdata_badgeImage)
					};
					$scope.user = response.topten;
				}
				else {
				console.log(response)
				}			 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = data;
			});	
		};

		$scope.getUserProfile = function() {

			if (QueryString.username) {
				$scope.user.username = QueryString.username;
			}
			
			if (!$scope.user.username) {
       			$scope.queryError = 'You Must provide a username';
				return $scope.queryError;
			}
		
			console.log("--> Fetching User Profile")

			//Define REST Endpoint
			$scope.searchQuery = restURLEndpoint + '/api/users/' + $scope.user.username ;

			//Execute GET Request
			$http.get($scope.searchQuery)
			.success(function(response) {

				if 	(response.users) {
					response.users[0].userdata_acceptedAnswers = response.users[0].acceptedAnswers * glb_AcceptedAnswerMultiplier;
					response.users[0].userdata_answerCount = response.users[0].answerCount;
					all_points = response.users[0].userdata_acceptedAnswers + response.users[0].userdata_answerCount;
					response.users[0].userdata_badgeImage = gamify('image',all_points, true);
					response.users[0].userdata_badgeLabel = gamify('text',all_points, false);
					response.users[0].userdata_levelup = gamify('levelup',all_points, false);
					response.users[0].userdata_levelbase = gamify('levelbase',all_points, false);
					response.users[0].userdata_all_points = all_points;
					$scope.user = response.users[0];
				}
				else {
				console.log(response)	
				}		 	
			})
			.error(function(data, status, headers, config) {
				console.log(data);
			});	
		};

		$scope.authenticateUser = function() {
		
			$scope.user.authenticated = false;
			$scope.user.token = null;

			console.log($scope.user.username)
			if (!$scope.user.username) {
       			$scope.queryError = 'Username Required';
				return $scope.queryError;
      		}
      		if (!$scope.user.password) {
       			$scope.queryError = 'Password Required';
				return $scope.queryError;
      		}

			$scope.queryError = null;
			$scope.statusmsg = null;
		
			$scope.authQuery = restURLEndpoint + '/api/users/Authenticate';
			console.log($scope.authQuery)

			postData = 'userName=' + $scope.user.username + '&' + 'password=' + $scope.user.password + '&' + 'token=' + $scope.user.token; 		
			console.log(postData)

			$http.post($scope.authQuery, postData)
			.success(function(response) {
				$scope.users = response;
				console.log(response)

				//Create a Local Sessage Object to store token"
				$scope.user.token = response.token;
				sessionStorage.barnum_token = response.token;
				$scope.user.authenticated = true;

				console.log($scope.user.username + ":" + $scope.user.authenticated);
				window.location.href = "index.html";			 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = "UserName or Password was incorrect";
			});
		};

		$scope.authenticateUserReal = function() {
		
			$scope.user.authenticated = false;
			$scope.user.token = null;

			console.log($scope.user.username)
			if (!$scope.user.username) {
       			$scope.queryError = 'Username Required';
				return $scope.queryError;
      		}
      		if (!$scope.user.password) {
       			$scope.queryError = 'Password Required';
				return $scope.queryError;
      		}

      		//Lower Case Username for consistency in profiles
      		$scope.user.username = $scope.user.username.toLowerCase();

			$scope.queryError = null;
			$scope.statusmsg = null;
		
			$scope.authQuery = restURLEndpoint + '/api/users/authenticateReal';
			console.log($scope.authQuery)

			postData = 'userName=' + $scope.user.username + '&' + 'password=' + $scope.user.password; 		
			console.log(postData)

			$http.post($scope.authQuery, postData)
			.success(function(response) {
				$scope.users = response;
				console.log(response)

				//Create a Local Sessage Object to store token"
				$scope.user.token = response.token;
				sessionStorage.barnum_token = response.token;
				$scope.user.authenticated = true;

				console.log($scope.user.username + ":" + $scope.user.authenticated);

				if (QueryString.referrer) {

					//Must Convert ? to %3F
					//Must convert = to %3D
					//URL Decode
					console.log("before: " + QueryString.referrer)
					QueryString.referrer = QueryString.referrer.replace("%3F","?")
					QueryString.referrer = QueryString.referrer.replace("%3D","=")
					console.log("After: " + QueryString.referrer)
					window.location.href = QueryString.referrer;
				}
				else {
					window.location.href = "index.html";
				}
							 	
			})
			.error(function(data, status, headers, config) {
				$scope.queryError = "UserName or Password was incorrect";
				console.log("Invalid Credentials")
			});
		};

	});

	/******* Discovers URL Strings and turns them into Hyperlinks ********/
	function detectUrlProcessing(description) {
		//console.log("Entering detectUrlProcessing:" + description)
		var find = '<div>';
		var re = new RegExp(find, 'g');
		description = description.replace(re, ' <div> ');

		//console.log("After DIV remove:" + description)
		find = '<\/div>';
		re = new RegExp(find, 'g');
		description = description.replace(re, ' </div> ');
		//console.log("After /DIV remove:" + description)

		find = '<br>';
		re = new RegExp(find, 'g');
		description = description.replace(re, ' <br> ');


		find = '&nbsp;';
		re = new RegExp(find, 'g');
		description = description.replace(re, ' ');

		//Convert Bullet Point Codes to Dashes
		find = ' b"';
		re = new RegExp(find, 'g');
		description = description.replace(re, ' - ');

		/*find = 'b "';
		re = new RegExp(find, 'g');
		description = description.replace(re, ' - ');	
		*/
		//console.log(description)
		var allWords = description.split(" ");
		//console.log(allWords.length)
		var fullQuestion;
		for (var i = 0; i < allWords.length; i++) {

			//Lowercase - due to Http:// issue
			//allWords[i] = allWords[i].toLowerCase(); 

			if (allWords[i].toLowerCase().indexOf("http://") !== -1 || allWords[i].toLowerCase().indexOf("https://") !== -1) {
				
				//Check and remove any ( )
				allWords[i] = allWords[i].toLowerCase();
				allWords[i] = allWords[i].replace(/[()]/g,'');

				//console.log("URL Detected: " + allWords[i])

				/*
				//New code
				//http://ts1.merck.com/com/mmd_it_compliance/lists/mrl Contacts/DispForm.aspx?ID=104

				//Only check if there are words left
				console.log(i)
				console.log(allWords.length)
				if (i < allWords.length) {
					console.log("Passed Condition:  Not Last Word")
					if (allWords[i+1].indexOf("/")) {
						allWords[i] = '<a target="_new" style="color: blue" href="' + allWords[i] + '%20' + allWords[i+1] + '">' + allWords[i]  + "</a>"
					}
				}

				else {
					console.log("Single Word")
					allWords[i] = '<a target="_new" style="color: blue" href="' + allWords[i] + '">' + allWords[i] + "</a>"
				}	
				*/

				allWords[i] = '<a target="_new" style="color: blue" href="' + allWords[i] + '">' + allWords[i] + "</a>"
				//console.log("HyperLinked: " + allWords[i])
			}
			else if (allWords[i].toLowerCase().indexOf("@merck.com") !== -1) {
				
				//Check and remove any ( )
				allWords[i] = allWords[i].toLowerCase();
				allWords[i] = allWords[i].replace(/[()]/g,'');

				//console.log("Email Detected: " + allWords[i])
				allWords[i] = '<a target="_top" style="color: blue" href="mailto:' + allWords[i] + '">' + allWords[i] + "</a>"
				//console.log("HyperLinked: " + allWords[i])
			}

			//Link, but does not have http listed, we need to add it
			else if (allWords[i].toLowerCase().indexOf("www") !== -1 || allWords[i].toLowerCase().indexOf(".com") !== -1) {
				
				//Check and remove any ( )
				allWords[i] = allWords[i].toLowerCase();
				allWords[i] = allWords[i].replace(/[()]/g,'');

				//console.log("URL Detected with HTTP Prefix: " + allWords[i])
				allWords[i] = '<a target="_new" style="color: blue" href="http://' + allWords[i] + '">' + allWords[i] + "</a>"
				//console.log("HyperLinked: " + allWords[i])
			}
			if (fullQuestion === undefined) {
				fullQuestion = allWords[i];
			}
			else  {
			fullQuestion = fullQuestion + ' ' + allWords[i]
			}

		};
		//console.log("Returning:" + fullQuestion)
		return fullQuestion;

	} 

	function sanitize(data) {
		var sanitized_data = null;

		//Replace Smartquotes with regular quotes based on codes
		sanitized_data = data.replace(/[\u2018\u2019]/g, "'");
		sanitized_data = sanitized_data.replace(/[\u201C\u201D]/g, '"');

	
		//sanitized_data = data.replace(/lt;span style=\\"line-height: 1.45;\\"&gt;/g, "");
	
		

		console.log("sanitized data: " + sanitized_data )
		return sanitized_data;
	}

	//Custom Array Sorter - Pass Array and then sort key
	function sortByKey(array, key) {
	    return array.sort(function(a, b) {
	        var x = a[key]; var y = b[key];
	        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	    });
	}

	//Elegant function to let the browser strip HTML tags for you.
	function strip(html)
	{
	   var tmp = document.createElement("DIV");
	   tmp.innerHTML = html;
	   return tmp.textContent || tmp.innerText || "";
	}

	// Custom Function to get Querystring values from the URL
	// Usage - var value = QueryString.keyname
	var QueryString = function () {
	  // This function is anonymous, is executed immediately and 
	  // the return value is assigned to QueryString!
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	        // If first entry with this name
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = pair[1];
	        // If second entry with this name
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]], pair[1] ];
	      query_string[pair[0]] = arr;
	        // If third or later entry with this name
	    } else {
	      query_string[pair[0]].push(pair[1]);
	    }
	  } 
	    return query_string;
	} ();