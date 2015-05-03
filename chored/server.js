var app = require('./app');
var chores = require('./initiation/chores');
//var nexmo = require('easynexmo');
//nexmo.initialize('0fa380ab','1d06fbc9','http');
//nexmo.sendTextMessage('16178521199','16178521199','hi');

var http = require('http');

var messageLog = [];

function clone(obj) {
    if(obj === null || typeof(obj) !== 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}

app.get('/chores',function(request,response) {
  response.send(JSON.stringify(chores));
});

app.get('/messages',function(request,response) {
  response.send(JSON.stringify(messageLog));
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(3000);

console.log('server listening on port 3000');

var choreLog = [];
io.on('connection', function(socket){

  socket.on('signin',function(info){
    console.log('sign in');
    socket.email = info.email;
    socket.userName = info.name;
    socket.phoneNumber = info.phone;
    console.log(socket.email);
  })

  socket.on('choreSelect', function(chore){
    chores[chore.id].selected = true;
  });

  socket.on('choreUnselect', function(chore){
    chores[chore.id].selected = false;
  });

  socket.on('choreAssign',function(chore){
    chores[chore.id].assignee = socket.email;
    chores[chore.id].timeAssigned = new Date();
    chores[chore.id].status = 'assigned';
    io.sockets.sockets.forEach(function(allSocket){
      console.log("A: " + chores[chore.id].assignee);
      if (allSocket.email == chores[chore.id].assignee) {
        return false;
      };
      console.log('B: '+ allSocket.phoneNumber);
      var httpUri = 'http://rest.nexmo.com/sms/json?api_key=0fa380ab&api_secret=1d06fbc9&from=12532715644&to=';
      httpUri += allSocket.phoneNumber +'&text=';
      httpUri += socket.userName+" will do the " + chores[chore.id].name;
      httpUri += " this week."
      http.get(httpUri);
    })
  });

  socket.on('submitChoreComplete',function(completeReceiveData){
    chores[completeReceiveData.chore.id].status = 'completed';
    chores[completeReceiveData.chore.id].timeCompleted = new Date();
    chores[completeReceiveData.chore.id].picture = completeReceiveData.picture;
    var completeSendData = {
      choreID: {id: completeReceiveData.chore.id},
      choreName: chores[completeReceiveData.chore.id].name,
      senderId: socket.email,
      senderName: socket.userName
    }
    io.sockets.emit('notifyChoreComplete',completeSendData);
  });

  socket.on('confirmChoreComplete',function(confirmReceiveData){
    var thisChore = clone(chores[confirmReceiveData.chore.id]);
    thisChore.timeConfirmed = new Date();
    thisChore.confirmed = confirmReceiveData.done;
    choreLog.push(thisChore);

    console.log(confirmReceiveData);

    if (confirmReceiveData.done == true) {
      chores[confirmReceiveData.chore.id].status = 'unassigned';
      chores[confirmReceiveData.chore.id].timeAssigned= null;
      chores[confirmReceiveData.chore.id].timeCompleted= null;
      chores[confirmReceiveData.chore.id].selected= true;
      chores[confirmReceiveData.chore.id].assignee= null;
      chores[confirmReceiveData.chore.id].picture= null;
    }
  });

  socket.on('message',function(messageContent){
    //var thisMessage = clone(messageContent);
    var thisMessage = {};
    thisMessage.senderName=socket.userName;
    thisMessage.content = messageContent.content;
    thisMessage.timeSent = new Date();
    var thatMessage = clone(thisMessage);
    messageLog.push(thatMessage);
    io.sockets.emit('newMessage',thisMessage);
  });

});


