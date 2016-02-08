var Socket = require('socket.io-client');
var request = require('request');
var fs = require('fs');
var path = require('path');

var socket = Socket('wss://empireofcode.com', {
  transports: ['websocket'],
  path: '/ws/main'
});

var types = ['units', 'buildings'];
var typesCompleted = {};

var x = socket.$emit;

socket.$emit = function(){
     var event = arguments[0];
     var feed  = arguments[1];

     //Log
     console.log(event + ":" + feed);

    //To pass listener
    x.apply(this, Array.prototype.slice.call(arguments));
};

types.forEach(function (type) {
  var dictType = 'dict' + type.charAt(0).toUpperCase() + type.substring(1);
  socket.on(dictType, function (json) {
    if (json instanceof Object) {
      json = JSON.stringify(json);
    }
    fs.writeFile(path.join(__dirname, 'json', type + '.json'), json, function() {
      typesCompleted[type] = true;
      if (Object.keys(typesCompleted).length >= types.length) {
        process.exit(0);
      }
    });
  });
});

socket.on('connect', function () {
  console.log('Connected to EoC websocket');
  types.forEach(function (type) {
    request({
      url: 'https://empireofcode.com/api/dictionaries/' + type + '/',
      headers: {
        websocketconnectionid: socket.id
      }
    }, function (err) {
      if (err) {
        console.error('Warning: failed to send ' + type + ' request');
      }
    });
  });
});
