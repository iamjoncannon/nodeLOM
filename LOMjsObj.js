// file for the JS max object

outlets = 2;


// post(LiveAPI("live_set tracks 1 devices 0 parameters 0").set('value', 0)) // parameter 0 enables and disables the device


// post(LiveAPI("live_set tracks 1 devices 0 parameters 8").set('value', 100)) // parameters 1-8 change the macro values


// call and set 

function call(path, order){
	
	outlet(0, [path, order])

	LiveAPI(path).call(order)

	// nothing to return- unidirectional
	
}

function set(path, prop, value){

	outlet(0, path, prop, value)

	LiveAPI(path).set(prop, value)

	// target syntax: 
	// var liveObject = new LiveAPI("live_set");
	// liveObject.set("tempo", 80);

	// nothing to return - unidirectional

}

// get

function get(path, prop){

	outlet(0, path, prop)

	outlet( 1, 'got' , path, prop, LiveAPI(path).get(prop) );

	// LiveAPI("live_set master_track mixer_device volume").get("value")

}


// observer 

observeCB = function(valChange){

		outlet(1, 'observed', this.path, valChange) 
										// the cb argument is the property 
										// and the changed value

}	

var obs1 = new LiveAPI(observeCB);

// ...yes we are literally going to create 20 instances of this object
// each observer is its own lil unique object and can't be created any other way
// if you need more observers feel free to copy and paste, frand

var obs2 = new LiveAPI(observeCB);
var obs3 = new LiveAPI(observeCB);
var obs4 = new LiveAPI(observeCB);
var obs5 = new LiveAPI(observeCB);
var obs6 = new LiveAPI(observeCB);
var obs7 = new LiveAPI(observeCB);
var obs8 = new LiveAPI(observeCB);
var obs9 = new LiveAPI(observeCB);
var obs10 = new LiveAPI(observeCB);
var obs11 = new LiveAPI(observeCB);
var obs12 = new LiveAPI(observeCB);
var obs13 = new LiveAPI(observeCB);
var obs14 = new LiveAPI(observeCB);
var obs15 = new LiveAPI(observeCB);
var obs16 = new LiveAPI(observeCB);
var obs17 = new LiveAPI(observeCB);
var obs18 = new LiveAPI(observeCB);
var obs19 = new LiveAPI(observeCB);
var obs20 = new LiveAPI(observeCB);

var obsArr = [obs1, obs2, obs3, obs4, obs5, obs6, obs7, obs8, obs9, obs10, 
obs11, obs12, obs13, obs14, obs15, obs16, obs17, obs18, obs19, obs20];


function obsSet(observer, path, property){

	obsArr[observer].path = path; // "live_set master_track mixer_device volume";
	obsArr[observer].property = property; // "value";
	obsArr[observer].mode = 1; // prevents assignment from changing if the order of the tracks changes

}

// zero out any previous observer assignments
// since they persist in Live after the server is closed

for (var i = 0; i < obsArr.length; i++){

	obsSet(i, null, null)
}

// default observer values: 

// obsSet(0, "live_set master_track mixer_device volume", "value")

// obsSet(1, the beat)

// obsSet(1, "live_set tracks 0 mixer_device volume", "value")


/*

Data path between the objects for the total observer process:

	User:
	
		LOM.observer1(callback) // 'master volume'

	LOM.js file: 

		// record the callback assigned to the listener 

		observerObj : {}

		observer : function(prop, callback){
					
					this.observerObj[prop] = callback // e.g. (x) => console.log(x)

				}

		// add this to the socket listener

		socket.on('fromServer', function(data){

			if (data.type === 'observed'){  // if the data receceived is an observer
	
				this.observerObj[data.event](data.value) 

				// call the callback stored to the cache argument 
				with the value returned
			}

    	});

	Node Object:

		 Max.addHandler('input', (input) => { 

	 		 io.emit('fromServer', { type: input[1], event: input[2], value: input[3] } )
										  'observed'     'master volume'	'valChange'

 		})

	JS object:

		var obs1 = new LiveAPI(obscb);

		obscb = function(valChange){
			
			outlet(0, ['observed', this.property, valChange])

		}	

		obsSet = function(path, property){
	
			this.path = path; // "live_set master_track mixer_device volume";
			this.mode = 1;
			this.property = property; // "value";
		
		} // this at least doesn't throw an error

		var obs2 = new LiveAPI(obscb);
		
*/
