import TweenMax from 'gsap';
import * as THREE from 'three';
import bowser from 'bowser';
import TrackballControls from 'three-trackballcontrols';
import { EffectComposer, BloomPass, ShaderPass, RenderPass } from 'postprocessing';

import InteractiveWebGL from './interactive/InteractiveWebGL';
import Triangle from './shapes/Triangle';
import SkyBox from './sky/SkyBox';
import FilmicPass from './passes/FilmicPass';
import FilmicMaterial from './materials/FilmicMaterial';
import Animations from './animations/Animations';
import AppState from './../../state/AppState';

// TODO remove this to save some bytes
import DebugShadow from './lights/DebugShadow';

import { getParam } from './../../utils/query.utils';
import { isTouch } from './../../utils/device.utils';
import { runPerformanceTest } from './../../utils/webgl.utils';
import { knm } from './../../utils/knm.utils';

const glslify = require('glslify');

export default class WebGLView {

	constructor(view, audio) {
		this.audio = audio;
		this.view = view;
		this.renderer = this.view.renderer;

		this.holdThreshold = 1000;

		if (bowser.tablet || bowser.mobile) {
			const debugPerf = getParam('perf') !== '' || app.debug;
			const threshold = parseInt(getParam('perf'), 10) || 220;
			const perf = runPerformanceTest(threshold, debugPerf);
			if (perf > threshold) this.low = true;
		}

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

		AppState.on('state:change', this.onStateChange.bind(this));
		AppState.goto(0);

		knm.start(this.onKnm.bind(this));
	}

	initThree() {
		// this.renderer.sortObjects = false;
		this.renderer.setPixelRatio(1);

		if (!this.low) {
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			this.renderer.setPixelRatio(window.devicePixelRatio || 1);
		}

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

		this.minDistance = 50;
		this.maxDistance = 200;
		this.swapDistance = 60;
		this.distance = this.distanceTarget = this.camera.position.z = this.maxDistance;
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

		if (isTouch()) {
			// zoom
			this.distance += (this.distanceTarget - this.distance) * 0.1;
			this.camera.position.z = this.distance;

			// if zoomed in enough, snap back
			if (!this.isZooming && this.distanceTarget < this.swapDistance && this.distance < this.swapDistance) {
				this.distanceTarget = this.maxDistance;
				AppState.next();
			}
		}

		this.filmicMaterial.update(this.clock.getDelta());
		this.triangle.update();
	}

	draw() {
		if (this.view.ui.postEnabled) this.composer.render(this.clock.getDelta());
		else this.renderer.render(this.scene, this.camera);

		if (this.debugShadow) this.debugShadow.draw();
	}

	show() {
		this.triangle.show();
	}

	zoom(delta) {
		this.distanceTarget -= delta;
		this.distanceTarget = this.distanceTarget > this.maxDistance ? this.maxDistance : this.distanceTarget;
		this.distanceTarget = this.distanceTarget < this.minDistance ? this.minDistance : this.distanceTarget;

		this.isZooming = true;
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
		this.isZooming = false;

		if (isTouch()) {
			this.triangle.out();
		}

		this.interactive.touchend();
	}

	onTriangleDown(e) {
		if (isTouch()) return;

		this.isDown = true;
		this.timeDown = Date.now();

		this.animations.start();
	}

	onTriangleUp(e) {
		if (isTouch()) return;
		
		this.isDown = false;

		if (Date.now() - this.timeDown > this.holdThreshold) AppState.next();
		this.animations.stop();
	}

	onStateChange(e) {
		// console.log('WebGLView.onStateChange', e);
		switch (e.state.index) {
			default:
			case 0: {
				this.filmicMaterial.uniforms.dispersionOffset.value = 0.0;
				this.filmicMaterial.uniforms.noiseIntensity.value = 0.1;
				this.filmicMaterial.uniforms.scanlineIntensity.value = 0.04;
				this.bloomPass.kernelSize = 3;

				break;
			}
			case 1: {
				this.filmicMaterial.uniforms.dispersionOffset.value = 0.0;
				this.filmicMaterial.uniforms.noiseIntensity.value = 0.08;
				this.filmicMaterial.uniforms.scanlineIntensity.value = 0.02;
				this.bloomPass.kernelSize = 1;
				break;
			}
			case 'knm':
			case 2: {
				this.filmicMaterial.uniforms.dispersionOffset.value = 0.15;
				this.filmicMaterial.uniforms.noiseIntensity.value = 0.1;
				this.filmicMaterial.uniforms.scanlineIntensity.value = 0.04;
				this.bloomPass.kernelSize = 3;
				break;
			}
		}

		document.querySelector('#info a').className = '';
		document.querySelector('#info a').classList.add(`state-${e.state.index}`);
	}

	onKnm(active) {
		console.log(active ? 'KONAMI YRSELF CLEAN' : '===================');
		AppState.knm(active);
		
		if (active) this.triangle.onTetrahedronUp();
		else this.triangle.gotoFace(0);
	}
}
