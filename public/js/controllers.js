var glb_username = '';
var glb_listing_id = '';
var glb_title = "";
var glb_personalization = {email:"glb_email", zipcode:"glb_zipcode"};

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
BrimstoneApp.controller('MyCtrl', function( $scope, $http, $filter, $location, $window, $document, $timeout, appConfig, Upload) {

	$scope.listing = {};
	$scope.progress = {};
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
    //console.log(glb_username)
    //console.log(glb_title)
    $("#image_progress_bar").hide();

    $scope.uploadQuery = restURLEndpoint + '/api/uploader';
    // set default directive values
    // Upload.setDefaults( {ngf-keep:false ngf-accept:'image/*', ...} );


    $scope.upload = function (files) {
    	//console.log("!!!Called File Upload")
    	$scope.listing.image_process = 0;
        if (files && files.length) {
        	$("#image_progress_bar").show();
        	console.log(initialized)
            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                Upload.upload({
                    url: $scope.uploadQuery,
                    fields: {'username': $scope.username, 'id': $scope.listing.id},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.progress = progressPercentage;
                    console.log($scope.progress)
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
        	if (initialized > 1) {
        		//console.log("!!!Showing error message" + initialized)
	        	$scope.fileError = "Error Uploading File"
	        	$scope.fileErrorDetail = "This means your image was larger than 6MB or your file type was not supported. Only PNG, GIF, JPG and JPEG  are supported"
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
    	location = "viewlisting.html?id=" + $scope.listing.id; 
    }

    $scope.uploadFiles = function(file) {
        $scope.f = file;
        if (file && !file.$error) {
        	$("#image_progress_bar").show();
            file.upload = Upload.upload({
               
                url: $scope.uploadQuery,
                fields: {'username': $scope.username, 'id': $scope.listing.id},
                file: file
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    console.log("Upload.then")
                    location = "viewlisting.html?id=" + $scope.listing.id;
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            });

            file.upload.progress(function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * 
                                                       evt.loaded / evt.total));
            });
        }   
    }

});



		

BrimstoneApp.controller('listingManager', function( $scope, $http, $filter, $location, $window, $document, appConfig) {
	
	$scope.listing = {};

	//Defaults
	$scope.listing.delivery = "no";
	$scope.listing.cash = true;

	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	
	//This is required or it will send as JSON by default and fail
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";

		//Add Authorization to calls
	$http.defaults.headers.post["Authorization"] = localStorage.brimstone_token
	$http.defaults.headers.put["Authorization"] = localStorage.brimstone_token

	//console.log(localStorage.personalization)
	
	if (localStorage.personalization) {
		var personalization = JSON.parse(localStorage.personalization)

		//Populate Personalizations
		$scope.listing.zipcode = personalization.zipcode;
		$scope.listing.contact_email = personalization.email;
		$scope.listing.contact_phone = personalization.contact_phone;
		$scope.listing.location = personalization.city;
	}



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
  		if (!$scope.listing.unit) {
  			$scope.listing.unit = "";
  		}
  		if (!$scope.listing.category) {
  			$scope.listing.category = "other";
  		}
  		console.log($scope.listing.category)


		console.log("Delivery:" + $scope.listing.delivery)
  		
  		var payment = [];
  		if ($scope.listing.cash)
  		{
  			payment.push("cash");
  		}
  		if ($scope.listing.credit)
  		{
  			payment.push("credit");
  		}
  		if ($scope.listing.paypal)
  		{
  			payment.push("paypal");
  		}
  		console.log("Payment:" + payment)

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
				   'contact_email=' + $scope.listing.contact_email + '&' + 'payment=' + payment + '&' + 
				   'delivery=' + $scope.listing.delivery + '&' +  'unit=' + $scope.listing.unit + '&' +  'category=' + $scope.listing.category ;
					
		console.log(postData)

		$http.post($scope.registerQuery, postData)
		.success(function(response) {
			
			//Convert to .id for angular
			response.listing.id = response.listing._id;
			$scope.listing = response.listing;
			glb_title = $scope.listing.title;
			location = "addimage.html?id=" + $scope.listing.id;
						 	
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

		var payment = [];
  		if ($scope.listing.cash)
  		{
  			payment.push("cash");
  		}
  		if ($scope.listing.credit)
  		{
  			payment.push("credit");
  		}
  		if ($scope.listing.paypal)
  		{
  			payment.push("paypal");
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
				   'contact_email=' + $scope.listing.contact_email + '&' + 'payment=' + payment + '&' + 
				   'delivery=' + $scope.listing.delivery + '&' +  'unit=' + $scope.listing.unit + '&' +  'category=' + $scope.listing.category; 
					
		console.log(postData)

		$http.put($scope.editQuery, postData)
		.success(function(response) {
			
			//Convert to .id for angular
			response.listing.id = response.listing._id;
			$scope.listing = response.listing;
			glb_title = $scope.listing.title;
			location = "viewlisting.html?id=" + listingid;	 	
		})
		.error(function(data, status, headers, config) {
			if (status === 403) {
				message = "You do not have access to update this listing";
				sweetAlert("Unauthorized", message, "error");
				$scope.queryError = message;
			}
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

		swal({   title: "Are you sure?",   
			text: "You will not have an image on your listing!",   
			type: "warning",   
			showCancelButton: true,   
			confirmButtonColor: "#DD6B55",   
			confirmButtonText: "Yes, delete it!",   
			closeOnConfirm: false }, 

			function(){   

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
					
					location = "viewlisting.html?id=" + listingid;
					swal("Deleted!", "Your Image has been deleted.", "success"); 
					
								 	
				})
				.error(function(data, status, headers, config) {
					if (status === 403) {
						message = "You do not have access to remove this image";
						sweetAlert("Unauthorized", message, "error");
						$scope.queryError = message;
					}
				});
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
			if (response.listing[0].thumbnail == null) {
				response.listing[0].thumbnail = "/assets/img/placeholder1.png"
			}
			
			if (response.listing[0].unit == "") {
				response.listing[0].unit = "N/A";
			} 

			if (response.listing[0].payment) {
				console.log(response.listing[0].payment)
				payments = response.listing[0].payment.split(",")

				for (var i = 0; i < payments.length; i++) {
					if (payments[i] == "cash" ) {
						$scope.listing.cash = true;
					}
					else if (payments[i] == "credit" ) {
						$scope.listing.credit = true;
					}
					else if (payments[i] == "paypal" ) {
						$scope.listing.paypal = true;
					}
				};
				
				//Reformat for viewlisting display - Add space between Commas
				response.listing[0].payment = response.listing[0].payment.replace(/,/g, ", " )
			}

			//To DO, check how handled if its empty
			$scope.listing.category = response.listing[0].category;
			if (!$scope.listing.category) {
				$scope.listing.category = "Unspecified"
			}

			console.log($scope.listing)

		})

		.error(function(data, status, headers, config) {
			$scope.queryError = data;
		});	

	};

	/// This function will fire every time the phone input box is changed
	// We want to add formatting spaces for the dashes
	$scope.checkPhoneFormatting = function(event) { 

		//Only true for certain positions and if the key is not backspace
		if ($scope.listing.contact_phone.length === 3 && event.keyCode != 8) {
			$scope.listing.contact_phone += "-"
		} 
		else if ($scope.listing.contact_phone.length === 7 && event.keyCode != 8) {
			$scope.listing.contact_phone += "-"
		} 
	}

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
				//Convert Strings to Date for Sorting later
				response.listing[i].updated_at = new Date(response.listing[i].updated_at) 
			}

			//Reverse order so most recent shows up on top
			//$scope.listings = sortByKey(response.listing, 'created_at').reverse()	
			$scope.listings = sortByKeyDates(response.listing, 'updated_at').reverse();	
			console.log	($scope.listings)	 	
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
				if (response.listing[i].thumbnail == null) {
				response.listing[i].thumbnail = "/assets/img/placeholder1.png"
			}

				//Convert Strings to Date for Sorting later
				response.listing[i].updated_at = new Date(response.listing[i].updated_at) 
			}

			//Reverse order so most recent shows up on top
			//console.log(response.listing)
			//$scope.listings = sortByKey(response.listing, 'created_at').reverse();

			$scope.listings = sortByKeyDates(response.listing, 'updated_at').reverse();
			

			console.log($scope.listings)
					 	
		})
		.error(function(data, status, headers, config) {
			console.log(data);
		});	
	};

	
	$scope.renewListing = function(id) {

		console.log("delete " + id )
		//Define REST Endpoint
		$scope.renewQuery = restURLEndpoint + '/api/listings/renew/' + id;
		console.log('URL:' + $scope.renewQuery)
		
		//Assign all the incoming scope parameters to the post data variable
		postData = 'username=' + glb_username; 		
		console.log(postData)

		$http.put($scope.renewQuery, postData)
		.success(function(response) {
			swal({   title: "Renewed!",   
			text: "Your List has been successfully renewed for 30 days'",   
			type: "success",   
			showCancelButton: false,   
			confirmButtonText: "Ok",   
			closeOnConfirm: true }, 

			function(){   
				location.reload()
			});			 	
		})
		.error(function(data, status, headers, config) {
			if (status === 403) {
				message = "You do not have access to renew this listing";
				sweetAlert("Unauthorized", message, "error");
				$scope.queryError = message;
			}
		});
	}
	
	$scope.deleteListing = function(id) {
		console.log("delete " + id )

		swal({   title: "Are you sure?",   
			text: "You will not be able to recover this listing!",   
			type: "warning",   
			showCancelButton: true,   
			confirmButtonColor: "#DD6B55",   
			confirmButtonText: "Yes, delete it!",   
			closeOnConfirm: false }, 

			function(){   
				//Define Rest Endpoint
				$scope.deleteQuery = restURLEndpoint + '/api/listings/' + id ;
				token = localStorage.brimstone_token
				
				//Special Case for Delete...must use params key to send post data
				$http.delete($scope.deleteQuery, {params: {'authorization': token}})
				.success(function(response) {
					
					console.log("Deleted")
					location = "mylistings.html?username=" + $scope.listing.username;
					swal("Deleted!", "Your listing has been deleted.", "success"); 
								 	
				})
				.error(function(data, status, headers, config) {
					if (status === 403) {
						message = "You do not have access to delete this listing";
						sweetAlert("Unauthorized", message, "error");
						$scope.queryError = message;
					}
				});
				
			
		});

		
	}

	$scope.updateImage = function () {

		if (QueryString.id) {
			$scope.listing.id = QueryString.id;
		}
    	console.log("Changing Image")
    	console.log("scope Listing ID " + $scope.listing.id)
    	location = "addimage.html?id=" + $scope.listing.id; 
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
		$scope.listing.zip = null;
	}

	//console.log('scope.listing.query:' + $scope.listing.query )
	//console.log('scope.listing.zip:' + $scope.listing.zip )

	//This is required or it will send as JSON by default and fail
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";

	
	$scope.searchListingsFromIndexSearch = function() {

		console.log("--> Running Search From Index")

		// Do not run query if user did not come to search page from Index Search
		// query parameter will not be present in URL
		if (window.document.location.search.indexOf("query") == -1) {
			return;
		}

		query = $scope.listing.query;
		if (!$scope.listing.query) {
   			query = "*"		
		}

		if (QueryString.category) {
			$scope.listing.category = QueryString.category;
			console.log($scope.listing.category)
		}
		else {
			$scope.listing.category = null;
		}
      		
		$scope.queryError = null;
		$scope.statusmsg = null;
		$scope.searched = true;
		$scope.searching = true;
		
		$scope.searchQuery = restURLEndpoint + '/api/listings/' + query + '/' + $scope.listing.zip + '/' + $scope.listing.category ;

		console.log('URL:' + $scope.searchQuery)
		
		$http.get($scope.searchQuery)
		
		.success(function(response) {

			listing_count = 0;
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
				if (response.listing[i].thumbnail == null) {
				response.listing[i].thumbnail = "/assets/img/placeholder1.png"
				}
				if (response.listing[i].status === "active") {
					listing_count++;
				}
			}


			$scope.listings = response.listing;
			$scope.num_of_results = listing_count++;

			if ($scope.listing.category && $scope.listing.category != "null") {
				$scope.original_query = $scope.listing.category;
			}	
			else {
				$scope.original_query = $scope.listing.query;
			}
			
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
	$scope.searchListings = function() {

		console.log("--> Running Search")
		query = $scope.listing.query;

		if (!$scope.listing.query) {
   			query = "*"		
		}

		if (!$scope.listing.zip) {
   			$scope.listing.zip = null;		
		}

		if (!$scope.listing.category) {
   			$scope.listing.category = null;		
		}
      		
		$scope.queryError = null;
		$scope.statusmsg = null;
		$scope.searched = true;
		$scope.searching = true;
		
		$scope.searchQuery = restURLEndpoint + '/api/listings/' + query + '/' + $scope.listing.zip + '/' + $scope.listing.category;

		console.log('URL:' + $scope.searchQuery)
		
		$http.get($scope.searchQuery)
		
		.success(function(response) {

			listing_count = 0;
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
				if (response.listing[i].thumbnail == null) {
				response.listing[i].thumbnail = "/assets/img/placeholder1.png"
				}
				if (response.listing[i].status === "active") {
					listing_count++;
				}
			}


			$scope.listings = response.listing;
			$scope.num_of_results = listing_count++;
			

			if ($scope.listing.category && $scope.listing.category != "null") {
				$scope.original_query = $scope.listing.category;
			}	
			else {
				$scope.original_query = $scope.listing.query;
			}

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
	$scope.user.terms = true;
	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	//console.log("Configuration: " + restURLEndpoint)	

	if ($window.localStorage.brimstone_token) {
		$scope.user.token = $window.localStorage.brimstone_token;
	}

	//This is required or it will send as JSON by default and fail
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$http.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";

	//Add Authorization to calls
	$http.defaults.headers.post["Authorization"] = localStorage.brimstone_token;
	$http.defaults.headers.put["Authorization"] = localStorage.brimstone_token;

	//array of all usernames - Will be populated by buildUserNameList()
	usernames = [];
	$scope.started = false;

	//call get all users, to populate array
	$scope.buildUsernameList = function() { 
		
		//Define REST Endpoint
		$scope.searchQuery = restURLEndpoint + '/api/users/lite/list';

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

	$scope.checkPhoneFormatting = function(event) { 

		//Only true for certain positions and if the key is not backspace
		if ($scope.user.contact_phone.length === 3 && event.keyCode != 8) {
			$scope.user.contact_phone += "-"
		} 
		else if ($scope.user.contact_phone.length === 7 && event.keyCode != 8) {
			$scope.user.contact_phone += "-"
		} 
	}

	
	$scope.clearUserScope = function() {
	console.log("Clearing User Scope")
	}

	$scope.show_terms = function() {
			 	
	}

	$scope.accept_terms = function() {
		if ($scope.user.terms) {
			$('#terms_button').prop('disabled', false);
		}
		else {
			$('#terms_button').prop('disabled', true);
		}
	}

	$scope.addUser = function() {
	
		console.log($scope.user.username)

		if (!$scope.user.contact_phone) {
  			$scope.user.contact_phone = "";
  		}

		if (!$scope.user.company_name) {
  			$scope.user.company_name = "";
  		}

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
  			return;
  		}

		$scope.queryError = null;
		$scope.statusmsg = null;

		//Define REST Endpoint
		$scope.registerQuery = restURLEndpoint + '/api/users';
		console.log('URL:' + $scope.registerQuery)
		
		//Assign all the incoming scope parameters to the post data variable
		postData = 'username=' + $scope.user.username + '&' + 'firstname=' + $scope.user.firstname + '&' + 'lastname=' + $scope.user.lastname + '&' + 
				   'password=' + $scope.user.password + '&' + 'zipcode=' + $scope.user.zipcode + '&' + 'email=' + $scope.user.email + '&' + 
				   'city=' + $scope.user.city + '&' + 'contact_phone=' + $scope.user.contact_phone + '&' + 
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

		$scope.queryError = null;
		$scope.statusmsg = null;

		//Define REST Endpoint
		$scope.editQuery = restURLEndpoint + '/api/users/' + $scope.user.username;
		console.log('URL:' + $scope.editQuery)		

		//Assign all the incoming scope parameters to the post data variable
		postData = 'firstname=' + $scope.user.firstname + '&' + 'lastname=' + $scope.user.lastname + '&' + 
				   'zipcode=' + $scope.user.zipcode + '&' + 'email=' + $scope.user.email + '&' + 
				   'city=' + $scope.user.city + '&' + 'contact_phone=' + $scope.user.contact_phone + '&' + 
				   'company_name=' + $scope.user.company_name; 
					
		console.log(postData)

		$http.put($scope.editQuery, postData)
		.success(function(response) {
			$scope.users = response;
			console.log($scope.users)
			window.location.href = "profile.html?username=" + $scope.users[0].username ;			 	
		})
		.error(function(data, status, headers, config) {
			$scope.searched = false;
			$scope.searching = false;
			if (status === 403) {
				message = "You do not have access to update this profile";
				sweetAlert("Unauthorized", message, "error");
				$scope.queryError = message;
			}
			//$scope.queryError = data;
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
			
			$scope.searched = false;
			$scope.searching = false;
			if (status === 403) {
				message = "You do not have access to update this password";
				sweetAlert("Unauthorized", message, "error");
				$scope.queryError = message;
			}
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

		//Execute GET Request - Special case to include header for authorization
		$http.get($scope.searchQuery, { headers: {'Authorization': localStorage.brimstone_token}})
		.success(function(response) {
		
			console.log(response)

			//For Angular
			for (var i = 0; i < response.users.length; i++) {
				response.users[i].id = response.users[i]._id;
			}

			$scope.user = response.users[0];
				 	
		})
		.error(function(data, status, headers, config) {
			if (status === 403) {
				message = "You do not have access to view this profile";
				sweetAlert("Unauthorized", message, "error");
				//$scope.queryError = message;
			}
		});	
	};


	$scope.getUserProfileLite = function() {

			
		console.log("--> Fetching User ProfileLite")
		console.log($scope.loggedin.username)

		//Define REST Endpoint
		$scope.searchQuery = restURLEndpoint + '/api/users/lite/' + $scope.loggedin.username;

		//Execute GET Request
		$http.get($scope.searchQuery)
		.success(function(response) {
		
			//console.log(response)

			//For Angular
			for (var i = 0; i < response.users.length; i++) {
				response.users[i].id = response.users[i]._id;
			}

			$scope.user = response.users[0];
			console.log($scope.user)
				 	
		})
		.error(function(data, status, headers, config) {
			console.log(data);
		});	
	};

	$scope.forgotPassword = function(){
		console.log("--> Starting Forgot Password");

		//Define Rest Endpoint for Token Verification
		$scope.FPQuery = restURLEndpoint + '/api/users/forgotPassword';
		
		//Define token variable for verification
		postData = 'email=' + $scope.user.email; 			

		console.log(postData)
		//Execute Post request
		$http.post($scope.FPQuery, postData)
		.success(function(response) {
			console.log(response)
			swal({   title: "Successful!",   
				text: "Please visit your email and click the link to change your password'",   
				type: "success",   
				showCancelButton: false,   
				confirmButtonText: "Ok",   
				closeOnConfirm: true })		 	
		})
		.error(function(data, status, headers, config) {
			$scope.queryError = data.error
		});
	}

	$scope.resetPassword = function(){
		console.log("--> Starting Reset Password");

		if (QueryString.sessionid) {
			var sessionid = QueryString.sessionid;
		}
		else {
			console.log("Session not found")
			$scope.queryError = "no session id was provided"
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

		//Define Rest Endpoint for Token Verification
		$scope.RPQuery = restURLEndpoint + '/api/users/resetPassword';
		
		//Define token variable for verification
		postData = 'token=' + sessionid + '&password=' + $scope.user.newpassword;			

		console.log(postData)
		//Execute Post request
		$http.post($scope.RPQuery, postData)
		.success(function(response) {
			console.log(response)
			swal({   title: "Successful!",   
				text: "Your Password Has been Updated'",   
				type: "success",   
				showCancelButton: false,   
				confirmButtonText: "Ok",   
				closeOnConfirm: true },

				function(){   
					location = "login.html";
				});	

		})
		.error(function(data, status, headers, config) {
			$scope.queryError = data.error
		});
	}

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
			$scope.user.personalization = response.personalization;

			localStorage.brimstone_token = response.token;

			//Requires stringifying JSObject in order to store it in localstorage
			localStorage.setItem('personalization', JSON.stringify(response.personalization));

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