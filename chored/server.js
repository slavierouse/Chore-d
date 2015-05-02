var app = require('./app');
var io = require('socket.io')(server);
var chores = require('./initiation/chores');


io.on('connection', function(socket){

  //chore assign
    //change chores array
    /*socket.on('choreAssign',function(chore){
      chores[chore.id].assignee = socket.id;
      chores[chore.id].timeAssigned = new Date();
      chores[chore.id].status = 'assigned';


    })*/








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
server.listen(3000);
console.log('server listening on port 3000');
