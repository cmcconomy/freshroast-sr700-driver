"use strict";

const Port = require('./port.js');
const Packet = require('./packet.js');
const State = require('./state.js');
const PIDController = require('pid-controller');

class Driver {

  constructor() {
    this.port = new Port();
    this._loopWaitTime = 500; // in millisec; 'private' to allow Setter
    this.desiredState = new State();
    this.observedState = null;
    this.pid = instantiatePid(this._loopWaitTime, 4.000, 0.045, 2.200);

    this.port.setDataCallback(this,this._receivedPacket);
    this.callee = null;
    this.callback = null;

    // special cases that need coordination in _loop()
    this.pendingDisconnect = false;
    this.pendingCooling = false;
  }

  set loopWaitTime(waittime) {
    this._loopWaitTime = waittime;
    this.port.loopWaitTime = waittime;
  }

  // callback is of form fn(observedState,desiredState)
  setCallback(callee, callback) {
    this.callee = callee;
    this.callback = callback;
  }

  getDesiredState(state) {
    return Object.assign(new State(),this.desiredState);
  }

  setDesiredState(state) {
    this.desiredState = state;
  }

  getObservedState() {
    return Object.assign(new State(),this.observedState);
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

    this.pid.setInput(this.observedState.temp==-1?150:this.observedState.temp);
    if( this.desiredState.controlMode == State.constants.controlMode.PID ) {
      this.pid.setMode('auto');
      this.pid.setPoint(this.desiredState.temp);
      this.pid.compute();
      this.desiredState.heatSetting = this.determineHeatSetting(this.desiredState.temp,this.pid.getOutput());
    } else {
      this.pid.setMode('manual');
    }

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

  determineHeatSetting(targetTemp,pidOutputTemp) {
    let heatSetting=0;

    if(targetTemp >= 460) {
      if(pidOutputTemp >= 30) {
          heatSetting = 3
      } else {
          if(heatSetting == 2) {
              heatSetting = 3
          } else {
              heatSetting = 2
          }
      }
    } else if(targetTemp >= 430) {
        if(pidOutputTemp >= 30) {
            heatSetting = 3
        } else if(pidOutputTemp >= 20) {
            heatSetting = 2
        } else {
            if(heatSetting == 1) {
                heatSetting = 2
            } else {
                heatSetting = 1
            }
        }
    } else if(targetTemp >= 350) {
        if(pidOutputTemp >= 30) {
            heatSetting = 3
        } else if(pidOutputTemp >= 20) {
            heatSetting = 2
        } else if(pidOutputTemp >= 10) {
            heatSetting = 1
        } else {
            if(heatSetting == 0) {
                heatSetting = 1
            } else {
                heatSetting = 0
            }
        }
    } else {
        if(pidOutputTemp >= 30) {
            heatSetting = 3
        } else if(pidOutputTemp >= 20) {
            heatSetting = 2
        } else if(pidOutputTemp >= 10) {
          heatSetting = 1
      } else {
          heatSetting = 0
      }
    }

    return heatSetting;
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

function instantiatePid(waitTime, P, I, D) {
  let pid = new PIDController(0,0,0,0,0,PIDController.DIRECT);
  pid.setSampleTime(waitTime);
  pid.setTunings(P,I,D);
  pid.setOutputLimits(0,500);

  return pid;
}

module.exports = Driver;
