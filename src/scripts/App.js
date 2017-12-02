import AppView from './view/AppView';

import { getParam } from './utils/query.utils';

export default class App {

	constructor() {
		this.debug = getParam('debug') !== '';

		this.view = new AppView();
	}
}
