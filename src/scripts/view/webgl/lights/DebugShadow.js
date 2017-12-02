import * as THREE from 'three';

require('./../../../../vendors/UnpackDepthRGBAShader.js');
require('./../../../../vendors/ShadowMapViewer.js');

export default class DebugShadow {

	constructor(light, scene, renderer) {
		this.light = light;
		this.scene = scene;
		this.renderer = renderer;

		this.initMapViewer();
	}

	initMapViewer() {
		this.scene.add( new THREE.CameraHelper(this.light.shadow.camera));
		
		this.lightShadowMapViewer = new THREE.ShadowMapViewer(this.light);
		this.lightShadowMapViewer.position.x = 10;
		this.lightShadowMapViewer.position.y = window.innerHeight - (this.light.shadow.mapSize.height / 4) - 10;
		this.lightShadowMapViewer.size.width = this.light.shadow.mapSize.width / 4;
		this.lightShadowMapViewer.size.height = this.light.shadow.mapSize.height / 4;
		this.lightShadowMapViewer.update();
	}

	draw() {
		this.lightShadowMapViewer.render(this.renderer);
	}
}