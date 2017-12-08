import EventEmitter from 'events';

class AppState extends EventEmitter {

	constructor() {
		super();

		this.state = null;

		this.states = new Map();
		this.states.set(this.states.size, { index: this.states.size });
		this.states.set(this.states.size, { index: this.states.size });
		this.states.set(this.states.size, { index: this.states.size });
	}

	goto(index) {
		const next = this.states.get(index);

		if (!next) {
			console.log('AppState.goto index', index, `doesn't exist.`);
			return false;
		}

		this.state = next;
		this.emit('state:change', { state: this.state });

		return true;
	}

	next() {
		if (this.state.index === 'knm') return;
		if (this.state.index < this.states.size - 1) this.goto(this.state.index + 1);
		else this.goto(0);
	}

	prev() {
		if (this.state.index > 0) this.goto(this.state.index - 1);
		else this.goto(this.states.size - 1);
	}

	knm(active) {
		if (active) {
			this.states.set('knm', { index: 'knm' });
			this.goto('knm');
		}
		else {
			this.states.delete('knm');
			this.goto(0);	
		}
	}

}

export default new AppState();
