import * as THREE from 'three';
import TweenMax from 'gsap';

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

		this.tc = sqrt(3) * (Tetrahedron.WIDTH / 6);	// radius of the inscribed circle (equilateral triangle)

		this.offset = new THREE.Vector3();				// offset center inside cube
		this.offset.y = this.height * 0.5 - this.tc;
		this.offset.z = this.height * 0.5 - this.tc;

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
		this.mesh = mesh;
		this.object3D.add(mesh);

		mesh.position.y = -this.offset.y;
		mesh.position.z = this.offset.z;

		// face 0
		// mesh.rotation.x = atan(sqrt(2));
		// mesh.rotation.y = 0;
		// mesh.rotation.z = -QUARTER_PI;

		// face 1
		// mesh.rotation.x = atan(sqrt(2)) - HALF_PI;
		// mesh.rotation.y = QUARTER_PI;
		// mesh.rotation.z = -HALF_PI;

	}

	initBoundingBox() {
		const geometry = new THREE.BoxBufferGeometry(this.height, this.height, this.height);

		const material = new THREE.MeshBasicMaterial({
			color: 0x00FF00,
			wireframe: true,
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.object3D.add(mesh);
	}

	gotoFace(index) {
		let x, y, z;

		switch (index) {
			case 1: {
				x = atan(sqrt(2)) - HALF_PI;
				y = QUARTER_PI;
				z = -HALF_PI;
				break;
			}
			case 0:
			default: {
				x = atan(sqrt(2));
				y = 0;
				z = -QUARTER_PI;
				break;
			}
		}

		TweenMax.to(this.mesh.rotation, 1, { x, y, z });
	}

	update() {
		// this.object3D.children[0].rotation.x += 0.01;
	}
}