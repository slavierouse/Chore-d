var app = require('./app');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var chores = [];
io.on('connection', function(socket){ 
	io.sockets.emit("chores",chores)
	socket.on('image',function(img){
    	io.sockets.emit('image',img);
    });
    socket.on('message',function(data){
    	io.sockets.emit('message',data);
    });
});

server.listen(3000);