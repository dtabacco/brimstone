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
	$scope.fileError = "";
	$scope.fileErrorDetail = "";
	var initialized = 0;

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

    $scope.uploadQuery = restURLEndpoint + '/api/uploader';
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
        else {
        	//Workaround because it always hits this when the page loads...so may it only happen for real attempts
        	if (initialized > 0) {
	        	$scope.fileError = "Error Uploading File"
	        	$scope.fileErrorDetail = "This means your image was larger than 6MB or your file type was not supported. Only PNG, GIF, JPG, JPEG and BMP are supported"
        	}
        	else {
        		initialized = initialized + 1;  
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
			
			//Added Toaster Button
			toastr.options.closeButton = true;
			toastr.error('You Failed the Human Test')
			return;
  		}
  		
  		if (!$scope.listing.make) {
  			$scope.listing.make = "";
  		}
  		if (!$scope.listing.model) {
  			$scope.listing.model = "";
  		}
  		if (!$scope.listing.condition) {
  			$scope.listing.condition = "";
  		}
  		if (!$scope.listing.dimensions) {
  			$scope.listing.dimensions = "";
  		}
  		if (!$scope.listing.contact_phone) {
  			$scope.listing.contact_phone = "";
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

	$scope.editListing = function() {

		username = glb_username;
	
		console.log(username)
		console.log($scope.listing.title)

		if (QueryString.id) {
			$scope.listing.id = QueryString.id;
			var listingid = $scope.listing.id
		}

		$scope.queryError = null;
		$scope.statusmsg = null;

		//Define REST Endpoint
		$scope.editQuery = restURLEndpoint + '/api/listings/' + $scope.listing.id;
		console.log('URL:' + $scope.editQuery)
		
		//Assign all the incoming scope parameters to the post data variable
		postData = 'username=' + glb_username + '&' + 'title=' + $scope.listing.title + '&' + 'description=' + $scope.listing.description + '&' + 
				   'price=' + $scope.listing.price + '&' + 'zipcode=' + $scope.listing.zipcode + '&' + 'location=' + $scope.listing.location + '&' + 
				   'make=' + $scope.listing.make + '&' + 'model=' + $scope.listing.model + '&' + 'dimensions=' + $scope.listing.dimensions  + '&' + 
				   'condition=' + $scope.listing.condition + '&' + 'contact_phone=' + $scope.listing.contact_phone  + '&' + 
				   'contact_email=' + $scope.listing.contact_email ; 
					
		console.log(postData)

		$http.put($scope.editQuery, postData)
		.success(function(response) {
			
			//Convert to .id for angular
			response.listing.id = response.listing._id;
			$scope.listing = response.listing;
			glb_title = $scope.listing.title;
			//toastr.options.closeButton = true;
			//toastr.success('Your Post has been successfully Updated')
			
			location = "viewListing.html?id=" + listingid;
			
						 	
		})
		.error(function(data, status, headers, config) {
			$scope.queryError = data;
		});
	};

	$scope.removeImage = function() {

		username = glb_username;
	
		console.log(username)

		if (QueryString.id) {
			$scope.listing.id = QueryString.id;
			var listingid = $scope.listing.id
		}

		$scope.queryError = null;
		$scope.statusmsg = null;

		//Define REST Endpoint
		$scope.editQuery = restURLEndpoint + '/api/listings/' + $scope.listing.id + "/imageRemove";
		console.log('URL:' + $scope.editQuery)
		
		//Assign all the incoming scope parameters to the post data variable
		postData = 'username=' + glb_username; 
					
		console.log(postData)

		$http.put($scope.editQuery, postData)
		.success(function(response) {
			
			//Convert to .id for angular
			response.listing.id = response.listing._id;
			$scope.listing = response.listing;
			glb_title = $scope.listing.title;
			//toastr.options.closeButton = true;
			//toastr.success('Your Post has been successfully Updated')
			
			location = "viewListing.html?id=" + listingid;
			
						 	
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

			//Convert to .id for angular
			$scope.listing.id = response.listing[0]._id;

			if (response.listing[0].image == null) {
				response.listing[0].image = "/assets/img/placeholder1.png"
			}

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

	$scope.getRecentListings = function() {

  		console.log("--> Fetching Recent Listings")
		
		//Define Rest Endpoint
		$scope.listingQuery = restURLEndpoint + '/api/listings';
		
		//Execute GET Request
		$http.get($scope.listingQuery)
		.success(function(response) {

			for (var i = 0; i < response.listing.length; i++) {
				response.listing[i].id = response.listing[i]._id;

				if (response.listing[i].image == null) {
				response.listing[i].image = "/assets/img/placeholder1.png"
				}

				//Convert Strings to Date for Sorting later
				response.listing[i].updated_at = new Date(response.listing[i].updated_at) 
			}

			//Reverse order so most recent shows up on top
			//console.log(response.listing)
			//$scope.listings = sortByKey(response.listing, 'created_at').reverse();

			$scope.listings = sortByKeyDates(response.listing, 'updated_at').reverse();
			

			//console.log($scope.listings)
					 	
		})
		.error(function(data, status, headers, config) {
			console.log(data);
		});	
	};

	
	$scope.deleteListing = function(id) {
		console.log("delete " + id )

		//Define Rest Endpoint
		$scope.deleteQuery = restURLEndpoint + '/api/listings/' + id ;

		postData = "";

		$http.delete($scope.deleteQuery, postData)
		.success(function(response) {
			
			console.log("Deleted")
			location = "mylistings.html?username=" + $scope.listing.username;

						 	
		})
		.error(function(data, status, headers, config) {
			$scope.queryError = data;
		});
	}

	$scope.updateImage = function () {

		if (QueryString.id) {
			$scope.listing.id = QueryString.id;
		}
    	console.log("Changing Image")
    	console.log("scope Listing ID " + $scope.listing.id)
    	location = "addImage.html?id=" + $scope.listing.id; 
    }


});

BrimstoneApp.controller('SearchManager', function( $scope, $http, $filter, $location, $window, appConfig) {	

	$scope.listing = {};
	$scope.complete = {};
	$scope.complete.status = false;
	
	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	//console.log("Configuration: " + restURLEndpoint)	

	if ($window.localStorage.brimstone_token) {
		$scope.user.token = $window.localStorage.brimstone_token;
	}

	if (QueryString.query) {
		$scope.listing.query = QueryString.query.split('+').join(' ');


	}

	if (QueryString.zipcode) {
		$scope.listing.zip = QueryString.zipcode;
	}
	else {
		//$scope.listing.zip = "00000";
		console.log("Setting zip to null")
		$scope.listing.zip = null;
	}

	console.log('scope.listing.query:' + $scope.listing.query )
	console.log('scope.listing.zip:' + $scope.listing.zip )

	//This is required or it will send as JSON by default and fail
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";

	$scope.searchListings = function() {

		if (!$scope.listing.query) {
   			$scope.queryError = 'You Must provide a query';
			return $scope.queryError;
		
		}
      		
		$scope.queryError = null;
		$scope.statusmsg = null;
		$scope.searched = true;
		$scope.searching = true;
		
		//$scope.searchQuery = 'http://localhost:9010/api/listings/' + $scope.listing.query + '/' + $scope.listing.zip ;
		$scope.searchQuery = restURLEndpoint + '/api/listings/' + $scope.listing.query + '/' + $scope.listing.zip ;

		console.log('URL:' + $scope.searchQuery)
		
		$http.get($scope.searchQuery)
		
		.success(function(response) {

			for (var i = 0; i < response.listing.length; i++) {
				response.listing[i].id = response.listing[i]._id;

				if (response.listing[i].title.length > 100) {
					response.listing[i].title = response.listing[i].title.substring(0, 100) + "...";
				}

				if (response.listing[i].description.length > 250) {
					response.listing[i].description = response.listing[i].description.substring(0, 250) + "...";
				}

				if (response.listing[i].image == null) {
				response.listing[i].image = "/assets/img/placeholder1.png"
				}
			}

			$scope.listings = response.listing;
			$scope.num_of_results = response.listing.length;
			$scope.original_query = $scope.listing.query;
			$scope.searching = false;
			$scope.complete.status = true;
			console.log(response)
						 	
		})
		.error(function(data, status, headers, config) {
			
			$scope.searched = false;
			$scope.searching = false;
			$scope.queryError = data;
		});	
	};



});

BrimstoneApp.controller('UserManager', function( $scope, $http, $filter, $location, $window, appConfig) {	

	$scope.user = {};
	$scope.unique = {};
	$scope.started = {};
	$scope.authuser = {};
	$scope.loggedin = {};
	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	//console.log("Configuration: " + restURLEndpoint)	

	if ($window.localStorage.brimstone_token) {
		$scope.user.token = $window.localStorage.brimstone_token;
	}

	//This is required or it will send as JSON by default and fail
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";

	//array of all usernames - Will be populated by buildUserNameList()
	usernames = [];
	$scope.started = false;

	//call get all users, to populate array
	$scope.buildUsernameList = function() { 
		
		//Define REST Endpoint
		$scope.searchQuery = restURLEndpoint + '/api/users';

		//Execute GET Request
		$http.get($scope.searchQuery)
		.success(function(response) {
		
			for (var i = 0; i < response.users.length; i++) {
				usernames.push(response.users[i].username);
			}
				 	
		})
		.error(function(data, status, headers, config) {
			console.log(data);
		});	
	}

	/// This function will fire every time the username checkbox has a key press event
	$scope.checkUnique = function() { 
		$scope.started = true;
		//console.log("Checking Unique")
		if ($scope.user.username == null) {
			$scope.started = false;
			return;
		}
		if (usernames.indexOf($scope.user.username) != -1) {
			//console.log("Not Unique")
			$scope.unique = false;
		}
		else {
			//console.log("Unique")
			$scope.unique = true;
		}
	}

	
	$scope.clearUserScope = function() {
	console.log("Clearing User Scope")
	}

	$scope.addUser = function() {
	
		console.log($scope.user.username)

		if ($scope.user.humanoid != 5) {
			console.log("Failed:" + $scope.user.humanoid)
			//Added Toaster Button
			toastr.options.closeButton = true;
			toastr.error('You Failed the Human Test')
			return;
  		}

  		if (!$scope.unique) {
  			toastr.options.closeButton = true;
			toastr.error('You Must Select a Unique Username')
  			return

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
			
			//Authenticate the user with newly registered credentials
			$scope.authenticateUser();
			//location = "index.html"
						 	
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
				localStorage.removeItem('brimstone_token');
			}
			else {
				$scope.authuser.username = response.token.username;
				$scope.loggedin.username = response.token.username;
				glb_username = response.token.username;
				$scope.authuser.authenticated = true;
				$scope.user.username = response.token.username;
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
			localStorage.brimstone_token = response.token;
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


function sortByKeyDates(array, key) {
    return array.sort(function(a, b) {
        return a[key].getTime() - b[key].getTime();
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