"use strict";

const SR700Port = require('./sr700port.js');
const SR700Packet = require('./sr700packet.js');
const SR700State = require('./sr700state.js');
const PIDController = require('pid-controller');

class SR700 {

  constructor() {
    this.port = new SR700Port();
    this.desiredState = new SR700State();
    this.observedState = null;
    this.pid = instantiatePid();

    this.port.setDataCallback(this,this._receivedPacket);
    this.callee = null;
    this.callback = null;

    this.pendingDisconnect = false;
  }

  // callback is of form fn(observedState,desiredState)
  setCallback(callee, callback) {
    this.callee = callee;
    this.callback = callback;
  }

  getDesiredState(state) {
    return this.desiredState;
  }

  setDesiredState(state) {
    this.desiredState = state;
  }

  getObservedState() {
    return this.observedState;
  }

  _receivedPacket(newReceivedPacket) {
    this.observedState = SR700State.fromPacket(newReceivedPacket);

    // handle disconnect (have to tell roaster to shut off before we cut out)
    if( this.pendingDisconnect == true ) {
      if( this.observedState.action == SR700State.constants.action.IDLE ) {
        this.port.disconnect();
        this.pendingDisconnect = false;
        return;
      }
      this.port.nextSendPacket = new SR700Packet();
      return; 
    }

    this.pid.setInput(this.observedState.temp);
    if( this.desiredState.controlMode == SR700State.constants.PID ) {
      this.pid.setMode(PIDController.AUTOMATIC);
      this.pid.setPoint(this.desiredState.temp);
      this.pid.compute();
    } else {
      this.pid.setMode(PIDController.MANUAL);
      this.pid.setOutput(this.desiredState.heatSetting);
    }
    this.desiredState.heatSetting = this.pid.getOutput();
    this.port.nextSendPacket = this.desiredState.toPacket();

    if( this.callback != null && this.callee != null) {
      this.callback.apply(this.callee, [this.observedState, this.desiredState]);
    }
  }

  connect() {
    this.port.connect();
  }

  disconnect() {
    this.pendingDisconnect = true;
  }

}

function instantiatePid() {
  let pid = new PIDController(0,0,0,0,0,PIDController.DIRECT);
  pid.setSampleTime(500);
  pid.setTunings(4.000, 0.045, 2.200);
  pid.setOutputLimits(0,3);

  return pid;
}

module.exports = SR700;
