let Settings_database = [];
let Settings_brains = [];
let Settings_ready;
const showUnsupported = false;
const sellectionoptions = [
  { value: "ACCESSOIRE", name: "Accessoire", supported: true },
  { value: "LIGHT", name: "Light", supported: true },
  { value: "TV", name: "Television", supported: true },
  { value: "DVD", name: "DVD Player", supported: true },
  { value: "VOD", name: "Video on demand", supported: true },
  { value: "PROJECTOR", name: "Projector", supported: true },
  { value: "DVB", name: "DVB", supported: true },
  { value: "AVRECEIVER", name: "A/V Receiver", supported: true },
  { value: "AUDIO", name: "Audio", supported: true },
  { value: "HDMISWITCH", name: "HDMI Switch", supported: true },
  { value: "GAMECONSOLE", name: "Game Console", supported: true },
  { value: "MEDIAPLAYER", name: "Media Player", supported: true },
  { value: "MUSICPLAYER", name: "Music Player", supported: true },
  { value: "SOUNDBAR", name: "Soundbar", supported: false },
  { value: "TUNER", name: "Tuner", supported: false },
  { value: "THERMOSTAT", name: "Thermostat", supported: false },
  { value: "CLIMA", name: "climate control", supported: true },
  { value: "SONOS", name: "Sonos", supported: false }
];
