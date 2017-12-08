import * as THREE from 'three';

import AppState from './../../../state/AppState';

export default class SkyBox {

	constructor() {
		this.radius = 1000;

		this.initMesh();

		AppState.on('state:change', this.onStateChange.bind(this));
	}

	initMesh() {
		// const texture = new THREE.Texture('');
		// texture.needsUpdate = true;

		const geometry = new THREE.SphereGeometry(this.radius);
		const material = new THREE.MeshBasicMaterial({
			color: 0x1d1b21,
			// color: 0xE9EAEC,
			// wireframe: true,
			// map: texture,
			side: THREE.BackSide,
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.object3D = mesh;
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	onStateChange(e) {
		switch (e.state.index) {
			default:
			case 0: {
				this.object3D.material.color.setHex(0x1d1b21);
				break;
			}
			case 1: {
				this.object3D.material.color.setHex(0xE9EAEC);
				break;
			}
		}
	}
}
