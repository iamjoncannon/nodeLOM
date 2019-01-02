/*

this is the external library linked to the node max
object via web sockets

this holds the handler function library that are
exported to the consumer node server

the data output by the handler functions is routed
through the socket port to the node max object, 
which then passes the data to the max js object
that has access to the live api

with get and observer functions, data is also routed
the other direction to the consumer server from Live
and exposed to the consumer via specified callbacks

*/

const LOM = {

  path: 'live_set',

  getList : {}, // basically a bootleg form of Promises-
                // stores get request callbacks to return once the value is returned from Abe

  observeList : {}, // same as getList but not deleted after the value is returned
                    // will stream as long as the socket is connected and the 
                    // observe value is assigned in the LOM interface 

  scrapeObject : {}, // stores the scrape data

  // these are global methods

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

    this.outlet(['obsSet', obs, path, prop]); // need to configure this i think

  },

  // maniupate the transport 

  play: function() {

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

  get: function(value, cb){
    this.Get(this.path, value, cb)
  },


};


LOM.track = function(num) {

  let trackPath = this.path + ' tracks ' + num;
  let trackProp;

  // source for this part:
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

    dev(num) {
      trackPath += ' devices ' + num
      return this
    },

    knob(num) {
      trackPath += ' parameters ' + num
      return this

    },

    on() {
      trackPath += ' parameters 0 ' 
      console.log(trackPath)
      LOM.Set(trackPath, 'value', 1)

    },

    off() {
      trackPath += ' parameters 0 ' 
      console.log(trackPath)

      LOM.Set(trackPath, 'value', 0)
    },

    send(sendNum){
      trackPath += ' mixer_device sends ' + sendNum;
      return this; 
    },

    set(val){
      LOM.Set(trackPath, 'value', val)
    },

    get(value, cb){
      this.Get(trackPath, value, cb)
    },
    
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

      console.log(data.message)

      if (data.type == 'id'){

        LOM.sockID = data.id

      }

      // here we handle data returned from Live 

      if (data.type === 'got'){

        LOM.getList[data.path + data.prop](data.value) // calling the callback with the value returned from Live

        LOM.getList[data.path + data.prop] = null; // resetting the key on the get object

      }

      if (data.type === 'observed' && LOM.observeList[data.path.slice(1,-1) + data.prop]){ // same process as above except 

        LOM.observeList[data.path.slice(1,-1) + data.prop](data.value) 

      }
    
    });

    // socket.emit('fromClient', "Hello Mars")

    LOM.socket = socket;

};

LOM.init = function(){

    //initalize an object that returns the global observe methods as an object

};

LOM.scrape = function(){

    // initiate a cascade of get calls 
    // for the total state of the set
    // store them on the scrapeObject

},

module.exports = LOM;



// TO DO \\



// SECOND // finalize the functions for
// the get methods- 

// figure out how to get the name of a track clip
// figure out how to get the number of devices in a track


// LiveAPI("live_set tracks 0 clip_slots 0").get("name")

// LOM.track(1).clip(4).get("name," (name) => console.log(name)) // "04 Goodbye World!"

// LOM.count(property, callback) // properties: 'tracks', 'clips', 'scenes' // LiveAPI("live_set").getcount('tracks')

// LOM.tracks.count()
// LOM.scenes.count()
// LOM.track










// THIRD- put the get methods together into one big get request

// LOM.scrape() 

/* 

returns an object representing the whole set
  - number of tracks
  - track names 
  - number of scenes
  - track info
    - device parameter names
    - clip names

*/















// Fourth

// observe method-

// LOM.track(1).observe("is playing", ( )=> console.log("Track 1 is Playing")).

// suggested observe list/things to use with server funk

