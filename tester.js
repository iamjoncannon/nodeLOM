//this will let you test the library from Node 

const LOM = require('./LOM.js');

LOM.connect()

let termIn = process.stdin;
termIn.setEncoding('utf-8');

termIn.on('data', function(data){

	if (data === 'play\n'){

		LOM.play()
	}

	if (data === 'stop\n'){

		LOM.stop()
	}

})