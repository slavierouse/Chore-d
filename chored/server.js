var app = require('./app');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var chores = require('./initiation/chores');


io.on('connection', function(socket){
	io.sockets.emit("chores",chores);

  /*socket.on('')
  socket.on('choreConfirm',function(data){

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
  response.status(200).end(JSON.stringify(chores));
});

server.listen(3000);
