//NOTE: SERVER CONFIGURATION for heroku..
var http = require('http');
var express = require('express');
var app = express();
var httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 5000);
// heroku will auto-assign a port number: process.env.PORT
// heroku local will serve the app @ port == 5000, by default (this is heroku's preference)
// regular node index.js will serve the app @ port == 5000, as description above.

//http socket.io server (same port as WWW service)
var io = require('socket.io')(httpServer, {
  'pingInterval': 1000,
  'pingTimeout': 3000
});

//express configuration
app.use(express.static('public'));

//socket.io events
io.on('connection', function(socket) {

  //entry log.
  console.log('someone connected.');

  //on 'sound'
  // var soundactive = false;
  socket.on('sound', function(sound) {

    //relay the message to everybody EXCEPT the sender
    socket.broadcast.emit('sound', sound);

    //DEBUG
    console.log('sound.name :' + sound.name);
    console.log('sound.action :' + sound.action);
    console.log('sound.group :' + sound.group);
  });

  //on 'clap' --> relay the message to everybody INCLUDING sender
  socket.on('clap', function(clap) {

    //relay the message to everybody INCLUDING sender
    io.emit('clap', clap);

    //DEBUG
    console.log('clap.name :' + clap.name);
  });

  //on 'disconnect'
  socket.on('disconnect', function() {

    console.log('someone disconnected.');

  });
});
