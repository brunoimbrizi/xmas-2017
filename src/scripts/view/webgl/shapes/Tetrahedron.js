import * as THREE from 'three';
import TweenMax from 'gsap';

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

		this.gotoFace(0, true);
	}

	initMesh() {
		// const geometry = new THREE.ConeBufferGeometry(this.width, this.height, 3);
		const geometry = new THREE.TetrahedronGeometry(this.rc);
		// const geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.width);

		const material = new THREE.MeshLambertMaterial({
			color: 0xFFFFFF,
			vertexColors: THREE.VertexColors,
			// wireframe: true,
			// transparent: true,
			// opacity: 0.5,
		});

		const colors = [];
		colors.push(new THREE.Color(0xFF0000));
		colors.push(new THREE.Color(0x00FF00));
		colors.push(new THREE.Color(0x0000FF));
		colors.push(new THREE.Color(0x00FFFF));

		for (let i = 0; i < geometry.faces.length; i++) {
			const face = geometry.faces[i];
			const color = colors[i];

			for (let j = 0; j < 3; j++) {
				face.vertexColors[j] = color;
			}
		}

		const mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		mesh.position.y = -this.offset.y;
		mesh.position.z = this.offset.z;

		this.mesh = mesh;
		this.object3D.add(mesh);
	}

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

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		// this.object3D.children[0].rotation.x += 0.01;
	}

	gotoFace(index, immediate = false) {
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
			case 4: { 	// same as face 0
				// x = atan(sqrt(2)) - HALF_PI;
				// y = TWO_PI - QUARTER_PI;
				// z = -PI;
				x = atan(sqrt(2)) - HALF_PI;
				y = -QUARTER_PI;
				z = PI;
				break;
			}
			/*
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

		TweenMax.to(this.mesh.rotation, 0.5, { x, y, z, ease: Quad.easeOut });
	}

	// ---------------------------------------------------------------------------------------------
	// INTERACTIVE
	// ---------------------------------------------------------------------------------------------

	over() {
		// console.log('Tetrahedron.over', this.data.index);
		this.gotoFace(this.currFace + 1);
		TweenMax.to(this.object3D.position, 0.5, { z: 5, ease: Quart.easeOut });
	}

	out() {
		// this.gotoFace(this.currFace - 1);
		TweenMax.to(this.object3D.position, 0.5, { z: 0, ease: Quart.easeOut });
	}
}
