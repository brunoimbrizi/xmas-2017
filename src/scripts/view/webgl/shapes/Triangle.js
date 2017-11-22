import * as THREE from 'three';

import Tetrahedron from './Tetrahedron';

export default class Triangle {

	constructor() {
		this.object3D = new THREE.Object3D;

		this.initTriangle();
		// this.initThetahedra();
	}

	initTriangle() {
		const rows = 3;

		let index = 0;
		let str = '';

		// Floyd's triangle
		for (let i = 1; i <= rows; i++) {
			for (let j = 1; j <= i; ++j) {
				const row = i - 1;
				str = `${str}${index}`;
				++index;
			}
			str = `${str}\n`;
		}

		console.log(str);
	}

	initThetahedra() {
		this.tetrahedra = [];

		for (let i = 0; i < 10; i++) {
			const tetrahedron = new Tetrahedron();
			this.object3D.add(tetrahedron.object3D);
			this.tetrahedra.push(tetrahedron);
		}
	}
}
