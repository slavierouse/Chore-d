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
.factory("User",function(){
  var userEmail = window.localStorage.email,
      userName = window.localStorage.name;
  var user = Object.create(Object.prototype,{
    email:{
      get: function(){
        return userEmail;
      },
      set: function(email){
        userEmail = email;
        window.localStorage.email = email;
      }
    },
    name:{
      get: function(){
        return userName;
      },
      set: function(name){
        userName = name;
        window.localStorage.name = name;
      }
    }
  })
  
  return user;
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
    if(chore.selected){
      socket.emit("choreUnselect",{id: chore.id});
      console.log('un')
    }
    else{
      socket.emit("choreSelect",{id: chore.id})
    }
    
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
.controller('ChoreWheelCtrl', function($scope, $ionicPopup, $timeout, Chores, $state, $ionicHistory, $ionicNavBarDelegate, User, formatDate){
  $scope.Math = Math;
  $scope.chores = Chores;
  $ionicHistory.clearHistory();
  $scope.$watch("chores.length",function(c){
    angular.forEach(Chores,function(chore){
      $scope.slideNum = 0;
      if(chore.assignee == User.email){
        $timeout(function(){
          $scope.slideNum = 1;
          $scope.selectedChore = chore;
          $scope.selectedChore.dueDate = formatDate(new Date());
        },0)
        
      }
    });
  });
  
  $scope.completeChore = function(){
    socket.emit('submitChoreComplete',{
      chore: {id: $scope.selectedChore.id},
      picture: 'abc'
    });
  }
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
              socket.emit("signin",{name:User.name,email:User.email});
              $timeout(function(){
                socket.emit("choreAssign",{id:$scope.selectedChore.id});
              },100)
              
            });
    },5250);
    
  }
})

.controller('signInCtrl', function($scope, $state, User) {
  $scope.signIn = function(){
    var valid = true;
    for(var i in $scope.login){
      if(!$scope.login[i]){
        valid = false;
      }
    }
    if(valid){
      User.email = $scope.login.email;
      socket.emit("signin",{email:$scope.login.email,name:$scope.login.name});
      $state.go("selectChores");
    }
    else{
      $scope.err = "You forgot a field";
    }
  }
})

.controller('leaderboardCtrl', function($scope) {
  $scope.leaders=[
    { title: 'Shaheen', id: 1, points: 50 },
    { title: 'Will', id: 2, points: 17 },
    { title: 'MacKenzie', id: 3, points: 75 },
    { title: 'Oscar', id: 4, points: 43 },
    { title: 'Torey', id: 5, points: 89 },
    { title: 'Cowbell', id: 6, points: 0 }];
});