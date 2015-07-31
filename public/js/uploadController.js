
var BrimstoneApp = angular.module('brimstone', ['app.config', 'ngFileUpload'], function( appConfig, Upload) {
	
	//Print Out Environment Information When module is instantiated
	var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
	console.log("Environment Configuration: " + restURLEndpoint)
});



BrimstoneApp.controller('MyCtrl', ['$scope', 'Upload', 'appConfig', function ($scope, Upload, appConfig) {
//BrimstoneApp.controller('MyCtrl', function( $scope, $http, $filter, $location, $window, $document, appConfig, Upload) {

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    var restURLEndpoint = appConfig.protocol + appConfig.servername + ':' + appConfig.port;
    console.log("Passed in appconfig: " + restURLEndpoint)
    $scope.uploadQuery = "http://localhost:80" + '/api/uploader';
    // set default directive values
    // Upload.setDefaults( {ngf-keep:false ngf-accept:'image/*', ...} );
    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: $scope.uploadQuery,
                    fields: {'username': $scope.username},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    location = "viewlisting.html?id=" + glb_listing_id;
                }).error(function (data, status, headers, config) {
                    console.log('error status: ' + status);
                })
            }
        }
    };
//});
}]);

