angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})
.constant("ENV","prod")
.service("envPrefix",["ENV",function(ENV){//https://bunny.qa.mequilibrium.com/,
  var prefix;
  switch(ENV){
    case "prod":
      prefix = "http://209.208.27.193/";
      break;
    default:
      prefix = "http://209.208.27.193/";
  }
  this.prefixUrl=function(url){
    return prefix+url;
  }
}])
.service("Chores",function($http, envPrefix){
  this.chores = [];
  var that = this;
  $http.get(envPrefix.prefixUrl("chores")).success(function(chores){
    $.merge(that.chores,chores);
  });
  /*$.merge(this.chores, [
    {
      id: 1,
      name: "dust",
      assigned: false,
      added: false
    },
    {
      id: 2,
      name: "dishes",
      assigned: false,
      added: true
    },
    {
      id: 3,
      name: "read techcrunch",
      assigned: false,
      added: false
    },
    {
      id: 4,
      name: "dust",
      assigned: false,
      added: false
    },
    {
      id: 5,
      name: "dishes",
      assigned: false,
      added: true
    },
    {
      id: 6,
      name: "read techcrunch",
      assigned: false,
      added: false
    }
  ]);*/
  return this.chores;
})
.controller('ChoreSelectionCtrl', function($scope, Chores) {
  $scope.chores = Chores;

  $scope.updateAddedStatus = function($event, chore){

  }
})
.controller('ChoreWheelCtrl', function($scope, Chores){
  $scope.Math = Math;
  $scope.chores = Chores;
});
