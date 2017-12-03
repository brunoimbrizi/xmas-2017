import AppAudio from './audio/AppAudio';
import AppView from './view/AppView';

import { getParam } from './utils/query.utils';

export default class App {

	constructor() {
		this.debug = getParam('debug') !== '';

		this.audio = new AppAudio();
		this.view = new AppView(this.audio);
	}
}
