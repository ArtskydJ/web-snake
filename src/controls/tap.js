var deadZone = 0.25

module.exports = function listenForClickEvents(changeDirection) {
	canvas.onmousedown = handleTap
	canvas.ontouchend = handleTap

	function handleTap(e) {
		var leftRightAxis = (e.clientX / canvas.clientWidth * 2) - 1
		var upDownAxis = (e.clientY / canvas.clientHeight * 2) - 1
		var useLeftRightAxis = Math.abs(leftRightAxis) > Math.abs(upDownAxis)

		if (useLeftRightAxis && leftRightAxis > deadZone) changeDirection('right')
		if (useLeftRightAxis && leftRightAxis < -deadZone) changeDirection('left')
		if (!useLeftRightAxis && upDownAxis > deadZone) changeDirection('down')
		if (!useLeftRightAxis && upDownAxis < -deadZone) changeDirection('up')
	}
}
