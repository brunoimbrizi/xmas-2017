const glslify = require('glslify');
import * as THREE from 'three';
import TrackballControls from 'three-trackballcontrols';
// import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { EffectComposer, FilmPass, GlitchPass, RenderPass } from 'postprocessing';

import Triangle from './shapes/Triangle';

export default class WebGLView {

	constructor(view) {
		this.view = view;
		this.renderer = this.view.renderer;

		this.initThree();
		this.initControls();
		// this.initObject();
		this.initTriangle();
		this.initLights();
		this.initPostProcessing();
	}

	initThree() {
		this.renderer.sortObjects = false;

		// scene
		this.scene = new THREE.Scene();

		// camera
		this.perspCamera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 10, 10000);
		this.perspCamera.position.z = 300;

		// orthographic camera
		this.hw = window.innerWidth * 0.5;
		this.hh = window.innerHeight * 0.5;
		this.orthoCamera = new THREE.OrthographicCamera(-this.hw, this.hw, this.hh, -this.hh, -10000, 10000);
		this.orthoCamera.position.z = 10;

		this.camera = this.perspCamera;
	}

	initControls() {
		this.controls = new TrackballControls(this.camera, this.renderer.domElement);
		this.controls.target.set(0, 0, 0);
		this.controls.rotateSpeed = 2.0;
		this.controls.zoomSpeed = 0.8;
		this.controls.panSpeed = 0.8;
		this.controls.noZoom = false;
		this.controls.noPan = false;
		this.controls.staticMoving = false;
		this.controls.dynamicDampingFactor = 0.15;
		this.controls.maxDistance = 3000;
		this.controls.enabled = true;
	}

	initObject() {
		const geometry = new THREE.BoxGeometry(200, 200, 200);
		// const geometry = new THREE.PlaneGeometry(400, 400, 20, 20);

		const material = new THREE.ShaderMaterial({
			uniforms: {},
			vertexShader: glslify('../../../shaders/default.vert'),
			fragmentShader: glslify('../../../shaders/default.frag'),
			wireframe: true
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.scene.add(mesh);
	}

	initTriangle() {
		this.triangle = new Triangle();
		this.scene.add(this.triangle.object3D);
	}

	initLights() {
		const lightA = new THREE.DirectionalLight(0xFFFFFF, 1);
		lightA.position.set(1, 0.5, 0);
		this.scene.add(lightA);
	}

	initPostProcessing() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));

		const pass = new FilmPass({
			grayscale: true,
		});
		pass.renderToScreen = true;
		this.composer.addPass(pass);

		this.clock = new THREE.Clock();
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		this.controls.update();
	}

	draw() {
		if (this.view.ui.postUse) this.composer.render(this.clock.getDelta());
		else this.renderer.render(this.scene, this.camera);
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	resize() {
		if (!this.renderer) return;
		this.perspCamera.aspect = this.view.sketch.width / this.view.sketch.height;
		this.perspCamera.updateProjectionMatrix();

		// orthographic camera
		this.hw = window.innerWidth * 0.5;
		this.hh = window.innerHeight * 0.5;

		this.orthoCamera.left = -this.hw;
		this.orthoCamera.right = this.hw;
		this.orthoCamera.top = this.hh;
		this.orthoCamera.bottom = -this.hh;
		this.orthoCamera.updateProjectionMatrix();

		this.renderer.setSize(this.view.sketch.width, this.view.sketch.height);
		this.composer.setSize(this.view.sketch.width, this.view.sketch.height);
	}
}
