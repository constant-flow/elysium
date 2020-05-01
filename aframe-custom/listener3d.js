// This requires AudioListener attached to the window context
// window[this.data.listenerNodeName] != undefined
// https://developer.mozilla.org/en-US/docs/Web/API/AudioListener

AFRAME.registerComponent("listener3d", {
  schema: {
    listenerNodeName: { default: "audioListenerNode" }
  },
  init() {
    this.active = true;
    if (!window[this.data.listenerNodeName]) {
      this.active = false;
      console.warn(
        "Listener3d: no AudioListener present called ",
        this.data.listenerNodeName
      );
    }
  },
  tick() {
    if (!this.active) return;
    let pos = this.el.getAttribute("position");
    window[this.data.listenerNodeName].setPosition(pos.x, pos.y, pos.z);

    let rot = this.el.getAttribute("rotation");
    let fwdX = -Math.sin((rot.y / 180) * Math.PI);
    let fwdZ = -Math.cos((rot.y / 180) * Math.PI);
    window[this.data.listenerNodeName].setOrientation(fwdX, 0, fwdZ, 0, 1, 0);
  }
});
