class Knm {
	
	constructor() {
		this.knm = {};
		this.knm.input = '';
		this.knm.timeout = null;
		this.knm.delay = 2000;
		this.knm.active = false;
	}

	start(callback) {
		if (!callback) return;
		this.callback = callback;

		this.knm.keyup = this.onKeyUp.bind(this);
		document.addEventListener('keyup', this.knm.keyup);
	}

	stop() {
		this.callback = null;
		document.removeEventListener('keyup', this.knm.keyup);
	}

	onKeyUp(e) {
		this.knm.input += e.keyCode;
		if (this.knm.input === '38384040373937396665') {
			this.knm.active = !this.knm.active;
			this.callback(this.knm.active);
		}

		clearTimeout(this.knm.timeout);
		this.knm.timeout = setTimeout(() => {
			this.knm.input = '';
		}, this.knm.delay);
	}
}

const knm = new Knm();

export { knm };
