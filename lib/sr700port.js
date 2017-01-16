"use strict";

const SerialPort = require('serialport');
const SR700Packet = require('./sr700packet.js');
const sr700SerialNumber='1a86_5523';
const debug = require('debug')('sr700')  

class SR700Port {
  constructor() {
    this._reset();
  }

  _reset() {
    this.serialPort = null;
    this.loopWaitTime = 500; // milliseconds
    this.lastSendPacketTime = null;
    this.nextSendPacket = new SR700Packet();
    this.lastReceivePacket = null;
  }

  onDataCallback(newReceivedPacket) {
    // override this to be informed when new data is received
  }


  get isConnected() {
    return this.serialPort != null && this.serialPort.isOpen();
  }

  connect() {
    let that=this;
    return new Promise( (resolve,reject) => {
      if( that.isConnected ) { resolve(that.serialPort) };
      that._reset();
      // the ugly trick with then(()=>{}) is necessary to preserve "this" context
      that._getDeviceName().then((name)=>{return that._instantiatePort(name)}).then( (port) => {
        that.serialPort = port;
        port.open();
        resolve();
      });
    });
  }

  disconnect() {
    var that=this;
    this.serialPort.close((err)=> {
      that._reset();
    });
  }

  _loop() {
    if( !this.isConnected ) { return; }
    let wait = this.loopWaitTime;
    if (this.lastSendPacketTime) {
      wait -= (new Date().getTime() - this.lastSendPacketTime);
    } else {
      this.lastSendPacketTime = new Date().getTime();
    }

    if( wait > 0 ) {
      setTimeout(()=>{this._loop()}, wait);
    } else {
      debug("Sending Packet: " + this.nextSendPacket.toBytes().toString('hex'));
      let that=this;
      this.serialPort.write(this.nextSendPacket.toBytes(), (err) => {
        if(err){reject(err)};
        that.lastSendPacketTime = new Date().getTime();
        that._loop();
      });
    }
  }

  _processData(buffer) {
    // the delimiter parser returns an array of ints instead of a buffer
    if( buffer.constructor === Array ) { buffer = Buffer.from(buffer); }
    this.lastReceivePacket = SR700Packet.fromBytes(buffer);
    this.onDataCallback(this.lastReceivePacket);
  }

  // returns devicename, eg '/dev/ttyUSB0'
  _getDeviceName() {
    return new Promise( (resolve,reject) => {
      SerialPort.list((err,ports) => {
        if( err ) reject (err);
        let sr700ports = ports.filter((p)=>{return p.serialNumber==sr700SerialNumber});
        if( sr700ports.length == 0 ) {reject ("Could not detect connected SR700");}
        resolve(sr700ports[0].comName);
        });
    });
  };

  _instantiatePort(deviceName) {
    let port = new SerialPort(deviceName, {
        //parser:SerialPort.parsers.byteLength(14),
        parser:SerialPort.parsers.byteDelimiter([0xAA,0xFA]), // packets occasionally get misaligned - this works more reliably than SerialPort.parsers.byteLength(14)
        autoOpen:false,
        bufferSize: 1024
    });
    let that = this;
    port.on('open', (err) => {
      if(err) throw err;
      that._sendInitPacket();
      that._loop();
    });
    port.on('data', (data) => {
      that._processData(data);
    });
    return port;
  };

  _sendInitPacket() {
    const initPacket = new SR700Packet(true);
    this.serialPort.write(initPacket.toBytes());
  }
}

module.exports = SR700Port;
