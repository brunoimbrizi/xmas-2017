import * as THREE from 'three';
import EventEmitter from 'events';

import Tetrahedron from './Tetrahedron';

import AppState from './../../../state/AppState';
import { isTouch } from './../../../utils/device.utils';

export default class Triangle extends EventEmitter {

	constructor(interactive, audio) {
		super();

		this.interactive = interactive;
		this.audio = audio;

		this.clickThreshold = 200;

		this.object3D = new THREE.Object3D;

		this.initData();
		this.initThetahedra();
		this.mapNotes();

		this.hide(true);

		AppState.on('state:change', this.onStateChange.bind(this));
	}

	initData() {
		this.data = [];

		const rows = 7;
		const cols = rows * 2 - 1;
		const mRow = (rows / 2) - 0.5;

		let col, row = 0;
		let index = 0;
		let str = '\n   ';
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
			str = `${str}\n   `;
		}
		str = `${str}\n`;

		console.log(str);
		// console.log(this.data);

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

	mapNotes() {
		this.noteMap = new Map();
		// this.noteMap.set('E3', this.tetrahedra[0]);
		// this.noteMap.set('C#3', this.tetrahedra[2]);

		this.noteMap.set('E5', this.tetrahedra[4]);
		this.noteMap.set('F5', this.tetrahedra[8]);
		this.noteMap.set('C#4', this.tetrahedra[20]);

		this.noteMap.set('G#4', this.tetrahedra[10]);
		this.noteMap.set('F#4', this.tetrahedra[5]);
		this.noteMap.set('E4', this.tetrahedra[12]);
		this.noteMap.set('B4', this.tetrahedra[7]);
		this.noteMap.set('C5', this.tetrahedra[14]);

		this.noteMap.set('E4-0', this.tetrahedra[25]);
		this.noteMap.set('E4-1', this.tetrahedra[26]);
		this.noteMap.set('E4-2', this.tetrahedra[27]);
		this.noteMap.set('E4-3', this.tetrahedra[28]);
		this.noteMap.set('E4-4', this.tetrahedra[30]);
		this.noteMap.set('E4-5', this.tetrahedra[31]);
		this.noteMap.set('E4-6', this.tetrahedra[32]);
		this.noteMap.set('E4-7', this.tetrahedra[33]);
		this.noteMap.set('E4-8', this.tetrahedra[34]);
		this.noteMap.set('E4-9', this.tetrahedra[35]);

		this.noteMap.set('D#4-0', this.tetrahedra[11]);
		this.noteMap.set('D#4-1', this.tetrahedra[12]);
		this.noteMap.set('D#4-2', this.tetrahedra[13]);
		this.noteMap.set('D#4-3', this.tetrahedra[14]);

		this.noteMap.set('C#4-0', this.tetrahedra[17]);
		this.noteMap.set('C#4-1', this.tetrahedra[17]);
		this.noteMap.set('C#4-2', this.tetrahedra[19]);
		this.noteMap.set('C#4-3', this.tetrahedra[20]);
		this.noteMap.set('C#4-4', this.tetrahedra[21]);
		this.noteMap.set('C#4-5', this.tetrahedra[22]);

		this.noteMap.set('C4-0', this.tetrahedra[4]);
		this.noteMap.set('C4-1', this.tetrahedra[5]);
		this.noteMap.set('C4-2', this.tetrahedra[6]);
		this.noteMap.set('C4-3', this.tetrahedra[7]);
		this.noteMap.set('C4-4', this.tetrahedra[8]);

		this.noteMap.set('G#3', this.tetrahedra[42]);

		this.noteMap.set('B2', this.tetrahedra[36]);

		const outerIndices = [0, 1, 2, 3, 4, 5, 9, 10, 16, 17, 25, 26, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 7, 8, 14, 15, 23, 24, 34, 35];
		const outer = [];
		for (let i = 0; i < outerIndices.length; i++) {
			outer.push(this.tetrahedra[outerIndices[i]]);
		}
		this.noteMap.set('outer', outer);

		const inner = [];
		for (let i = 0; i < this.tetrahedra.length; i++) {
			let hit = false;
			for (let j = 0; j < outerIndices.length; j++) {
				if (i == outerIndices[j]) {
					hit = true;
					break;
				}
			}
			if (!hit) inner.push(this.tetrahedra[i]);
		}
		this.noteMap.set('inner', inner);
	}

	noteOn(note, isPercussion) {
		let name = note.name;
		const duration = max(note.duration, 0.4);

		if (isPercussion) {
			if (name == 'E4') {
				if (!this.e4count || this.e4count >= 10) this.e4count = 0;
				name = `${name}-${this.e4count}`
				this.e4count++;
			}

			if (name == 'D#4') {
				if (!this.ds4count || this.ds4count >= 4) this.ds4count = 0;
				name = `${name}-${this.ds4count}`
				this.ds4count++;
			}

			if (name == 'C#4') {
				if (!this.cs4count || this.cs4count >= 6) this.cs4count = 0;
				name = `${name}-${this.cs4count}`
				this.cs4count++;
			}

			if (name == 'C4') {
				if (!this.c4count || this.c4count >= 5) this.c4count = 0;
				name = `${name}-${this.c4count}`
				this.c4count++;
			}
		}

		if (name == 'E3') {
			const group = this.noteMap.get('outer');
			for (let i = 0; i < group.length; i++) {
				group[i].gotoFace(group[i].currFace + 1, 0, false, duration);
			}
		}

		if (name == 'C#3') {
			const group = this.noteMap.get('inner');
			for (let i = 0; i < group.length; i++) {
				group[i].gotoFace(group[i].currFace + 1, 0, false, duration);
			}
		}
		
		const tetrahedron = this.noteMap.get(name);
		if (tetrahedron) tetrahedron.gotoFace(tetrahedron.currFace + 1, 0, false, duration);
	}

	getMiddle() {
		const row = floor(this.rows * 0.5);
		const col = floor(this.cols * 0.5);

		return this.getByRowCol(row, col);
	}

	getByRowCol(row, col) {
		for (let i = 0; i < this.tetrahedra.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			if (tetrahedron.data.row !== row) continue;
			if (tetrahedron.data.col !== col) continue;
			return tetrahedron;
		}
	}

	getAllSameFace() {
		let face = null;
		for (let i = 0; i < this.tetrahedra.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			if (face === null) face = tetrahedron.currFace;
			if (face !== tetrahedron.currFace) return false;
		}

		return true;
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	show() {
		const middle = this.getMiddle();

		for (let i = 0; i < this.tetrahedra.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			if (tetrahedron === middle) continue;

			tetrahedron.show(tetrahedron.data.index * 0.01);
		}
	}

	hide(immediate) {
		const middle = this.getMiddle();

		for (let i = 0; i < this.tetrahedra.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			if (tetrahedron === middle) continue;

			tetrahedron.hide(tetrahedron.data.index * 0.01, immediate);
		}
	}

	update() {
		/*
		for (let i = 0; i < this.tetrahedra.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			tetrahedron.update();
		}
		*/
	}

	gotoFace(index) {
		for (let i = 0; i < this.tetrahedra.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			tetrahedron.gotoFace(index, tetrahedron.data.index * 0.01);
		}
	}

	out() {
		for (let i = 0; i < this.tetrahedra.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			if (tetrahedron.isOver) tetrahedron.out();
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
		if (!this.firstUp) return;
		this.emit('triangle:down', e);

		this.timeDown = Date.now();
	}

	onTetrahedronUp(e) {
		if (!this.firstUp) {
			this.firstUp = true;
			this.show();
			return;
		}

		// on touch devices, only react to click when it is a quick a tap
		// if (isTouch() && Date.now() - this.timeDown > this.clickThreshold) return;

		let next = (e && e.target) ? e.target.currFace : 1;
		if (this.getAllSameFace()) next++;
		
		this.gotoFace(next);

		this.emit('triangle:up', e);
	}

	onStateChange(e) {
		for (let i = 0; i < this.tetrahedra.length; i++) {
			const tetrahedron = this.tetrahedra[i];
			tetrahedron.onStateChange(e);
		}
	}
}
