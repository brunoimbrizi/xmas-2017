import * as THREE from 'three';

export default class Tetrahedron {

	static get WIDTH() { return 10; }
	static get HEIGHT() { return 15; }

	constructor(data) {
		this.data = data;

		this.radius = Tetrahedron.WIDTH;
		this.width = Tetrahedron.WIDTH;
		this.height = Tetrahedron.HEIGHT;
		this.object3D = new THREE.Object3D();

		this.initMesh();
	}

	initMesh() {
		const geometry = new THREE.ConeBufferGeometry(this.width, this.height, 4);
		// const geometry = new THREE.TetrahedronBufferGeometry(this.radius);
		// const geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.width);

		const material = new THREE.MeshLambertMaterial({
			color: 0xFFFFFF,
			// wireframe: true,
			// transparent: true,
			// opacity: 0.5,
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.object3D.add(mesh);

		// mesh.rotation.x = QUARTER_PI;
		// mesh.rotation.z = -QUARTER_PI;
	}
}