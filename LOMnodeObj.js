/* eslint-disable no-undef */

/*

this is the node.js max file
this hosts a socket io server

*/

let PORT = 9000;

// ^^^^^^^^^^^^^
// this is the socket port

// start a socket io server

const Max = require('max-api');

const http = require('http');

const server = http.createServer();

const io = require('socket.io').listen(server);

let idList = [];

io.sockets.on('connection', function (socket) {

    Max.outlet('display', `I'm talking to Live, and we're connected on port ${PORT} \nvia socket.io with socket id: ${socket.id}`);

	idList.push(socket.id);

    // this emits to the socket that just connected

    socket.emit('fromMax', { type: 'openMessage', value: `Node in Max says:\nConnected to Live on port ${PORT} \nvia socket.io with socket id: ${socket.id}`} );

    // socket.emit('fromMax', { type: 'id', id: socket.id} );
    // send to the client, next phase of the project will
    // append get and observer requests with the socket id tag

    // client listeners have to be put inside the sever side connection callback

    // simply relaying the data into the Max JS object

    socket.on('fromLib', function(data2){

		Max.outlet(data2);

	});

    socket.on('disconnect', function(){

        Max.outlet('display', `Disconnected from External Node on Port ${PORT}`);

        Max.outlet('obsSet', 'reset');
    });

});

server.listen(PORT);

// handlers for the get and observer relays

Max.addHandler('got', (path, val, result) => {

	io.emit('fromMax', { type: 'got', path: path, prop: val, value: result } );

});

Max.addHandler('observed', (path, val, result) => {

	io.emit('fromMax', { type: 'observed', path: path, prop: val, value: result } );

});

