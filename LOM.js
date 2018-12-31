/*

this is the external library linked to the node max
object via web sockets

this holds the handler function library that will
be exported to the consumer node server

the data output by the handler functions is routed
through the socket port to the node max object, 
which then passes the data to the max js object
that has access to the live api

with get and observer functions, data is also routed
the other direction to the consumer server from Live

*/

let LOM = {

  path: 'live_set',

  getList : {},

  observeList : {},

  outlet: function(data){

    this.socket.emit('fromClient', data)

  },

  call: function(path, order) {
    this.outlet(['call', path, order]);
  },

  Set: function(path, prop, value) {
    this.outlet(['set', path, prop, value]);
  },

  Get: function(path, prop, cb) {

    this.getList[path+prop] = cb;

    this.outlet(['get', path, prop]);
  },

  observe: function(obs, path, prop, cb){

    this.observeList[path+prop] = cb;

    this.outlet(['obsSet', obs, path, prop]);


  },

  play: function() {
    console.log('bang')
    this.call(this.path, 'start_playing');
  },

  stop: function() {
    this.call(this.path, 'stop_playing');
  },

  resume: function() {
    this.call(this.path, 'continue_playing');
  },

  bquant: {
    set: function(value) {
      LOM.Set('live_set', 'clip_trigger_quantization', value);
    },
  },

  tempo: {
    set: function(value) {
      LOM.Set('live_set', 'tempo', value);
    }, // LiveAPI("live_set").set("tempo", 80);
  },
};

LOM.track = function(num) {

  let trackPath = this.path + ' tracks ' + num;
  let trackProp;

  // s/o the source for this part:
  // https://medium.com/@jamischarles/how-to-chain-functions-in-javascript-6644d44793fd

  let obj = {

    fire() {
      LOM.call(trackPath, 'fire');
    },

    stop() {
      LOM.call(trackPath, 'stop_all_clips');
    },

    solo() {
      this.path += ' tracks ' + num;

      LOM.Set(trackPath, 'solo', true);

    },

    unsolo() {
      this.path += ' tracks ' + num;

      LOM.Set(trackPath, 'solo', false);
    },

    mute() {
      this.path += ' tracks ' + num;

      LOM.Set(trackPath, 'mute', true);
    },

    unmute() {
      this.path += ' tracks ' + num;

      LOM.Set(trackPath, 'mute', false);
    },

    vol(num){
      LOM.Set(trackPath + " mixer_device volume", "value", num * .0087)
      
      return this
    },

    pan(num){
      LOM.Set(trackPath + " mixer_device panning", "value", num)
      
      return this
    },

    clip(clipNum) {
      trackPath += ' clip_slots ' + clipNum;
      return this; 

    }, // "live_set tracks 0 clip_slots 0"

    send(sendNum){
      trackPath += ' mixer_device sends ' + sendNum;
      return this; 
    },

    set(val){
      LOM.Set(trackPath, 'value', val)
    }
  };

  return obj; 
};

LOM.scene = function(num) {

  let trackPath = this.path + ' scenes ' + num;

  let obj = {
    fire() {
      LOM.call(trackPath, 'fire');
    },
  };

  return obj;
};

LOM.connect = function(){

    // this creates a client connection with the max node socket.io server

    const io = require('socket.io-client');

    socket = io.connect('http://localhost:8080');

    // we can assign the listeners for data from the Max node server here

    socket.on('fromServer', function(data){

      // console.log(data)

      if (data.type == 'id'){

        LOM.sockID = data.id

        // console.log(LOM.sockID)

      }

      if (data.type === 'got'){

        LOM.getList[data.path + data.prop](data.value)

        LOM.getList[data.path + data.prop] = null;

      }

      if (data.type === 'observed' && LOM.observeList[data.path.slice(1,-1) + data.prop]){

        LOM.observeList[data.path.slice(1,-1) + data.prop](data.value)

      }
    
    });

    // socket.emit('fromClient', "Hello Mars")

    LOM.socket = socket;

};

module.exports = LOM;

// LOM.connect();

// let termIn = process.stdin;
// termIn.setEncoding('utf-8');
// termIn.on('data', function(data){
//   if (data === 'play\n'){LOM.play()}
//   if (data === 'stop\n'){LOM.stop()}
//   if (data === 'test\n'){



//     // LOM.Set("live_set tracks 1 devices 1 parameters 0", "value", 0 )



//   }
// })


// Global controls:

// LOM.play()
// LOM.stop()
// LOM.resume() 
// LOM.tempo.set(120)
// LOM.bquant.set(4)  // 0 = none, 1 = 8 bars, 2 = 4 bars, 3 = 2 bars, 4 = 1 bar
// LOM.scene(2).fire()

// Track Controls 

// LOM.track(0).clip(0).fire()
// LOM.track(2).stop()
// LOM.track(1).solo()
// LOM.track(1).unsolo()
// LOM.track(2).mute()
// LOM.track(2).unmute()
// LOM.track(1).vol(100) // from 1 to 110, 100 is unity gain
// LOM.track(2).pan(-1) // -1 to 1, 0 is center position
// LOM.track(1).send(1).set(0) // from 0 to 1



// Roll Your Own - see LOM structure readme for discussion \\

// LOM.call(path, order) // e.g LOM.call("live_set", "stop_playing")
// LOM.Set(path, prop, value) // e.g. LOM.Set("live_set tracks 1 mixer_device sends 1", "value", 0)

// LOM.Get(path, property, callback) // e.g. LOM.Get("live_set", "tempo", (x)=> console.log(x))
// LOM.Get("live_set tracks 0", "name", (x)=> console.log(x))

// LOM.observe(0, "live_set master_track mixer_device volume", "value", function(x){console.log(x)})




// TO DO \\

// LOM.track(1).dev(1).knob(4).set(value) // LOM.Set("live_set tracks 1 devices 1 parameters 0", "value", 0 )
// LOM.track(1).dev(3).off()
// LOM.tracks(2).dev(4).on()
// LOM.track(1).clip(4).get("name," (name) => console.log(name)) // "04 The Goodbye World"

// LOM.count(property, callback) // properties: 'tracks', 'clips', 'scenes' // LiveAPI("live_set").getcount('tracks')

// LOM.tracks.count()


// LiveAPI("live_set tracks 0 clip_slots 0").get("name")


// LOM.track(1).observe("is playing", ( )=> console.log("Track 1 is Playing")).


