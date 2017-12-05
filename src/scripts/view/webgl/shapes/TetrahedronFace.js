import * as THREE from 'three';

export default class TetrahedronFace {

	constructor(index, a, b, c) {
		this.index = index;
		this.a = a;
		this.b = b;
		this.c = c;

		this.initMesh();
	}

	initMesh() {
		const vertices = [
			new THREE.Vector3(1, 1, 1),
			new THREE.Vector3(-1, -1, 1),
			new THREE.Vector3(-1, 1, -1),
			new THREE.Vector3(1, -1, -1)
		];

		const geometry = new THREE.Geometry();
		geometry.vertices.push(vertices[this.a].multiplyScalar(0.5));
		geometry.vertices.push(vertices[this.b].multiplyScalar(0.5));
		geometry.vertices.push(vertices[this.c].multiplyScalar(0.5));

		geometry.faces.push(new THREE.Face3(0, 1, 2));
		geometry.computeFaceNormals();

		const material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

		this.mesh = new THREE.Mesh(geometry, material);
	}
}
