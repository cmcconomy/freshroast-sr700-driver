"use strict";

let SerialPort = require('serialport');
let sr700SerialNumber='1a86_5523';

let sr700port = null;

// returns devicename, eg '/dev/ttyUSB0'
let getDeviceName = () => {
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
// port is set to autoOpen: False.
let openPort = (deviceName) => {
  return new Promise( (reject,resolve) => {
    if (!sr700port) {
      console.log("Creating new port")
      sr700port = new SerialPort(deviceName, (err) => {
        if(err) {reject(err);}
      });
    }
    resolve(sr700port);
  });
};

module.exports.getDeviceName = getDeviceName;
module.exports.openPort = openPort;
