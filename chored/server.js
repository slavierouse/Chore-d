var app = require('./app');
var chores = require('./initiation/chores');

app.get('/chores',function(request,response) {
  response.send(JSON.stringify(chores));
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

console.log(chores);
io.on('connection', function(socket){

    socket.on('signin',function(info){
      socket.email = info.email;
      socket.userName = info.name;
    })

    socket.on('choreSelect', function(chore){
      chores[chore.id].selected = true;
      console.log(chores);
    });

    socket.on('choreUnselect', function(chore){
      chores[chore.id].selected = false;
      console.log(chores);
    });

    socket.on('choreAssign',function(chore){
      chores[chore.id].assignee = socket.email;
      chores[chore.id].timeAssigned = new Date();
      chores[chore.id].status = 'assigned';
      console.log(chores);
    });

    socket.on('submitChoreComplete',function(completeReceiveData){
      chores[completeReceiveData.chore.id].status = 'completed';
      chores[completeReceiveData.chore.id].timeCompleted = new Date();
      var completeSendData = {
        choreID: {id: completeReceiveData.chore.id},
        choreName: chores[completeReceiveData.chore.id].name,
        senderId: socket.email,
        senderName: socket.userName
      }
      io.sockets.emit('notifyChoreComplete',completeSendData);
      console.log(chores);
    });

    //socket.on('')







  /*socket.on('choreConfirm',function(data){

    if(data.done){
      //log as complete
      //send a
    } else {
      //send the user who did it a rejection notification
        io.sockets.emit('fraudulent',data)
      //log as fraudulent
    }
  })


	socket.on('image',function(img){
    	io.sockets.emit('image',img);
    });
    socket.on('message',function(data){
    	io.sockets.emit('message',data);
    });*/
});


