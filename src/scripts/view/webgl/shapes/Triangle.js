import * as THREE from 'three';

import Tetrahedron from './Tetrahedron';

export default class Triangle {

	constructor() {
		this.object3D = new THREE.Object3D;

		this.initTriangle();
		// this.initThetahedra();
	}

	initTriangle() {
		this.data = [];

		const rows = 2;
		const cols = rows * 2 - 1;

		let col, row = 0;
		let index = 0;
		let str = '\n    ';
		let data;

		for (let i = 1; i < rows * 2; i += 2) {
			row = (i - 1) * 0.5;
			col = rows - i * 0.5;

			for (let k = 0; k < ((rows - 1) - i / 2); k++) {
				str = `${str} `;
			}
			for (let j = 0; j < i; j++) {
				str = `${str}▲`;

				data = {};
				data.row = ~~row;
				data.col = ~~col;
				data.x = col / cols - 0.5;
				data.y = row / (rows - 1) - 1 / (rows + 1);
				data.index = this.data.length;
				this.data.push(data);

				col++;
			}
			str = `${str}\n    `;
		}
		str = `${str}\n`;

		console.log(str);
		console.log(this.data);
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
