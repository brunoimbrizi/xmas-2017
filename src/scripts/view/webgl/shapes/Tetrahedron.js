import * as THREE from 'three';
import TweenMax from 'gsap';

import { MeshLine, MeshLineMaterial } from './../../../../vendors/THREE.MeshLine.js';

import AppState from './../../../state/AppState';
import InteractiveObject from './../interactive/InteractiveObject';

const glslify = require('glslify');

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
		this.initOutline();

		this.gotoFace(0, 0, true);
	}

	initMesh() {
		// const geometry = new THREE.ConeBufferGeometry(this.width, this.height, 3);
		const geometry = new THREE.TetrahedronGeometry(this.rc);
		// const geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.width);

		const material = new THREE.MeshBasicMaterial();

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

	initOutline() {
		const geometry = new THREE.Geometry();

		geometry.vertices.push(new THREE.Vector3(0, this.height * 0.5));
		geometry.vertices.push(new THREE.Vector3(this.width * 0.5, -this.height * 0.5));
		geometry.vertices.push(new THREE.Vector3(-this.width * 0.5, -this.height * 0.5));
		geometry.vertices.push(new THREE.Vector3(0, this.height * 0.5));

		/*
		const line = new MeshLine();
		line.setGeometry(geometry);

		const material = new MeshLineMaterial({
			resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
			lineWidth: 1,
			sizeAttenuation: true,
			color: new THREE.Color(0x333333),
		});
		
		this.outline = new THREE.Mesh(line.geometry, material);
		*/
		
		const material = new THREE.LineBasicMaterial({
			color: 0x333333,
			linewidth: 1,
			transparent: true,
			opacity: 0.5,
			// blending: THREE.AdditiveBlending,
		});

		this.outline = new THREE.Line(geometry, material);
		
		
		this.outline.visible = false;
		this.object3D.add(this.outline);

		// offset
		this.outline.position.z = this.height * 0.5;
	}

	resetColors() {
		const geometry = this.mesh.geometry;

		for (let i = 0; i < geometry.faces.length; i++) {
			const face = geometry.faces[i];
			face.color.copy(this.colors[i]);
		}

		geometry.colorsNeedUpdate = true;
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	show(delay) {
		const fromColor = 0x000000;
		const origColor = this.mesh.geometry.faces[2].color.getHex();

		// currFace 1 is geometry.face 2 and vice-versa
		this.mesh.geometry.faces[2].color.setHex(fromColor);
		this.mesh.geometry.colorsNeedUpdate = true;

		this.gotoFace(1, 0, true);
		this.gotoFace(0, delay);

		this.mesh.visible = true;

		this.mesh.material.opacity = 0;
		TweenMax.to(this.mesh.material, 0.5, { opacity: 1, delay, onComplete: () => {
			// this.mesh.material.transparent = false;
			this.mesh.geometry.faces[2].color.setHex(origColor);
			this.mesh.geometry.colorsNeedUpdate = true;
			this.enabled = true;
		} });
	}

	hide(delay = 0, immediate = false) {
		this.enabled = false;
		this.mesh.material.transparent = true;

		if (immediate) {
			this.mesh.material.opacity = 0;
			this.mesh.visible = false;
			return;
		}

		TweenMax.to(this.mesh.material, 0.5, { opacity: 0, delay, ease: Quart.easeOut, onComplete: () => {
			this.mesh.visible = false;
		} });
	}

	gotoFace(index, delay = 0, immediate = false) {
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
		if (!this.enabled) return;
		this.isOver = true;

		this.gotoFace(this.currFace + 1);

		switch (AppState.state.index) {
			default:
			case 0: {
				TweenMax.to(this.mesh.position, 0.5, { z: this.offset.z + 10, ease: Quart.easeOut });
				break;
			}
			case 1: {
				TweenMax.to(this.mesh.scale, 0.5, { x: 0.6, y: 0.6, z: 0.6, ease: Quart.easeOut, onStart: () => {
					this.mesh.material.visible = true;
				} });
				break;
			}
		}

		this.emit('tetrahedron:over', { target: this });
	}

	out() {
		if (!this.enabled) return;
		this.isOver = false;

		switch (AppState.state.index) {
			default:
			case 0: {
				TweenMax.to(this.mesh.position, 0.5, { z: this.offset.z + 0, ease: Quart.easeOut });
				break;
			}
			case 1: {
				TweenMax.to(this.mesh.scale, 0.5, { x: 1.0, y: 1.0, z: 1.0, ease: Quart.easeOut, onComplete: () => {
					this.mesh.material.visible = false;
				} });
				break;
			}
		}

		this.emit('tetrahedron:out', { target: this });
	}

	down() {
		if (!this.enabled) return;
		this.emit('tetrahedron:down', { target: this });
	}

	up() {
		if (!this.enabled) return;
		this.emit('tetrahedron:up', { target: this });
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	onStateChange(e) {
		// console.log('Tetrahedron.onStateChange', e);

		// reset position and size
		TweenMax.killTweensOf(this.mesh.position);
		TweenMax.killTweensOf(this.mesh.scale);
		this.mesh.position.z = this.offset.z;
		this.mesh.scale.set(1, 1, 1);
		this.mesh.material.visible = true;
		this.outline.visible = false;

		switch (e.state.index) {
			default:
			case 0: {
				this.colors = [];
				this.colors.push(new THREE.Color(0x52daab));
				this.colors.push(new THREE.Color(0xfef7ca));
				this.colors.push(new THREE.Color(0xfc8781));
				this.colors.push(new THREE.Color(0x90bda0));
				this.resetColors();

				this.mesh.material = new THREE.MeshLambertMaterial({
					color: 0xFFFFFF,
					vertexColors: THREE.FaceColors,
					transparent: true,
				});
				break;
			}
			case 1: {
				this.colors = [];
				this.colors.push(new THREE.Color(0x0A3704));
				this.colors.push(new THREE.Color(0x5C8E3C));
				this.colors.push(new THREE.Color(0x43B828));
				this.colors.push(new THREE.Color(0xFC0E1D));
				// this.colors.push(new THREE.Color(0xDC0A17));
				// this.colors.push(new THREE.Color(0x980E13));

				// this.colors.push(new THREE.Color(0x84C37D));
				// this.colors.push(new THREE.Color(0x487F46));
				// this.colors.push(new THREE.Color(0xFA2F4D));
				// this.colors.push(new THREE.Color(0xEBF2BD));
				this.resetColors();

				this.mesh.material = new THREE.MeshLambertMaterial({
					color: 0xFFFFFF,
					vertexColors: THREE.FaceColors,
					transparent: true,
				});

				// delayed hide
				TweenMax.to(this.mesh.scale, 0.6, { x: 0.6, y: 0.6, z: 0.6, delay: this.data.index * 0.01, ease: Quart.easeInOut, onComplete: () => {
					this.mesh.material.visible = false;
				} });

				this.outline.visible = true;
				break;
			}
			case 2: {
				this.colors = [];
				this.colors.push(new THREE.Color(0xAC1015));
				this.colors.push(new THREE.Color(0xB3B173));
				this.colors.push(new THREE.Color(0x7A7937));
				this.colors.push(new THREE.Color(0x595C2E));
				this.resetColors();

				this.mesh.material = new THREE.MeshLambertMaterial({
					color: 0xFFFFFF,
					vertexColors: THREE.FaceColors,
					transparent: true,
				});
				break;
			}
			case 2: {
				this.mesh.material = new THREE.ShaderMaterial({
					uniforms: {
						c: { value: 1.4 },
						p: { value: 2.4 },
						color: { value: new THREE.Color(0x0ee7e6) },
					},
					vertexShader: glslify('../../../../shaders/glow.vert'),
					fragmentShader: glslify('../../../../shaders/glow.frag'),
					// side: THREE.BackSide,
					blending: THREE.AdditiveBlending,
					transparent: true,
				});
				break;
			}
		}
	}
}
