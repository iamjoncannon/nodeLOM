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

  count: function(prop, cb, path) {

    if(path){
      this.getList[path+prop] = cb;

      this.outlet(['count', path, prop]);
    }
    else{
      this.getList[this.path+prop] = cb;

      this.outlet(['count', this.path, prop]);
    }
  },

  observe: function(obs, path, prop, cb){

    this.observeList[path+prop] = cb;

    this.outlet(['obsSet', obs, path, prop]); 

  },

  // transport 

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
    LOM.Get(this.path, value, cb)
  },

};


LOM.track = function(num) {

  let trackPath = this.path + ' tracks ' + num;
  let trackProp;

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

      LOM.Set(trackPath, 'value', 1)

    },

    off() {
      trackPath += ' parameters 0 ' 

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
      // console.log(trackPath)
      if(trackPath.includes("clip_slots")){
        trackPath += " clip "
      }
      
      LOM.Get(trackPath, value, cb)
    },

    count(value, cb){
      // console.log(trackPath, value)
      LOM.Get(trackPath, value, cb)
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

    get(value,cb) {
      LOM.Get(trackPath,value, cb)
    },
  
  };

  return obj;
};

 
LOM.connect = function(){

    const io = require('socket.io-client');

    socket = io.connect('http://localhost:8080'); 

    socket.on('fromServer', function(data){ 

      if (data.type === 'openMessage'){

        console.log(data.value)

      }

      if (data.type == 'id'){

        LOM.sockID = data.id

      }

      // handle data returned from Live 

      if (data.type === 'got'){
              // console.log(data)

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


LOM.scrape = function(){

  // async functions to scrape the Live session

  let cache = {};

  function trackCountPromise(){
    return new Promise(resolve=>{
      LOM.count('tracks', (x)=>{resolve(x)})
    })
  }

  function trackNameGetPromise(num){
    return new Promise(resolve=>{

      LOM.track(num).get('name', (x)=>resolve( cache[num] = {name: x, clips: [], deviceParams: []} ))

    })
  }

  async function asyncTrackScrape(count){

    let list = [];

    for(let i =0; i < count;i++){
      list.push(i)
    }

    for (let j of list){

      await trackNameGetPromise(j)
    
    };
    
    return cache;
  }

  function sceneCountPromise(){
    return new Promise(resolve=>{
      LOM.count('scenes', (x)=>{resolve(x)})
    })
  }

  function clipNameGetPromise(inputArr, trackNum, clipNum){
      return new Promise(resolve=>{

        LOM.track(trackNum).clip(clipNum).get('name', (x)=>resolve(inputArr[clipNum] = x))
      
      })
  }

  function deviceParamsGetPromise(inputArr, trackNum, devNum){
      return new Promise(resolve=>{

        LOM.track(trackNum).dev(0).knob(devNum).get('name', (x)=>resolve(inputArr[devNum] = x))
      
      })
  }


  async function asyncSceneScrape(trackArray, scenesNum){

    let scenes = [];

    let devices = [1,2,3,4,5,6]

    for(let i =0; i < scenesNum; i++){
      scenes.push(i)

    }



    for (let j of Object.keys(trackArray)){

      console.log("processing track: ", j, '\n')

      for (let k of scenes){
          await clipNameGetPromise(trackArray[j].clips, j, k )
      }

      for (let L of devices){

          await deviceParamsGetPromise(trackArray[j].deviceParams, j, L)
      }

    
    };
    
    return trackArray;
  }

  async function theScrape(){

    let trackCount = await trackCountPromise();

    console.log('tracks: ', trackCount, '\n')
    
    let sceneCount = await sceneCountPromise();
    
    console.log('scenes: ', sceneCount, '\n')
    
    let trackList = await asyncTrackScrape(trackCount);
    let finalArray = await asyncSceneScrape(trackList, sceneCount)

    return finalArray 

  }

  return theScrape() 

},


LOM.init = function(){

    //initalize an object that returns the global observe methods as an object

};


module.exports = LOM;

// TO DO \\


// Fourth

// observe method-

// LOM.track(1).observe("is playing", ( )=> console.log("Track 1 is Playing")).

// suggested observe list/things to use with server funk

