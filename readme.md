
# maxLOM- Live API -> socket.io 

Leverages the recently added Node.js object in Max For Live to update a previous npm package - "max4node" https://www.npmjs.com/package/max4node - using the socket.io library instead of the Max UDP object to communicate with an external server.

The target use case is a local web application that allows multiple users to manipulate an Abelton Live session. See serverFunk repo for example of multiplayer set up. 

## Installation:


1. git clone https://github.com/iamjoncannon/maxLOM

2. place LOMcontroller.amxd into Live Session (any track will work)

Expose the API to your Node application:

```
const LOM = require("./maxLOM/LOM.js")
```

## Usage:
##  
Also includes a bunch of handler functions since the Live API is kind of wonky. Mostly self explanatory:

#### Global:

```
LOM.play()
LOM.stop()
LOM.resume() 
LOM.tempo.set(120)
LOM.bquant.set(4)  // 0 = none, 1 = 8 bars, 2 = 4 bars, 3 = 2 bars, 4 = 1 bar
LOM.scene(1).fire()
```

#### Track:

```
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
```

```

#### Roll Your Own 

See LOMstructure.txt for discussion of the API

```
LOM.call(path, command) // LOM.call("live_set", "stop_playing")
LOM.Set(path, prop, value) // LOM.Set("live_set tracks 1 mixer_device sends 1", "value", 0)

LOM.Get(path, property, callback) // LOM.Get("live_set", "tempo", (x)=> console.log(x))

LOM.observe(0, "live_set master_track mixer_device volume", "value", function(x){console.log(x)})
```
