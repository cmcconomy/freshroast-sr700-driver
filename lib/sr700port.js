"use strict";

let SerialPort = require('serialport');
let sr700SerialNumber='1a86_5523';

let sr700port = null;

// returns devicename, eg '/dev/ttyUSB0'
function getDeviceName() {
  return new Promise( (resolve,reject) => {
    SerialPort.list((err,ports) => {
      if( err ) reject (err);
      let sr700ports = ports.filter((p)=>{return p.serialNumber==sr700SerialNumber});
      if( sr700ports.length == 0 ) {resolve (null);}
      resolve(sr700ports[0].comName);
      });
  });
};

// returns serialport, instantiating if necessary.
function openPort(deviceName) {
  return new Promise( (resolve, reject) => {
    if( deviceName == null ) { reject("Device Name must be passed") };
    let port = new SerialPort(deviceName, {autoOpen:false});
    resolve(port);
  });
};

function getPort() {
  return new Promise( (resolve, reject) => {
    if( !sr700port ) {
      getDeviceName().then(openPort).then((port) => {
        sr700port = port;
	resolve(port);
      });
    } else {
      resolve( sr700port );
    }
  });
}

module.exports.getDeviceName = getDeviceName;
module.exports.openPort = openPort;
module.exports.getPort = getPort;
