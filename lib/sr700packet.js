"use strict";

// All details pulled from https://github.com/Roastero/freshroastsr700/blob/master/docs/communication_protocol.rst
// packets are all 14 bytes long, made up of 9 fields:
// header(2) tempUnit(2) flag(1) state(2) fanSpeed(1) timeRemaining(1) heatSetting(1) currTemp(2) footer(2)

let constants = {
  header: { INIT:"AA55", DEFAULT:"AAAA" },
  tempUnit: {FAHRENHEIT:"6174"},
  flag: {SENT_BY_COMPUTER:"63", SENT_BY_ROASTER:"00", CURR_MANUAL_ROASTER_SETTING:"A0", NON_FINAL_RECIPE_LINE:"AA", FINAL_RECIPE_LINE:"AF"},
  state: {IDLE:"0201", ROASTING:"0402", COOLING:"0404", SLEEPING:"0801", BLANK:"0000"},
  fanSpeed: {MIN:"01", MAX:"09", BLANK:"00"},
  timeRemaining: {BLANK:"00"},
  heatSetting: {COOL:"00", LOW:"01", MEDIUM:"02", HIGH:"03", BLANK:"00"},
  currTemp: {BLANK:"0000"},
  footer: {DEFAULT:"AAFA"}
}
Object.freeze(constants);

// define the packet class here
function SR700Packet () {
  this.header = constants.header.INIT,
  this.tempUnit = constants.tempUnit.FAHRENHEIT,
  this.flag = constants.flag.SENT_BY_COMPUTER,
  this.state = constants.state.BLANK,
  this.fanSpeed = constants.fanSpeed.BLANK,
  this.timeRemaining = constants.timeRemaining.BLANK,
  this.heatSetting = constants.heatSetting.BLANK,
  this.currTemp = constants.currTemp.BLANK,
  this.footer = constants.footer.DEFAULT
}

function toBytes() {
  let packetHex = this.header+this.tempUnit+this.flag+this.state+this.fanSpeed+this.timeRemaining+this.heatSetting+this.currTemp+this.footer;
  if( packetHex.length != 28 ) {throw "Invalid hex input for packet construction: " + packetHex + " (should be 14 bytes)" }
  return Buffer.from(packetHex, 'hex');
}

SR700Packet.prototype.constants = constants;
SR700Packet.prototype.toBytes = toBytes;
module.exports = SR700Packet;
