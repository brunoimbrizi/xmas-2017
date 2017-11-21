export default class Tetrahedron {

	constructor() {
		this.object3D = new THREE.Object3D();

		this.initMesh();
	}

	initMesh() {
		// const geometry = new THREE.TetrahedronGeometry();
		const geometry = new THREE.TetrahedronBufferGeometry(10);
		// geometry.rotateX(HALF_PI);
		geometry.rotateY(-HALF_PI / 2);

		const material = new THREE.MeshBasicMaterial({
			color: 0x00FF00,
			wireframe: true,
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.object3D.add(mesh);
	}
}