// Make sure you have a 'soundAnalyserNode' present in your window context
// (window.soundAnalyserNode != undefined)
//
// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

function mix(oldValue, newValue, oldKeepFactor) {
  return oldValue * oldKeepFactor + newValue * (1 - oldKeepFactor);
}

AFRAME.registerComponent("sound-reactive-light", {
  schema: {
    colorBass: { default: "#ff0000", type: "color" },
    colorMid: { default: "#1000ff", type: "color" },
    colorHigh: { default: "#ffffff", type: "color" },
    analyzerNodeName: { default: "soundAnalyserNode" }
  },
  init() {
    this.active = true;
    if (!window[this.data.analyzerNodeName]) {
      console.warn(
        "No 'AnalyserNode':" +
          [this.data.analyzerNodeName] +
          " found in window context. No reactive light possible."
      );
      this.active = false;
      return;
    }

    const bufferLength = window[this.data.analyzerNodeName].frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    // bass component of sound
    this.bassValue = 0.5;
    this.bassSmoothing = 0.2;

    // adaptive threshold of bass
    this.bassThresValue = 0.8;
    this.bassThresSmoothing = 0.92;

    // difference between bass value and the smoothed threshold to overcome
    this.threshold = 0.03;

    // smoothed light output intensity
    this.lightIntensity = 0;
    this.lightIntensitySmoothing = 0.9;

    this.color = new window.THREE.Color();
    this.colorBass = new window.THREE.Color(this.data.colorBass);
    this.colorMid = new window.THREE.Color(this.data.colorMid);
    this.colorHigh = new window.THREE.Color(this.data.colorHigh);
    this.colorId = 0;
    this.colorTargetId = 0;
    this.colorSmoothing = 0.99;
  },

  tick() {
    if (!this.active) return;
    window[this.data.analyzerNodeName].getByteFrequencyData(this.dataArray);

    const bassValue = this.dataArray[4] / 255.0;

    this.bassValue = mix(this.bassValue, bassValue, this.bassSmoothing);
    this.bassThresValue = mix(
      this.bassThresValue,
      bassValue,
      this.bassThresSmoothing
    );

    let newLightValue = 0;
    const diff = this.bassValue - this.bassThresValue;
    if (diff > this.threshold) newLightValue = 1;

    this.lightIntensity = mix(
      this.lightIntensity,
      newLightValue,
      this.lightIntensitySmoothing
    );

    let base = this.dataArray[2] + this.dataArray[4];
    let mid = (this.dataArray[6] + this.dataArray[7] + this.dataArray[8]) / 2;
    let high = this.dataArray[10] + this.dataArray[11] + this.dataArray[12];

    function colorLerp(colorA, colorB, ratio) {
      let A = new window.THREE.Color(colorA);
      let B = new window.THREE.Color(colorB);
      return A.multiplyScalar(1 - ratio).add(B.multiplyScalar(ratio));
    }

    if (base > mid && base > high) this.colorTargetId = 0;
    else if (mid > high && mid > base) this.colorTargetId = 1;
    else this.colorTargetId = 2;

    this.colorId = mix(this.colorId, this.colorTargetId, this.colorSmoothing);

    if (this.colorId < 1) {
      this.color.set(colorLerp(this.colorBass, this.colorMid, this.colorId));
    } else {
      this.color.set(
        colorLerp(this.colorMid, this.colorHigh, this.colorId - 1)
      );
    }

    this.el.setAttribute("light", { intensity: this.lightIntensity * 1.1 });
    this.el.setAttribute("light", { color: "#" + this.color.getHexString() });
  }
});
