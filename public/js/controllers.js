var glb_username = '';
glb_listing_id = '';
var glb_title = "";

var BrimstoneApp = angular.module('brimstone', ['app.config','ngFileUpload'], function( appConfig) {
	
	//Print Out Environment Information When module is instantiated
	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	console.log("Environment Configuration: " + restURLEndpoint)
});

BrimstoneApp.directive('myRepeatDirective', function() {
	return function(scope, element, attrs) {
		if (scope.$last){
			var num = scope.$index + 1;
			glb_answers = num;
			scope.updateAnswers();
		}
	};
});	


//BrimstoneApp.controller('MyCtrl', ['$scope', 'Upload', 'appConfig', function ($scope, Upload, appConfig) {
BrimstoneApp.controller('MyCtrl', function( $scope, $http, $filter, $location, $window, $document, appConfig, Upload) {

	$scope.listing = {};

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    if (QueryString.id) {
		$scope.listing.id = QueryString.id;
	}

    var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
    console.log("Passed in appconfig: " + restURLEndpoint)
    //console.log($scope.listing.id)

    //TO DO - Why is this not reading globals?
    console.log(glb_username)
    console.log(glb_title)

    $scope.uploadQuery = "http://localhost:80" + '/api/uploader';
    // set default directive values
    // Upload.setDefaults( {ngf-keep:false ngf-accept:'image/*', ...} );
    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: $scope.uploadQuery,
                    fields: {'username': $scope.username, 'id': $scope.listing.id},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    location = "viewlisting.html?id=" + $scope.listing.id;
                }).error(function (data, status, headers, config) {
                    console.log('error status: ' + status);
                })
            }
        }
    };

    $scope.skipImage = function () {

		if (QueryString.id) {
			$scope.listing.id = QueryString.id;
		}
    	location = "viewListing.html?id=" + $scope.listing.id; 
    }

});
//}]);


		

BrimstoneApp.controller('listingManager', function( $scope, $http, $filter, $location, $window, $document, appConfig) {
	
	$scope.listing = {};

	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	
	//This is required or it will send as JSON by default and fail
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";

	$scope.addListing = function() {

		username = glb_username;
	
		console.log(username)
		console.log($scope.listing.title)


		if ($scope.listing.humanoid != 5) {
			console.log("Failed:" + $scope.listing.humanoid)
   			$scope.queryError = 'You Failed the Human Test';
			return $scope.queryError;
  		}

		if (!$scope.listing.title) {
   			$scope.queryError = 'Title Required';
			return $scope.queryError;
  		}

  		if (!$scope.listing.zipcode) {
   			$scope.queryError = 'zipcode Required';
			return $scope.queryError;
  		}

		$scope.queryError = null;
		$scope.statusmsg = null;

		//Define REST Endpoint
		$scope.registerQuery = restURLEndpoint + '/api/listings';
		console.log('URL:' + $scope.registerQuery)
		
		//Assign all the incoming scope parameters to the post data variable
		postData = 'username=' + glb_username + '&' + 'title=' + $scope.listing.title + '&' + 'description=' + $scope.listing.description + '&' + 
				   'price=' + $scope.listing.price + '&' + 'zipcode=' + $scope.listing.zipcode + '&' + 'location=' + $scope.listing.location + '&' + 
				   'make=' + $scope.listing.make + '&' + 'model=' + $scope.listing.model + '&' + 'dimensions=' + $scope.listing.dimensions  + '&' + 
				   'condition=' + $scope.listing.condition + '&' + 'contact_phone=' + $scope.listing.contact_phone  + '&' + 
				   'contact_email=' + $scope.listing.contact_email ; 
					
		console.log(postData)

		$http.post($scope.registerQuery, postData)
		.success(function(response) {
			
			//Convert to .id for angular
			response.listing.id = response.listing._id;
			$scope.listing = response.listing;
			glb_title = $scope.listing.title;
			location = "addImage.html?id=" + $scope.listing.id;
						 	
		})
		.error(function(data, status, headers, config) {
			$scope.queryError = data;
		});
	};

	$scope.getListing = function() {

		console.log("Getting Listing")
		if (QueryString.id) {
			$scope.listing.id = QueryString.id;
		}

		$scope.queryError = null;
		$scope.statusmsg = null;

		$scope.listingQuery = restURLEndpoint + '/api/listings/' + $scope.listing.id ;
		console.log($scope.listingQuery)

		$http.get($scope.listingQuery)
		.success(function(response) {

			$scope.listing = response.listing[0]
			//$scope.listing.id = response.listing[0].id
			console.log($scope.listing)
		})

		.error(function(data, status, headers, config) {
			$scope.queryError = data;
		});	

	};

	$scope.getMyListings = function() {

		if (QueryString.username) {
			$scope.listing.username = QueryString.username;
		}
  		
  		console.log("--> Fetching My Listings")
		
		//Define Rest Endpoint
		$scope.listingQuery = restURLEndpoint + '/api/listings/profile/' + $scope.listing.username ;
		
		//Execute GET Request
		$http.get($scope.listingQuery)
		.success(function(response) {

			for (var i = 0; i < response.listing.length; i++) {
				response.listing[i].id = response.listing[i]._id;
			}

			//Reverse order so most recent shows up on top
			$scope.listings = sortByKey(response.listing, 'created_at').reverse()				 	
		})
		.error(function(data, status, headers, config) {
			console.log(data);
		});	
	};

	$scope.updateImage = function () {

		if (QueryString.id) {
			$scope.listing.id = QueryString.id;
		}
    	console.log("Changing Image")
    	console.log("scope Listing ID " + $scope.listing.id)
    	location = "addImage.html?id=" + $scope.listing.id; 
    }


});
	

BrimstoneApp.controller('UserManager', function( $scope, $http, $filter, $location, $window, appConfig) {	

	$scope.user = {};
	$scope.authuser = {};
	$scope.loggedin = {};
	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	//console.log("Configuration: " + restURLEndpoint)	

	if ($window.sessionStorage.brimstone_token) {
		$scope.user.token = $window.sessionStorage.brimstone_token;
	}

	//This is required or it will send as JSON by default and fail
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";

	$scope.addUser = function() {
	
		console.log($scope.user.username)
		if (!$scope.user.username) {
   			$scope.queryError = 'Username Required';
			return $scope.queryError;
  		}
  		if (!$scope.user.password) {
   			$scope.queryError = 'Password Required';
			return $scope.queryError;
  		}

  		if (!$scope.user.lastname) {
   			$scope.queryError = 'Lastname Required';
			return $scope.queryError;
  		}

		$scope.queryError = null;
		$scope.statusmsg = null;

		//Define REST Endpoint
		$scope.registerQuery = restURLEndpoint + '/api/users';
		console.log('URL:' + $scope.registerQuery)
		
		//Assign all the incoming scope parameters to the post data variable
		postData = 'username=' + $scope.user.username + '&' + 'firstname=' + $scope.user.firstname + '&' + 'lastname=' + $scope.user.lastname + '&' + 
				   'password=' + $scope.user.password + '&' + 'zipcode=' + $scope.user.zipcode + '&' + 'email=' + $scope.user.email + '&' + 
				   'company_name=' + $scope.user.company_name; 
					
		console.log(postData)

		$http.post($scope.registerQuery, postData)
		.success(function(response) {
			$scope.users = response;
			
			//sessionStorage.brimstone_token = $scope.user.username;
			window.location.href = "index.html";
						 	
		})
		.error(function(data, status, headers, config) {
			//alert("Bad things happening with Forbin.\n\nHTTP Status: " + status + "\n\n" + data);
			$scope.searched = false;
			$scope.searching = false;
			$scope.queryError = data;
		});
	};

	$scope.editUser = function() {
	
		console.log($scope.user.username)
		if (!$scope.user.username) {
   			$scope.queryError = 'Username Required';
			return $scope.queryError;
  		}
  		if (!$scope.user.password) {
   			$scope.queryError = 'Password Required';
			return $scope.queryError;
  		}

  		if (!$scope.user.lastname) {
   			$scope.queryError = 'Lastname Required';
			return $scope.queryError;
  		}

		$scope.queryError = null;
		$scope.statusmsg = null;

		//Define REST Endpoint
		$scope.editQuery = restURLEndpoint + '/api/users/' + $scope.user.username;
		console.log('URL:' + $scope.editQuery)		

		//Assign all the incoming scope parameters to the post data variable
		postData = 'firstname=' + $scope.user.firstname + '&' + 'lastname=' + $scope.user.lastname + '&' + 
				   'password=' + $scope.user.password + '&' + 'zipcode=' + $scope.user.zipcode + '&' + 'email=' + $scope.user.email + '&' + 
				   'company_name=' + $scope.user.company_name; 
					
		console.log(postData)

		$http.put($scope.editQuery, postData)
		.success(function(response) {
			$scope.users = response;
			console.log($scope.users)

			window.location.href = "profile.html?username=" + $scope.users[0].username ;
						 	
		})
		.error(function(data, status, headers, config) {
			//alert("Bad things happening with Forbin.\n\nHTTP Status: " + status + "\n\n" + data);
			$scope.searched = false;
			$scope.searching = false;
			$scope.queryError = data;
		});
	};
	$scope.editPassword = function() {
	
		console.log($scope.user.username)
		if (!$scope.user.username) {
   			$scope.queryError = 'Username Required';
			return $scope.queryError;
  		}
  		if (!$scope.user.newpassword) {
   			$scope.queryError = 'Password Required';
			return $scope.queryError;
  		}
  		if (!$scope.user.confirmpassword) {
   			$scope.queryError = 'Confirm Password Required';
			return $scope.queryError;
  		}

  		if  ($scope.user.confirmpassword != $scope.user.newpassword) {
   			$scope.queryError = 'Passwords Do Not Match'
			return $scope.queryError;
		}

		$scope.queryError = null;
		$scope.statusmsg = null;

		//Define REST Endpoint
		$scope.editQuery = restURLEndpoint + '/api/users/password/' + $scope.user.username;
		console.log('URL:' + $scope.editQuery)		

		//Assign all the incoming scope parameters to the post data variable
		postData =  'password=' + $scope.user.newpassword;
					
		console.log(postData)

		$http.put($scope.editQuery, postData)
		.success(function(response) {
			$scope.users = response;
			console.log($scope.users)

			window.location.href = "profile.html?username=" + $scope.users[0].username ;
						 	
		})
		.error(function(data, status, headers, config) {
			//alert("Bad things happening with Forbin.\n\nHTTP Status: " + status + "\n\n" + data);
			$scope.searched = false;
			$scope.searching = false;
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
		
			console.log(response)

			//For Angular
			for (var i = 0; i < response.users.length; i++) {
				response.users[i].id = response.users[i]._id;
			}

			$scope.user = response.users[0];
				 	
		})
		.error(function(data, status, headers, config) {
			console.log(data);
		});	
	};

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

			if (response.token === "Expired") {
				sessionStorage.removeItem('brimstone_token');
			}
			else {
				$scope.authuser.username = response.token.username;
				$scope.loggedin.username = response.token.username;
				glb_username = response.token.username;
				$scope.authuser.authenticated = true;
				console.log($scope.authuser.username + ":" + $scope.loggedin.username + ":" + $scope.authuser.authenticated);
			}
						 	
		})
		.error(function(data, status, headers, config) {
			console.log("Error Verifying Token")
		});
	}


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

  		//Lower Case Username for consistency in profiles
  		$scope.user.username = $scope.user.username.toLowerCase();

		$scope.queryError = null;
		$scope.statusmsg = null;
	
		$scope.authQuery = restURLEndpoint + '/api/users/authenticate';
		console.log($scope.authQuery)

		postData = 'username=' + $scope.user.username + '&' + 'password=' + $scope.user.password; 		
		console.log(postData)

		$http.post($scope.authQuery, postData)
		.success(function(response) {
			$scope.users = response;
			console.log(response)

			//Create a Local Sessage Object to store token"
			$scope.user.token = response.token;
			sessionStorage.brimstone_token = response.token;
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
			$scope.queryError = "Username or Password was incorrect";
			console.log("Invalid Credentials")
		});
	};

});

	

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