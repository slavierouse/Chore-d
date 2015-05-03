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
  userName = window.localStorage.name,
  apt = window.localStorage.apt;
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
    },
    apartment:{
      get: function(){
        return apt;
      },
      set: function(apt){
        apt = apt;
        window.localStorage.apt = apt;
      }
    }
  })

  return user;
})
.service("Chores",function($http, envPrefix){
  this.chores = [];
  var that = this;
  this.get = function(){
    $http.get(envPrefix.prefixUrl("chores")).success(function(chores){
      that.chores.length = 0;
      $.merge(that.chores,chores);
    });
  }
  this.get();
  this.refresh = function(){
    this.get();
  }

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
return this;
})
.controller('ChoreSelectionCtrl', function($scope, Chores) {
  $scope.chores = Chores.chores;

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
  Chores.refresh();
  $scope.chores = Chores.chores;
  $ionicHistory.clearHistory();
  $scope.$watch("chores.length",function(c){
    angular.forEach(Chores.chores,function(chore){
      $scope.slideNum = 0;
      if(chore.assignee == User.email){
        $timeout(function(){
          $scope.slideNum = 1;
          $scope.selectedChore = chore;
          var myDate = new Date();
          myDate.setDate(myDate.getDate()+7);
          $scope.selectedChore.dueDate = formatDate(myDate);
        },0)

      }
    });
  });
  $scope.colors = ["#E6E73B", "#39B54A", "#D09D00", "#00C9FF", "#178DFF", "#FF3800"]
  $scope.completeChore = function(){
    socket.emit('submitChoreComplete',{
      chore: {id: $scope.selectedChore.id},
      picture: 'abc'
    });
    $ionicPopup.alert({
      title: 'Excellent!',
      template: "One of your roomies must confirm you've completed your chore. As soon as you do that, you can spin the wheel for next week's chore.",
      okText: 'Okay',
      okType: 'button-royal'
    }).then(function(){
      $state.go("home.livingRoom")

    });
  }
  $scope.spin = function(){
    var availableLocations = [];
    angular.forEach(Chores.chores,function(chore,index){
      if(chore.status=="unassigned"){
        availableLocations.push(index);
      }
    });
    var randPos = Math.floor(Math.random()*availableLocations.length);
    $scope.selectedChore = Chores.chores[availableLocations[randPos]];
    var myDate = new Date();
    myDate.setDate(myDate.getDate()+7);
    $scope.selectedChore.dueDate = formatDate(myDate);
    var sectionPercentage = 360/Chores.chores.length;
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
        },100);

      });
    },5250);

  }
})

.controller('signInCtrl', function($scope, $state, User, $http) {
  $scope.login = {};
  $scope.login.address ='';
  //var $scope.login.address = '';

navigator.geolocation.getCurrentPosition(function(position){
      $http.get('http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=' + Math.round(position.coords.longitude*1000000)/1000000 + ',' +Math.round(position.coords.latitude*1000000)/1000000 +'&f=json&distance=500').success(function(reply){
        $scope.login.address = reply.address.Address;
      });
    });

  $scope.signIn = function(){

    var valid = true;
    for(var i in $scope.login){
      if(!$scope.login[i]){
        valid = false;
      }
    }
    if(valid){
      User.email = $scope.login.email;
      User.phoneNumber = $scope.login.number;
      socket.emit("signin",{email:$scope.login.email,name:$scope.login.name,phone:$scope.login.number});
      $state.go("selectChores");
    }
    else{
      $scope.err = "You forgot a field";
    }
  }
})
.controller("LivingRoomCtrl",function($scope, Chores, User, formatDate, $ionicPopup,$timeout){
  Chores.refresh();
  $scope.chores = Chores.chores;
  $scope.user = {
    email:User.email,
    apartment: User.apartment,
    name: User.name
  }
  $scope.today = formatDate(new Date());
  var myDate = new Date();
  myDate.setDate(myDate.getDate()+7);
  $scope.oneWeekLater = formatDate(myDate);
  $scope.goToChat = function(){
    $scope.room = 1;
  }
  $scope.goToChoreAssignments = function(){
    $scope.room = 0;
  }
  $scope.verifyPopup = function(chore){
    $ionicPopup.confirm({
      title: chore.name,
      template: 'Was the chore, "'+chore.name+'" completed by '+chore.assignee+'?',
      cancelText: 'S/he lied!',
      cancelType: 'button button-dark',
      okText: 'Completed',
      okType: 'button button-dark-grn'
    }).then(function(res) {
      if(res){
        verifyCompletion(chore);
      }
      else{
        didntComplete(chore);
      }
      $timeout(function(){
        Chores.refresh();
      },250)
    });
  }

  function verifyCompletion(chore){

    socket.emit('confirmChoreComplete',{
      chore: {id: chore.id},
      done: true
    });
  }
  function didntComplete(chore){
    socket.emit('confirmChoreComplete',{
      chore: {id: chore.id},
      done: true
    });
  }
  socket.on('notifyChoreComplete', function(completeSendData){
   var id = completeSendData.choreID;
   angular.forEach($scope.chores, function(chore){
    if(chore.id == id){
      chore.assignee = completeSendData.senderId;
    }
  });
   $scope.$digest();
 });
})
.controller('MessagesCtrl',function($scope, $http, envPrefix, User, formatDate){
  $scope.messages = [];
  $http.get(envPrefix.prefixUrl("messages")).success(function(messages){
    $.merge($scope.messages,messages);
    angular.forEach($scope.messages,function(message){
      message.timeSent = formatDate(new Date(message.timeSent))
    });
  });
  $scope.sendMessage = function(){
    socket.emit('message',{content: $scope.message});
    $scope.message = '';

  }

  socket.on('newMessage',function(data){
    data.timeSent = formatDate(new Date(data.timeSent));
    $scope.messages.push(data);
    $scope.$digest();
  });
})
.controller('leaderboardCtrl', function($scope) {
  $scope.leaders=[
  { title: 'Will', id: 1, points: 50 },
  { title: 'Oscar', id: 2, points: 17 },
  { title: 'Shaheen', id: 3, points: 75 },
  { title: 'Katie', id: 4, points: 43 },
  { title: 'Haytham', id: 5, points: 89 },
  { title: 'MacKenzie', id: 6, points: 0 }];
});
