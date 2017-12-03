import * as THREE from 'three';

export default class SkyBox {

  constructor() {
    this.radius = 1000;

    this.initMesh();
  }

  initMesh() {
    // const texture = new THREE.Texture('');
    // texture.needsUpdate = true;

    const geometry = new THREE.SphereGeometry(this.radius);
    const material = new THREE.MeshBasicMaterial({
      color: 0x1d1b21,
      // wireframe: true,
      // map: texture,
      side: THREE.BackSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.object3D = mesh;
  }
}
