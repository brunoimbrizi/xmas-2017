import * as THREE from 'three';

export default class InteractiveWebGL {

  constructor(webGL) {
    this.scene = webGL.scene;
    this.camera = webGL.camera;
    this.container = webGL.renderer.domElement;

    this.interactiveObjects = [];

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();

    // this.initPlane();
  }

  initPlane() {
    // const geometry = new THREE.PlaneBufferGeometry(window.innerWidth * 2, window.innerHeight * 2, 8, 8);
    const geometry = new THREE.PlaneBufferGeometry(4000, 2000, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0 });
    
    this.intersectPlane = new THREE.Mesh(geometry, material);
    this.intersectPlane.position.z = -1;
    // this.intersectPlane.visible = false;
    this.scene.add(this.intersectPlane);
  }

  getSelected() {
    for (let i = 0; i < this.interactiveObjects.length; i++) {
      const obj = this.interactiveObjects[i];
      if (obj.interactive && obj.interactive.selected) return obj;
    }
    return null;
  }

  setSelected(obj) {
    const selected = this.getSelected();
    if (selected && selected !== obj) selected.interactive.unselect();
    if (obj && selected !== obj) obj.interactive.select();
    if (selected && obj && selected === obj) obj.interactive.toggleSelection();
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  touchstart(touch) {
    this.down = true;
    this.touchmove(touch);

    if (this.intersected) {
      // const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5).unproject(this.camera);
      // const raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

      /*
      // camera / plane offset
      const intersects = raycaster.intersectObject(this.intersectPlane);
      this.offset.copy(intersects[0].point).sub(this.intersectPlane.position);

      // local offset
      const localIntersects = this.raycaster.intersectObject(this.intersectPlane);
      const diff = localIntersects[0].point.sub(this.intersected.position);
      this.offset.add(diff);
      */

      this.intersected.interactive.down();
      this.setSelected(this.intersected);
    } else {
      this.setSelected(null);
    }

    return (this.intersected !== null);
  }

  touchmove(touch) {
    this.mouse.x = (touch.x / window.innerWidth) * 2 - 1;
    this.mouse.y = -(touch.y / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    /*
    // dragging something
    if (this.down && this.intersected) {
      const intersects = this.raycaster.intersectObject(this.intersectPlane);
      this.intersected.interactive.drag(intersects[0].point.sub(this.offset));
      return;
    }
    */

    // find intersections
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

    // console.log(intersects);

    if (intersects.length) {
      if (this.intersected !== intersects[0].object) {
        if (this.intersected) this.intersected.interactive.out();

        for (let i = 0; i < intersects.length; i++) {
          if (intersects[i].object.parent.visible) {
            this.intersected = intersects[i].object;
            break;
          }
        }
        if (!this.intersected) return;
        if (!this.intersected.interactive.enabled) {
          this.intersected = null;
          this.container.style.cursor = 'auto';
          return;
        }
        this.intersected.interactive.over();
        this.container.style.cursor = 'pointer';
      }
    } else {
      if (this.intersected) this.intersected.interactive.out();
      this.intersected = null;
      this.container.style.cursor = 'auto';
    }

    // reset cursor if interactive is a mask
    if (this.intersected && this.intersected.interactive.mask) this.container.style.cursor = 'auto';
  }

  touchend() {
    this.down = false;

    if (this.intersected) this.intersected.interactive.up();
    // this.intersected = null;
  }

  keydown(e) {
    // console.log('keydown', e.keyCode, e);

    const selected = this.getSelected();
    if (selected) selected.interactive.keydown(e);
  }

  keyup(e) {
    const selected = this.getSelected();
    if (selected) selected.interactive.keyup(e);
  }

}