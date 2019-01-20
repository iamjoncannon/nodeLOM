
# nodeLOM- Live API <-> socket.io 

Leverages the recently added Node.js object in Max For Live to update a previous npm package - "max4node" https://www.npmjs.com/package/max4node - using socket.io instead of the Max UDP object to communicate with an external server. Includes an extensive Javascript driver for the Live API.

## Config:

1. npm install

3. Place LOMcontroller.amxd into Live Session (any track will work)

4. Press 'script start' button in the Max device. This will spin up the socket.io server locally on port 8080.

5. Expose the API to your Node process:

```Javascript
const LOM = require("./LOM.js")

LOM.connect() 
```

## Sample Web App:

Spin up the sample server in your CLI:

```ssh
nodeLOM$ node sampleServer.js
```

This will start the server and open a link to the app in your browser. The external Node process should read:

```BASH
"Serving {your_localhost_netmask}:5000
Node in Max says:
Connected to Live on port 8080
via socket.io with socket id: vaztsCubDNo12O1lAAAk"
```

The Max Device should readout something similar. 

Click on the QR link with your cell phone and you can play with your Live set from your phone :). 

## Usage:

#### Global:

```Javascript
LOM.play()
LOM.stop()
LOM.stopClips()
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
LOM.track(1).dev(0).off() 
LOM.tracks(2).dev(0).on() 
LOM.track(1).dev(0).knob(1).set(127) // 1-127 (NB: not 0 indexed)
```

#### Get requests

```Javascript
LOM.tracks(0).get("name", (x)=>console.log(x)) // "01 Goodbye World boom bap drums"
LOM.tracks(1).clip(0).get("name", (x)=>console.log(x)) // "Hello Mars entrance synth"
LOM.get("tempo", (x)=>console.log(x)) // "120" 
LOM.track(1).dev(0).knob(1).get("name", (name) => console.log(name)) // "my funky knob"

LOM.count("tracks", (tracks)=>console.log(tracks)) // "15"
LOM.count("scenes", (scenes)=>console.log(scenes)) // "8"

```

#### Scrape Set Data

Return a JSON with detailed track information, including all track names, clip names, scene numbers, devices, and device parameter names

```Javascript

// LOM.scrape() method returns a promise

let myLiveSession; 

LOM.scrape().then( function(x){myLiveSession = x}; ) 

{...
'11':
   { name: 'beats',
     clips:
      [ 0,
        '102 - For The Love Of Money - Disco Dub Band',
        '109 - Fill Me Up - Elaine & Elen',
        '109 - Was That All It Was - Jean Carne',
        '113 - Love Injection - Trussel',
        '108 - Sexy Eyes - Rozalin Woods',
        '113 - Mr Magician - Mystic Merlin',
        '101 - Be Thankful For What You Got - Reel To Real',
        '116 - Chove Chuva, Mas Que Nada - Samba Soul',
        "101 - I Can't Forget About You - Ronn Matlock",
        0 ],
     deviceParams:
      [ <1 empty item>,
        'Output Gain',
        'Scale',
        'Adaptive Q',
        '1 Filter On A',
        '1 Filter Type A',
        '1 Frequency A' ] },
	},
'12': ...
 'scene names':
   [ ' terraform 011',
     ' 2',
     ' 3',
     ' synth breakdown',
     ' 5',
     ' 6',
     ' remember 4u wholsale chorus',
     ' 8',
     ' 9',
     ' 10',
     ' arnold on mars intro',
     ' 12',
     ' 13',
     ' 14',
     ' 15',
     ' 16',
     ' 17',
     ' bridge',
     ' 19',
     ' 20',
     ' 21',
     'beloved']}
}
```

#### Stream Data- LOM.observe 

Continuously stream value changes. 

```Javascript
LOM.init((x)=>console.log(x)) // routes the following observers

{ 'current tempo': 118 }
{ 'playing?': 'Abe is not playing' }
{ 'master volume fader': 0.840765237808 }
{ 'track time': 4.70006575964 }
{ 'beat position': [ 5 ] }
{ 'master track output level': 0 }

```

#### Roll Your Own 

good starter: http://compusition.com/writings/js-live-api-basics

```Javascript
LOM.call(path, command) // LOM.call("live_set", "stop_playing")

LOM.Set(path, prop, value) // LOM.Set("live_set tracks 1 mixer_device sends 1", "value", 0)

LOM.Get(path, property, callback) // LOM.Get("live_set", "is playing", (x)=> console.log(x)) // "true"

LOM.observe(number, path, property, callback) // LOM.observe(0, "live_set master_track mixer_device volume", "value", (x)=>console.log(x)) // ".01232"
```
