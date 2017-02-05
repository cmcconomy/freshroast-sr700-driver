"use strict";

class Step {
  constructor(time,targetTemp,fanSpeed,heatSetting) {
    this.time = time; // seconds
    this.targetTemp = targetTime;
    this.fanSpeed = fanSpeed;
    this.heatSetting = heatSetting;
}

class Recipe {

  constructor() {
    this.steps = [];
  }

  addStep(step) {
    if (step instanceof Step){
      steps.push(step);
    } else {
      throw "Can only add 'Step' type objects to Recipe"
    }
  }
}

module.exports = Recipe;
