"use strict";

const Port = require('./port.js');
const Packet = require('./packet.js');
const State = require('./state.js');
const PIDController = require('pid-controller');

class Driver {

  constructor() {
    this.port = new Port();
    this.desiredState = new State();
    this.observedState = null;
    this.pid = instantiatePid();

    this.port.setDataCallback(this,this._receivedPacket);
    this.callee = null;
    this.callback = null;

    // special cases that need coordination in _loop()
    this.pendingDisconnect = false;
    this.pendingCooling = false;
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
    this.observedState = State.fromPacket(newReceivedPacket);

    // handle disconnect (have to tell roaster to shut off before we cut out)
    if( this.pendingDisconnect == true ) {
      if( this.observedState.action == State.constants.action.IDLE ) {
        this.port.disconnect();
        this.pendingDisconnect = false;
        return;
      }
      this.port.nextSendPacket = new Packet();
      return; 
    }

    this.pid.setInput(this.observedState.temp);
    if( this.desiredState.controlMode == State.constants.PID ) {
      this.pid.setMode(PIDController.AUTOMATIC);
      this.pid.setPoint(this.desiredState.temp);
      this.pid.compute();
    } else {
      this.pid.setMode(PIDController.MANUAL);
      this.pid.setOutput(this.desiredState.heatSetting);
    }
    this.desiredState.heatSetting = this.pid.getOutput();

    // Check for COOLING; SR700 will only enter COOLING mode after ROASTING, so here we make sure a call to COOLING will be executed by doing a single packet of ROASTING if necessary.
    if( this.pendingCooling == true ) {
      // prev packet was forced to ROASTING to enable subsequent COOLING
      this.pendingCooling = false;
      this.desiredState.action = State.constants.action.COOLING;
    } else {
      if( this.desiredState.action == State.constants.action.COOLING && 
      (this.observedState.action != State.constants.action.COOLING && this.observedState.action != State.constants.action.ROASTING) ) {
        this.desiredState.action = State.constants.action.HEATING;
        this.pendingCooling = true;
      }
    }
    this.port.nextSendPacket = this.desiredState.toPacket();

    if( this.callback != null && this.callee != null) {
      this.callback.apply(this.callee, [this.observedState, this.desiredState]);
    }
  }

  connect() {
    if( !this.port.isConnected ) {
      this.port.connect();
    }
  }

  disconnect() {
    this.pendingDisconnect = true;
  }

  get isConnected() {
    return this.port != null && this.port.isConnected;
  }

}

function instantiatePid() {
  let pid = new PIDController(0,0,0,0,0,PIDController.DIRECT);
  pid.setSampleTime(500);
  pid.setTunings(4.000, 0.045, 2.200);
  pid.setOutputLimits(0,3);

  return pid;
}

module.exports = Driver;
