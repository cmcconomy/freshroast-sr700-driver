"use strict";

const Packet = require('./packet.js');

// can be used to represent current state, or desired state
class State {
  constructor() {
    this.fanSpeed = 0;
    this.heatSetting = State.constants.heatSetting.OFF;
    this.temp = 0;
    this.action = State.constants.action.IDLE;
    this.controlMode = State.constants.controlMode.DIRECT;
  }

  toPacket() {
    let sendPacket = new Packet();
    sendPacket.state = actionToHex(this.action);
    sendPacket.fanSpeed = decToHex(this.fanSpeed,2);
    switch (this.controlMode) {
      case State.constants.controlMode.DIRECT:
        sendPacket.heatSetting = decToHex(this.heatSetting,2);
        break;
      case State.constants.controlMode.PID:
        // call PID here to set heat setting
        break;
    }

    return sendPacket;
  }

  static fromPacket(receivePacket) {
    let state = new State();
    state.temp = tempToFahrenheit(receivePacket.temp);
    state.fanSpeed = hexToDec(receivePacket.fanSpeed);
    state.action = hexToAction(receivePacket.state);
    state.heatSetting = hexToDec(receivePacket.heatSetting);

    return state;
  }
}

function decToHex(decimal, digits) {
  let hex = Number(decimal).toString(16);
  while(hex.length < digits) { hex = '0'+hex; };
  return hex;
}

function hexToDec(hex) {
  return parseInt(hex,16);
}

function tempToHex(fahrTemp) {
  fahrTemp = fahrTemp<=500?fahrTemp:500;
  let hexTemp = decToHex(fahrTemp,2);
  return hexTemp;
}
  
function tempToFahrenheit(hexTemp) {
  let fahrTemp = hexToDec(hexTemp);
  if( fahrTemp == 65280 ) {
    fahrTemp = -1; // "LOW" setting (<150F) on temp sensor
  }

  return fahrTemp;
}

function actionToHex(stateAction) {
  let hex = null;
  switch(stateAction) {
    case State.constants.action.IDLE:
      hex = Packet.constants.state.IDLE;
      break;
    case State.constants.action.ROASTING:
      hex = Packet.constants.state.ROASTING;
      break;
    case State.constants.action.COOLING:
      hex = Packet.constants.state.COOLING;
      break;
    case State.constants.action.SLEEPING:
      hex = Packet.constants.state.SLEEPING;
      break;
  }

  return hex;
}

function hexToAction(packetState) {
  let action = null;
  switch(packetState) {
    case Packet.constants.state.IDLE:
      action = State.constants.action.IDLE;
      break;
    case Packet.constants.state.ROASTING:
      action = State.constants.action.ROASTING;
      break;
    case Packet.constants.state.COOLING:
      action = State.constants.action.COOLING;
      break;
    case Packet.constants.state.SLEEPING:
      action = State.constants.action.SLEEPING;
      break;
  }

  return action;
}

State.constants = {
  controlMode: {DIRECT:0, PID:1}, // DIRECT: Control temperature LOW/MED/HIGH directly, PID: PID controller will control heater to achieve target temperature.
  heatSetting: {OFF:0, LOW:1, MEDIUM:2, HIGH:3}, // ignored in PID mode
  action: {IDLE:0, ROASTING:1, COOLING:2, SLEEPING:3},
}
module.exports = State;
