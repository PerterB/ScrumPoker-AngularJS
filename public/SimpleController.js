var demoApp = angular.module('demoApp', []);

var controllers = {};
controllers.SimpleController = function ($scope) {
	
	$scope.customers = [
	  {name: 'Peter', city: 'Cork'},
	  {name: 'John', city: 'New York'},
	  {name: 'Paul', city: 'Los Angeles'}
	];

}

demoApp.controller(controllers);

demoApp.config(function($routeProvider) {
	
	
	
});