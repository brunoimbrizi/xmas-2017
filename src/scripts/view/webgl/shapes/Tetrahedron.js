import * as THREE from 'three';
import TweenMax from 'gsap';

import { MeshLine, MeshLineMaterial } from './../../../../vendors/THREE.MeshLine.js';

import TetrahedronFace from './TetrahedronFace';
import InteractiveObject from './../interactive/InteractiveObject';

export default class Tetrahedron extends InteractiveObject {

	static get WIDTH() { return 10; }
	static get HEIGHT() { return (sqrt(3) / 2) * Tetrahedron.WIDTH; }

	constructor(data) {
		super();

		this.data = data;

		this.width = Tetrahedron.WIDTH;
		this.height = Tetrahedron.HEIGHT;
		
		this.rc = sqrt(6) * (Tetrahedron.WIDTH / 4);	// radius of circumsphere
		this.ri = sqrt(6) * (Tetrahedron.WIDTH / 12);	// radius of insphere that is tangent to faces
		this.rm = sqrt(2) * (Tetrahedron.WIDTH / 4);	// radius of midsphere that is tangent to edges
		this.re = sqrt(6) * (Tetrahedron.WIDTH / 6);	// radius of exspheres
		this.de = sqrt(6) * (Tetrahedron.WIDTH / 2);	// distance to exsphere centre from a vertex

		this.tc = sqrt(3) * (Tetrahedron.WIDTH / 6);	// radius of the inscribed circle (equilateral triangle)

		this.offset = new THREE.Vector3();				// offset center inside cube
		this.offset.y = this.height * 0.5 - this.tc;
		this.offset.z = this.height * 0.5 - this.tc;

		this.object3D = new THREE.Object3D();

		this.initMesh();
		// this.initBoundingBox();
		this.initHitArea();
		// this.initOutline();

		this.gotoFace(0, true);
	}

	initMesh() {
		this.faces = [];
		this.faces.push(new TetrahedronFace(this.faces.length, 2, 1, 0));
		this.faces.push(new TetrahedronFace(this.faces.length, 1, 3, 0));
		this.faces.push(new TetrahedronFace(this.faces.length, 0, 3, 2));
		this.faces.push(new TetrahedronFace(this.faces.length, 2, 3, 1));

		const colors = [];
		colors.push(new THREE.Color(0x52daab));
		colors.push(new THREE.Color(0xfc8781));
		colors.push(new THREE.Color(0xfef7ca));
		colors.push(new THREE.Color(0x90bda0));

		this.mesh = new THREE.Object3D();
		for (let i = 0; i < this.faces.length; i++) {
			const face = this.faces[i];
			face.mesh.scale.set(this.rc, this.rc, this.rc);
			face.mesh.material.color.copy(colors[i]);
			this.mesh.add(face.mesh);
		}

		this.mesh.position.y = -this.offset.y;
		this.mesh.position.z = this.offset.z;
		
		this.object3D.add(this.mesh);
	}

	/*
	initMesh() {
		// const geometry = new THREE.ConeBufferGeometry(this.width, this.height, 3);
		const geometry = new THREE.TetrahedronGeometry(this.rc);
		// const geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.width);

		const material = new THREE.MeshLambertMaterial({
			color: 0xFFFFFF,
			vertexColors: THREE.FaceColors,
			// wireframe: true,
			// transparent: true,
			// opacity: 0.5,
		});

		const colors = [];
		colors.push(new THREE.Color(0x52daab));
		colors.push(new THREE.Color(0xfef7ca));
		colors.push(new THREE.Color(0xfc8781));
		colors.push(new THREE.Color(0x90bda0));

		for (let i = 0; i < geometry.faces.length; i++) {
			const face = geometry.faces[i];
			const color = colors[i];
			face.color = color;
		}

		// material.visible = false;

		const mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		mesh.position.y = -this.offset.y;
		mesh.position.z = this.offset.z;

		this.mesh = mesh;
		this.object3D.add(mesh);
	}
	*/

	initBoundingBox() {
		const geometry = new THREE.BoxBufferGeometry(this.height, this.height, this.height);

		const material = new THREE.MeshBasicMaterial({
			color: 0x00FF00,
			wireframe: true,
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.object3D.add(mesh);
	}

	initHitArea() {
		const shape = new THREE.Shape();
		shape.moveTo(0, this.height * 0.5);
		shape.lineTo(this.width * 0.5, -this.height * 0.5);
		shape.lineTo(-this.width * 0.5, -this.height * 0.5);
		shape.lineTo(0, this.height * 0.5);

		const geometry = new THREE.ShapeBufferGeometry(shape);

		const material = new THREE.MeshBasicMaterial({
			color: 0x00FFFF,
			wireframe: true,
			// transparent: true,
			// opacity: 0.5,
		});
		material.visible = false;

		this.hitArea = new THREE.Mesh(geometry, material);
		this.object3D.add(this.hitArea);

		// offset
		this.hitArea.position.z = this.height * 0.5;

		// set interactive target
		this.hitArea.interactive = this;
	}

	initOutline() {
		const geometry = new THREE.Geometry();

		geometry.vertices.push(new THREE.Vector3(0, this.height * 0.5));
		geometry.vertices.push(new THREE.Vector3(this.width * 0.5, -this.height * 0.5));
		geometry.vertices.push(new THREE.Vector3(-this.width * 0.5, -this.height * 0.5));
		geometry.vertices.push(new THREE.Vector3(0, this.height * 0.5));

		const line = new MeshLine();
		line.setGeometry(geometry);

		const material = new MeshLineMaterial({
			resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
			lineWidth: 1,
			sizeAttenuation: true,
		});

		/*
		const material = new THREE.LineBasicMaterial({
			color: 0xFFFFFF,
			linewidth: 10,
		});
		*/

		this.outline = new THREE.Mesh(line.geometry, material);
		this.object3D.add(this.outline);

		// offset
		this.outline.position.z = this.height * 0.5;
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	show() {

	}

	hide() {
		const geometry = this.mesh.geometry;
		const next = (this.currFace < 3) ? this.currFace + 1 : 0;

		const face = this.faces[next];
		face.mesh.material.side = THREE.BackSide;

		this.gotoFace(next);
	}

	gotoFace(index, immediate = false, delay = 0) {
		this.currFace = index;
		
		let x, y, z;

		switch (index) {
			default:
			case 0: {
				x = atan(sqrt(2));
				y = 0;
				z = -QUARTER_PI;
				this.currFace = 0;
				break;
			}
			case 1: {
				x = atan(sqrt(2)) - HALF_PI;
				y = QUARTER_PI;
				z = -HALF_PI;
				break;
			}
			case 2: {
				x = atan(sqrt(2)) - HALF_PI;
				y = PI - QUARTER_PI;
				z = -PI;
				break;
			}
			case 3: {
				x = atan(sqrt(2)) - PI;
				y = 0;
				z = QUARTER_PI;
				break;
			}
			/*
			case 4: { 	// same as face 0
				// x = atan(sqrt(2)) - HALF_PI;
				// y = TWO_PI - QUARTER_PI;
				// z = -PI;
				x = atan(sqrt(2)) - HALF_PI;
				y = -QUARTER_PI;
				z = PI;
				break;
			}
			case 5: { 	// same as face 1
				break;
			}
			case 6: { 	// same as face 2
				break;
			}
			case 7: {	// same as face 3
				x = -QUARTER_PI;
				y = QUARTER_PI - PI;
				z = HALF_PI;
				break;
			}
			*/
		}

		if (immediate) {
			this.mesh.rotation.x = x;
			this.mesh.rotation.y = y;
			this.mesh.rotation.z = z;
			return;
		}

		TweenMax.to(this.mesh.rotation, 0.5, { x, y, z, delay, ease: Quad.easeOut });
	}

	// ---------------------------------------------------------------------------------------------
	// INTERACTIVE
	// ---------------------------------------------------------------------------------------------

	over() {
		// console.log('Tetrahedron.over', this.data.index);
		this.gotoFace(this.currFace + 1);
		TweenMax.to(this.mesh.position, 0.5, { z: this.offset.z + 10, ease: Quart.easeOut, onStart: () => {
			// this.mesh.material.visible = true;
		} });

		this.emit('tetrahedron:over', { target: this });
	}

	out() {
		// this.gotoFace(this.currFace - 1);
		TweenMax.to(this.mesh.position, 0.5, { z: this.offset.z + 0, ease: Quart.easeOut, onComplete: () => {
			// this.mesh.material.visible = false;
		} });

		this.emit('tetrahedron:out', { target: this });
	}

	down() {
		this.emit('tetrahedron:down', { target: this });
	}

	up() {
		this.emit('tetrahedron:up', { target: this });
	}
}
