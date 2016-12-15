var buttonIndexToDirection = {
	12: 'up', // D-Pad
	13: 'down',
	14: 'left',
	15: 'right',

	0: 'down', // A
	1: 'right', // B
	2: 'left', // X
	3: 'up' // Y
}

var deadZone = 0.5
var nextIntervalToClear

module.exports = function listenForKeyboardEvents(changeDirection) {
	clearInterval(nextIntervalToClear)

	nextIntervalToClear = setInterval(function () {
		if (!navigator || !navigator.getGamepads) return
		var gamepad = navigator.getGamepads()[0]
		if (!gamepad) return

		// BUG!!!
		// If you press two buttons at once, your snake will forever go that direction

		// // Buttons
		// gamepad.buttons.forEach(function (button, buttonIndex) {
		// 	if (button.pressed) changeDirection(buttonIndexToDirection[buttonIndex])
		// })


		// Left Stick
		var leftRightAxis = gamepad.axes[0]
		var upDownAxis = gamepad.axes[1]
		var useLeftRightAxis = Math.abs(leftRightAxis) > Math.abs(upDownAxis)

		if (useLeftRightAxis && leftRightAxis > deadZone) changeDirection('right')
		if (useLeftRightAxis && leftRightAxis < -deadZone) changeDirection('left')
		if (!useLeftRightAxis && upDownAxis > deadZone) changeDirection('down')
		if (!useLeftRightAxis && upDownAxis < -deadZone) changeDirection('up')
	}, 10)
}
