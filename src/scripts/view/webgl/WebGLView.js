const glslify = require('glslify');
import * as THREE from 'three';
import TrackballControls from 'three-trackballcontrols';
// import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { EffectComposer, FilmPass, ShaderPass, RenderPass } from 'postprocessing';

import InteractiveWebGL from './interactive/InteractiveWebGL';
import Triangle from './shapes/Triangle';
import SkyBox from './sky/SkyBox';
import FilmicPass from './passes/FilmicPass';
import FilmicMaterial from './materials/FilmicMaterial';

export default class WebGLView {

	constructor(view) {
		this.view = view;
		this.renderer = this.view.renderer;

		this.initThree();
		this.initControls();
		this.initInteractive();
		// this.initObject();
		this.initTriangle();
		this.initSky();
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

	initInteractive() {
		this.interactive = new InteractiveWebGL(this);
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
		this.triangle = new Triangle(this.interactive);
		this.scene.add(this.triangle.object3D);
	}

	initSky() {
		this.sky = new SkyBox();
		this.scene.add(this.sky.object3D);
	}

	initLights() {
		const lightA = new THREE.DirectionalLight(0xFFFFFF, 1);
		lightA.position.set(1, -0.5, 1);
		this.scene.add(lightA);
	}

	initPostProcessing() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));

		/*
		const pass = new FilmicPass({
			// grayscale: false,
			vignette: true,
			// eskil: false,
			vignetteOffset: 0.0,
			vignetteDarkness: 0.5,
			noiseIntensity: 0.1,
			scanlineIntensity: 0.1,
		});
		*/
		this.filmicMaterial = new FilmicMaterial({
			vignetteOffset: 0.0,
		});

		const pass = new ShaderPass(this.filmicMaterial);
		pass.renderToScreen = true;
		this.composer.addPass(pass);

		this.clock = new THREE.Clock();
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		this.controls.update();
		this.filmicMaterial.update(this.clock.getDelta());

		this.triangle.update();
	}

	draw() {
		if (this.view.ui.postEnabled) this.composer.render(this.clock.getDelta());
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

		this.filmicMaterial.resize();

		this.renderer.setSize(this.view.sketch.width, this.view.sketch.height);
		this.composer.setSize(this.view.sketch.width, this.view.sketch.height);
	}

	touchstart(touch) {
		this.interactive.touchstart(touch);
	}

	touchmove(touch) {
		this.interactive.touchmove(touch);
	}

	touchend() {
		this.interactive.touchend();
	}
}
