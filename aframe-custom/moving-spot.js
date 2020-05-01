AFRAME.registerComponent("moving-spot", {
  schema: {
    color: { type: "color", default: "#ffff00" },
    power: { type: "number", default: 10 },
    swingAngleX: { type: "number", default: 45 },
    swingAngleY: { type: "number", default: 45 },
    xSwingPeriod: { type: "number", default: 3 },
    ySwingPeriod: { type: "number", default: 3 },
    coneAngle: { type: "number", default: 25 },
    speed: { type: "number", default: 1 }
  },

  init: function() {
    var data = this.data;
    var el = this.el;

    let x = el.object3D.position.x;
    let y = el.object3D.position.y;
    let z = el.object3D.position.z;

    // Create geometry.
    this.geometry = new THREE.CylinderBufferGeometry(0.15, 0.15, 0.5, 32);

    // Create material.
    this.material = new THREE.MeshStandardMaterial({
      color: data.color
    });

    // Create mesh.
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.spotLight = new THREE.SpotLight(data.color);

    this.spotLight.penumbra = 0.1;
    this.spotLight.distance = 30;
    this.spotLight.angle = THREE.Math.degToRad(this.data.coneAngle);
    this.spotLight.castShadow = true;

    this.target = this.spotLight.target;

    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.add(this.target);

    // Set mesh on entity.
    el.setObject3D("mesh", this.group);
    el.setObject3D("light", this.spotLight);
  },
  tick: function(time, timeDelta) {
    let data = this.data;
    this.spotLight.power = this.data.power;

    this.el.object3D.rotation.x = THREE.Math.degToRad(
      Math.sin(((time / 1000) * data.speed * Math.PI) / data.xSwingPeriod) *
        data.swingAngleX
    );
    this.el.object3D.rotation.z = THREE.Math.degToRad(
      Math.cos(((time / 1000) * data.speed * Math.PI) / data.ySwingPeriod) *
        data.swingAngleY
    );

    this.spotLight.target.position.set(0, 2, 0);
  }
});
