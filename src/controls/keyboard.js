var keyCodeToDirection = {
	ArrowUp: 'up',
	ArrowLeft: 'left',
	ArrowRight: 'right',
	ArrowDown: 'down',

	KeyW: 'up',
	KeyA: 'left',
	KeyS: 'down',
	KeyD: 'right',

	KeyI: 'up',
	KeyJ: 'left',
	KeyK: 'down',
	KeyL: 'right',

	Numpad8: 'up',
	Numpad4: 'left',
	Numpad6: 'right',
	Numpad5: 'down',
	Numpad2: 'down'
}

module.exports = function listenForKeyboardEvents(changeDirection) {
	window.onkeydown = function onKeyDown(e) {
		changeDirection(keyCodeToDirection[e.code])
	}
}
