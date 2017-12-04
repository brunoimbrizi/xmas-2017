import TweenMax from 'gsap';
import * as THREE from 'three';
import TrackballControls from 'three-trackballcontrols';
import { EffectComposer, BloomPass, ShaderPass, RenderPass } from 'postprocessing';

import InteractiveWebGL from './interactive/InteractiveWebGL';
import Triangle from './shapes/Triangle';
import SkyBox from './sky/SkyBox';
import FilmicPass from './passes/FilmicPass';
import FilmicMaterial from './materials/FilmicMaterial';
import Animations from './animations/Animations';

// TODO remove this to save some bytes
import DebugShadow from './lights/DebugShadow';

import { getParam } from './../../utils/query.utils';

const glslify = require('glslify');

export default class WebGLView {

	constructor(view, audio) {
		this.audio = audio;
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
		this.initAnimations();

		this.initDebugShadow();
	}

	initThree() {
		// this.renderer.sortObjects = false;

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		// this.renderer.setPixelRatio(window.devicePixelRatio || 1);

		// scene
		this.scene = new THREE.Scene();

		// camera
		this.perspCamera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 10, 10000);
		this.perspCamera.position.z = 200;

		// orthographic camera
		this.hw = window.innerWidth * 0.5;
		this.hh = window.innerHeight * 0.5;
		this.orthoCamera = new THREE.OrthographicCamera(-this.hw, this.hw, this.hh, -this.hh, -10000, 10000);
		this.orthoCamera.position.z = 10;

		this.camera = this.perspCamera;

		this.center = new THREE.Vector3();
	}

	initControls() {
		if (!app.debug) return;

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
		this.controls.enabled = false;
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
		this.triangle = new Triangle(this.interactive, this.audio);
		this.scene.add(this.triangle.object3D);

		this.triangle.on('triangle:down', this.onTriangleDown.bind(this));
		this.triangle.on('triangle:up', this.onTriangleUp.bind(this));
	}

	initSky() {
		this.sky = new SkyBox();
		this.scene.add(this.sky.object3D);
	}

	initLights() {
		this.light = new THREE.DirectionalLight(0xFFFFFF, 1);
		this.light.position.set(20, -50, 150);
		this.scene.add(this.light);

		const shadowMapWidth = 2048;
		const shadowMapHeight = 2048;

		this.light.castShadow = true;
		this.light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera(30, shadowMapWidth / shadowMapHeight, 100, 10000));
		this.light.shadow.bias = -0.0001;
		this.light.shadow.mapSize.width = shadowMapWidth;
		this.light.shadow.mapSize.height = shadowMapHeight;

		// const light = new THREE.DirectionalLight(0xFFFFFF, 1);
		// light.position.set(1, 1, 1);
		// this.scene.add(light);
	}

	initDebugShadow() {
		const debugShadows = getParam('debugShadows') !== '';
		if (!debugShadows) return;

		this.debugShadow = new DebugShadow(this.light, this.scene, this.renderer);
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

		this.bloomPass = new BloomPass({
			kernelSize: 3,
			intensity: 1,
			distinction: 1,
			// screenMode: false,
		});
		// bloom.renderToScreen = true;
		this.composer.addPass(this.bloomPass);

		const pass = new ShaderPass(this.filmicMaterial);
		pass.renderToScreen = true;
		this.composer.addPass(pass);

		this.clock = new THREE.Clock();
	}

	initAnimations() {
		this.animations = new Animations(this);
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		if (this.controls) this.controls.update();

		this.filmicMaterial.update(this.clock.getDelta());
		this.triangle.update();
		// this.updateHold();
	}

	updateHold() {
		
	}

	draw() {
		if (this.view.ui.postEnabled) this.composer.render(this.clock.getDelta());
		else this.renderer.render(this.scene, this.camera);

		if (this.debugShadow) this.debugShadow.draw();
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

		// TODO improve this
		this.onTriangleUp();
	}

	onTriangleDown(e) {
		const tetrahedron = e.target;
		this.isDown = true;
		// this.timeDown = Date.now();

		this.animations.start();
	}

	onTriangleUp(e) {
		// const tetrahedron = e.target;
		this.isDown = false;

		this.animations.stop();
	}
}
