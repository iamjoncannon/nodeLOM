
# maxLOM- Live API <-> socket.io 

Leverages the recently added Node.js object in Max For Live to update a previous npm package - "max4node" https://www.npmjs.com/package/max4node - using the socket.io library instead of the Max UDP object to communicate with an external server.

The target use case is a local web application that allows multiple users to manipulate an Abelton Live session. 

## Installation:

1. git clone https://github.com/iamjoncannon/maxLOM

2. install dependencies into subdirectory:

```node
npm i socket.io
```

3. Place LOMcontroller.amxd into Live Session (any track will work)

4. Press 'script start' button in the Max device. This will spin up the socket.io server locally on port 8080.

5. Expose the API:

```Javascript
const LOM = require("./maxLOM/LOM.js") // or ("./../maxLOM/LOM.js")

LOM.connect()
```

## Usage:

#### Global:

```Javascript
LOM.play()
LOM.stop()
LOM.resume() 
LOM.tempo.set(120)
LOM.bquant.set(4)  // 0 = none, 1 = 8 bars, 2 = 4 bars, 3 = 2 bars, 4 = 1 bar
LOM.scene(1).fire()
```

#### Track:

```Javascript
LOM.track(0).clip(0).fire()
LOM.track(1).stop()
LOM.track(1).solo()
LOM.track(1).unsolo()
LOM.track(1).mute()
LOM.track(1).unmute()
LOM.track(1).vol(100) // 1 to 110, 100 is unity gain
LOM.track(1).pan(-1) // -1 to 1, 0 is center
LOM.track(1).send(1).set(0) // 0 to 1
```

#### Device
```Javascript
LOM.track(1).dev(0).off() // disables device
LOM.tracks(2).dev(0).on() // enables device
LOM.track(1).dev(0).knob(1).set(127) // 1-127 (NB: not 0 indexed)
```

#### Get requests

```Javascript
LOM.tracks(0).get("name", (x)=>console.log(x)) // "01 Goodbye World boom bap drums"
LOM.tracks(1).clip(0).get("name", (x)=>console.log(x)) // "Hello Mars entrance synth"
LOM.get("tempo", (x)=>console.log(x)) // "120" 
```

Return a JSON with detailed track information, including all track names, clip names, scene numbers, devices, and device parameter names

```Javascript

let myLiveSession = LOM.scrape()

console.log(myLiveSession) 

{



}

```

See below for specific get requests.

#### LOM.observe

Continuously stream value changes. 

Global transport properties can be streamed continuously to a specified callback.

```Javascript
LOM.init((x)=>console.log(x))
```

N.B. the init method utilize observers 1-5, and only 20 observers are available. 

#### Roll Your Own 

See LOMstructure readme for detailed discussion of how to deal with the Live API

```Javascript
LOM.call(path, command) // LOM.call("live_set", "stop_playing")

LOM.Set(path, prop, value) // LOM.Set("live_set tracks 1 mixer_device sends 1", "value", 0)

LOM.Get(path, property, callback) // LOM.Get("live_set", "is playing", (x)=> console.log(x)) // "true"

LOM.observe(number, path, property, callback) //LOM.observe(0, "live_set master_track mixer_device volume", "value", (x)=>console.log(x)) // ".01232"
```
