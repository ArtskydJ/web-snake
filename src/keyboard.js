module.exports = function listenForKeyboardEvents(state) {
	const keyCodeToDirection = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	}

	const directionCompatibility = {
		left: [ 'up', 'down' ],
		right: [ 'up', 'down' ],
		up: [ 'left', 'right' ],
		down: [ 'left', 'right' ]
	}

	window.onkeydown = function (e) {
		var keyedDirection = keyCodeToDirection[e.keyCode]
		var willBeGoingDirection = state.nextDirections[state.nextDirections.length - 1] || state.currentDirection
		var okDirections = directionCompatibility[willBeGoingDirection]
		if (okDirections.includes(keyedDirection)) {
			state.nextDirections.push(keyedDirection)
		}
	}
}
