import * as THREE from 'three';
import Sketch from 'sketch-js';

import WebGLView from './webgl/WebGLView';
import UIView from './ui/UIView';

export default class AppView {

	constructor(audio) {
		this.audio = audio;
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

		this.initSketch();
	}

	initSketch() {
		this.sketch = Sketch.create({
			type: Sketch.WEBGL,
			element: this.renderer.domElement,
			context: this.renderer.context,
			autopause: false,
			retina: (window.devicePixelRatio >= 2),
			fullscreen: true
		});

		this.sketch.setup = () => {
			this.initWebGL();
			this.initUI();
			this.initInfo();
		};

		this.sketch.update = () => {
			if (this.ui.stats) this.ui.stats.begin();
			this.webgl.update();
		};

		this.sketch.draw = () => {
			this.webgl.draw();
			if (this.ui.stats) this.ui.stats.end();
		};

		this.sketch.resize = () => {
			this.webgl.resize();
		};

		this.sketch.touchstart = (e) => {
			e.preventDefault();
			if (!this.webgl) return;

			// multiple touches
			if (this.sketch.touches && this.sketch.touches.length > 1) {
				const dx = this.sketch.touches[0].x - this.sketch.touches[1].x;
				const dy = this.sketch.touches[0].y - this.sketch.touches[1].y;

				this.touchZoomDistanceStart = this.touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

				return;
			}

			// one touch
			const touch = this.sketch.touches[0];
			this.webgl.touchstart(touch);
		};

		this.sketch.touchmove = (e) => {
			e.preventDefault();
			if (!this.webgl) return;

			// multiple touches
			if (this.sketch.touches && this.sketch.touches.length > 1) {
				const dx = this.sketch.touches[0].x - this.sketch.touches[1].x;
				const dy = this.sketch.touches[0].y - this.sketch.touches[1].y;

				this.touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
				const delta = this.touchZoomDistanceEnd - this.touchZoomDistanceStart;
				this.touchZoomDistanceStart = this.touchZoomDistanceEnd;
				this.webgl.zoom(delta);

				return;
			}

			// one touch
			const touch = this.sketch.touches[0];
			this.webgl.touchmove(touch);
		};

		this.sketch.touchend = () => {
			if (!this.webgl) return;

			this.webgl.touchend();
		};

		this.sketch.keyup = (e) => {
			if (!this.webgl) return; 

			// console.log(e.keyCode);
			if (e.keyCode == 82) { // r
				this.webgl.controls.reset();
			}
		};
	}

	initWebGL() {
		// move canvas to container
		document.querySelector('#container').appendChild(this.renderer.domElement);
		
		this.webgl = new WebGLView(this, this.audio);
	}

	initUI() {
		this.ui = new UIView(this);
	}

	initInfo() {
		const btn = document.querySelector('.btn-info a');
		const info = document.querySelector('.info');
		
		btn.addEventListener('click', (e) => {
			e.preventDefault();

			if (info.classList.contains('open')) {
				info.classList.remove('open');
				btn.innerHTML = 'INFO';
			} else {
				info.classList.add('open');
				btn.innerHTML = 'CLOSE';
			}
		});
	}
}
