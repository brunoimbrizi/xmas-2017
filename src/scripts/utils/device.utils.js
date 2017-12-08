const isTouch = () => {
	return 'ontouchstart' in window || (navigator.msMaxTouchPoints > 0);
};

export { isTouch };