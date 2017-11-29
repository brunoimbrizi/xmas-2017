import * as THREE from 'three';

export default class Tetrahedron {

	static get WIDTH() { return 10; }
	static get HEIGHT() { return (sqrt(3) / 2) * Tetrahedron.WIDTH; }

	constructor(data) {
		this.data = data;

		this.width = Tetrahedron.WIDTH;
		this.height = Tetrahedron.HEIGHT;
		
		this.rc = sqrt(6) * (Tetrahedron.WIDTH / 4);	// radius of circumsphere
		this.ri = sqrt(6) * (Tetrahedron.WIDTH / 12);	// radius of insphere that is tangent to faces
		this.rm = sqrt(2) * (Tetrahedron.WIDTH / 4);	// radius of midsphere that is tangent to edges
		this.re = sqrt(6) * (Tetrahedron.WIDTH / 6);	// radius of exspheres
		this.de = sqrt(6) * (Tetrahedron.WIDTH / 2);	// distance to exsphere centre from a vertex

		this.object3D = new THREE.Object3D();

		this.initMesh();
		this.initBoundingBox();
	}

	initMesh() {
		// const geometry = new THREE.ConeBufferGeometry(this.width, this.height, 3);
		const geometry = new THREE.TetrahedronBufferGeometry(this.rc);
		// const geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.width);

		const material = new THREE.MeshLambertMaterial({
			color: 0xFFFFFF,
			// wireframe: true,
			// transparent: true,
			// opacity: 0.5,
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.object3D.add(mesh);

		// face 0
		mesh.rotation.z = -QUARTER_PI;
		mesh.rotation.x = atan(sqrt(2));
		// mesh.position.y = this.height - this.width;
		// mesh.position.y = -1.44;
		// mesh.position.z = (this.width - this.radius) * 0.5;
	}

	initBoundingBox() {
		const geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.height);

		const material = new THREE.MeshBasicMaterial({
			color: 0x00FF00,
			wireframe: true,
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.object3D.add(mesh);
	}
}