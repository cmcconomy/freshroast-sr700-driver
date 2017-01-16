"use strict";

const SR700Packet = require('./sr700packet.js');

// can be used to represent current state, or desired state
class SR700State {
  constructor() {
    this.fanSpeed = 0;
    this.heatSetting = SR700State.constants.heatSetting.OFF;
    this.temp = 0;
    this.action = SR700State.constants.action.IDLE;
    this.controlMode = SR700State.constants.controlMode.DIRECT;
  }

  toPacket() {
    let sendPacket = new SR700Packet();
    sendPacket.state = actionToHex(this.action);
    sendPacket.fanSpeed = decToHex(this.fanSpeed,2);
    switch (this.controlMode) {
      case SR700State.constants.controlMode.DIRECT:
        sendPacket.heatSetting = decToHex(this.heatSetting,2);
        break;
      case SR700State.constants.controlMode.PID:
        // call PID here to set heat setting
        break;
    }

    return sendPacket;
  }

  static fromPacket(receivePacket) {
    this.temp = tempToFahrenheit(receivePacket.temp);
    this.fanSpeed = hexToDec(receivePacket.fanSpeed);
    this.action = hexToAction(receivePacket.state);
    this.heatSetting = hexToDec(receivePacket.heatSetting);
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
    case SR700State.constants.action.IDLE:
      hex = SR700Packet.constants.state.IDLE;
      break;
    case SR700State.constants.action.ROASTING:
      hex = SR700Packet.constants.state.ROASTING;
      break;
    case SR700State.constants.action.COOLING:
      hex = SR700Packet.constants.state.COOLING;
      break;
    case SR700State.constants.action.SLEEPING:
      hex = SR700Packet.constants.state.SLEEPING;
      break;
  }

  return hex;
}

function hexToAction(packetState) {
  let action = null;
  switch(packetState) {
    case SR700Packet.constants.state.IDLE:
      action = SR700State.constants.action.IDLE;
      break;
    case SR700Packet.constants.state.ROASTING:
      action = SR700State.constants.action.ROASTING;
      break;
    case SR700Packet.constants.state.COOLING:
      action = SR700State.constants.action.COOLING;
      break;
    case SR700Packet.constants.state.SLEEPING:
      action = SR700State.constants.action.SLEEPING;
      break;
  }

  return action;
}

SR700State.constants = {
  controlMode: {DIRECT:0, PID:1}, // DIRECT: Control temperature LOW/MED/HIGH directly, PID: PID controller will control heater to achieve target temperature.
  heatSetting: {OFF:0, LOW:1, MEDIUM:2, HIGH:3}, // ignored in PID mode
  action: {IDLE:0, ROASTING:1, COOLING:2, SLEEPING:3},
}
module.exports = SR700State;
