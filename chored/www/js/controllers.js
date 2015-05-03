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
.service("User",function(){
  this.user = {
    email: "william@piecewise.com"
  }
})
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
.factory("formatDate",function(){
  return function (myDate, format){
    if(!(myDate instanceof Date)){
      myDate = this.strToDate(myDate);
    }
    myDate.setDate(myDate.getDate()+7);
    var y = myDate.getFullYear(),
        m = ('0' + (myDate.getMonth()+1)).slice(-2),
        d = ('0' + myDate.getDate()).slice(-2);
    if(format){
      return format.replace("m",m).replace("d",d).replace("y",y);
    }
    return m+"-"+ d + '-' + y;
  }
})
.controller('ChoreWheelCtrl', function($scope, $ionicPopup, $timeout, Chores, $state, User, formatDate){
  $scope.Math = Math;
  $scope.chores = Chores;
  angular.forEach(Chores,function(chore){
    $scope.slideNum = 0;
    if(chore.assignee == User.email){
      $scope.slideNum = 1;
      $scope.selectedChore = chore;
      $scope.selectedChore.dueDate = formatDate(new Date());
    }
  });
  
  $scope.spin = function(){
    var availableLocations = [];
    angular.forEach(Chores,function(chore,index){
      if(chore.status=="unassigned"){
        availableLocations.push(index);
      }
    });
    var randPos = Math.floor(Math.random()*availableLocations.length);
    $scope.selectedChore = Chores[availableLocations[randPos]];
    $scope.selectedChore.dueDate = formatDate(new Date());
    var sectionPercentage = 360/Chores.length;
    //15 for offset
    var spinEndLoc = availableLocations[randPos]*sectionPercentage+3615;
    
    $(".spin-center").css({webkitTransform: "rotateZ("+spinEndLoc+"deg)",transform:"rotateZ("+spinEndLoc+"deg)"})
    $timeout(function(){
      $ionicPopup.alert({
              title: 'Congratulations!',
              template: "You got... " + $scope.selectedChore.name+"! Yay!!!",
              okText: 'Okay',
              okType: 'button-royal'
            }).then(function(){
              $scope.slideNum = 1;
            });
    },5250);
    
  }
});
