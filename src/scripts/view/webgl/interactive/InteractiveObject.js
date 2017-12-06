import EventEmitter from 'events';

export default class InteractiveObject extends EventEmitter {

  constructor(params) {
    super();
    this.selected = false;
    this.enabled = true;

    // mask: intersects with mouse, but does nothing
    this.mask = params && params.mask;
  }

  down() {
    // override
  }

  up() {
    // override
  }

  over() {
    // override
  }

  out() {
    // override
  }

  drag(pos) {
    // override
  }

  keydown(e) {
    // override
  }

  keyup(e) {
    // override
  }

  select() {
    this.selected = true;
  }

  unselect() {
    this.selected = false;
  }

  toggleSelection() {
    if (this.selected) this.unselect();
    else this.select();
  }
  
}
