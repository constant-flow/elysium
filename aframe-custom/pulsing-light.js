AFRAME.registerComponent("pulsing-light", {
  schema: {
    phase: { type: "number" },
    speed: { type: "number" }
  },
  tick(time) {
    this.el.setAttribute("light", {
      intensity: Math.sin(
        (time / 1000) * Math.PI * this.data.speed + this.data.phase
      )
    });
  }
});
