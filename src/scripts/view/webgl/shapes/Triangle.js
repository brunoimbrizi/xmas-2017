import * as THREE from 'three';
import EventEmitter from 'events';

import Tetrahedron from './Tetrahedron';

export default class Triangle extends EventEmitter {

	constructor(interactive, audio) {
		super();

		this.interactive = interactive;
		this.audio = audio;

		this.object3D = new THREE.Object3D;

		this.initData();
		this.initThetahedra();
	}

	initData() {
		this.data = [];

		const rows = 7;
		const cols = rows * 2 - 1;
		const mRow = (rows / 2) - 0.5;

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
				data.y = (mRow - row) / rows;

				data.up = true;
				if (row % 2 && !(data.col % 2)) data.up = false;
				else if (!(row % 2) && data.col % 2) data.up = false;

				data.index = this.data.length;
				this.data.push(data);

				col++;
			}
			str = `${str}\n    `;
		}
		str = `${str}\n`;

		console.log(str);
		console.log(this.data);

		this.rows = rows;
		this.cols = cols;

		this.width = Tetrahedron.WIDTH * this.cols * 0.5;
		this.height = Tetrahedron.HEIGHT * this.rows;
	}

	initThetahedra() {
		this.tetrahedra = [];

		for (let i = 0; i < this.data.length; i++) {
			const data = this.data[i];

			const tetrahedron = new Tetrahedron(data);
			tetrahedron.object3D.position.x = data.x * this.width;
			tetrahedron.object3D.position.y = data.y * this.height;

			if (!data.up) tetrahedron.object3D.rotation.z = PI;

			this.object3D.add(tetrahedron.object3D);
			this.tetrahedra.push(tetrahedron);

			this.interactive.interactiveObjects.push(tetrahedron.hitArea);

			tetrahedron.on('tetrahedron:over', this.onTetrahedronOver.bind(this));
			tetrahedron.on('tetrahedron:out', this.onTetrahedronOut.bind(this));
			tetrahedron.on('tetrahedron:down', this.onTetrahedronDown.bind(this));
			tetrahedron.on('tetrahedron:up', this.onTetrahedronUp.bind(this));
		}
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		for (let i = 0; i < this.data.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			tetrahedron.update();
		}
	}

	gotoFace(index) {
		for (let i = 0; i < this.data.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			tetrahedron.gotoFace(index, false, tetrahedron.data.index * 0.01);
		}
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT LISTENERS
	// ---------------------------------------------------------------------------------------------

	onTetrahedronOver(e) {
		const tetrahedron = e.target;

		const notes = ['A3', 'C4', 'G4', 'E4'];
		const note = notes[tetrahedron.currFace];

		this.audio.playNote(note);
	}

	onTetrahedronOut(e) {
		const tetrahedron = e.target;
		this.audio.stopNote('C4');
	}

	onTetrahedronDown(e) {
		this.emit('triangle:down', e);
	}

	onTetrahedronUp(e) {
		this.emit('triangle:up', e);
	}
}
