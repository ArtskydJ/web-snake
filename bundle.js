(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.startGame = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const block = {
	width: 50,
	height: 50
}
const colorMultiplier = 3

var canvas = document.getElementById('canvas')
var draw = canvas.getContext('2d')

function clearAllBlocks(board) {
	draw.clearRect(0, 0, board.width * block.width, board.height * block.height)
}

function drawBlock(x, y, color) {
	draw.fillStyle = color
	draw.fillRect(x * block.width, y * block.height, block.width, block.height)
}

function resetCanvas() {
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight

	draw.fillStyle = '#eee'
	draw.fillRect(0, 0, canvas.width, canvas.height)

	const board = {
		width: Math.floor(canvas.width / block.width),
		height: Math.floor(canvas.height / block.height)
	}
	clearAllBlocks(board)

	return {
		updateCanvas: updateCanvas,
		board: board
	}
}

function updateCanvas(board, snake, food) {
	clearAllBlocks(board)

	drawBlock(food[0], food[1], 'green')

	snake.forEach(function (coords, index) {
		var offset = Math.round((-index + (snake.length - 1) / 2) * colorMultiplier)

		var blue = Math.max(255 + Math.min(0, offset), 50)
		var redGreen = Math.min(Math.max(0, offset), 205)

		var paddedRgHex = ('0' + redGreen.toString(16)).slice(-2)
		var paddedBlueHex = ('0' + blue.toString(16)).slice(-2)
		drawBlock(coords[0], coords[1], '#' + paddedRgHex + paddedRgHex + paddedBlueHex)
	})
}

module.exports = resetCanvas

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var resetCanvas = require('./canvas.js')
var listenForKeyboardEvents = require('./keyboard.js')

// snake = [[ tailX, tailY ], [ midX, midY ], [ headX, headY ]]
function createSnake(initialLength) {
	var snake = []
	for (var x = 0; x < initialLength; x++) {
		snake.push([ x, 0])
	}
	return snake
}

function snakeIsAtCoordinates(snake, x, y) {
	return snake.slice(1).some(function (coords) { // don't include the tail tip
		return coords[0] === x && coords[1] === y
	})
}

// food = [ x, y ]
function createFood(board, snake) {
	do {
		var x = Math.floor(Math.random() * board.width)
		var y = Math.floor(Math.random() * board.height)
	} while (snakeIsAtCoordinates(snake, x, y))
	return [ x, y ]
}

function growSnake(snake, growAmount) {
	for (var i = 0; i < growAmount; i++) {
		snake.unshift(snake[0])
	}
}

function moveSnake(constants, state) {
	var snake = state.snake.slice()
	var food = state.food.slice()
	var nextDirections = state.nextDirections.slice()
	var delayMs = state.delayMs
	var currentDirection = nextDirections.shift() || state.currentDirection

	var addX = { left: -1, right: 1 }[currentDirection] || 0
	var addY = { up: -1, down: 1 }[currentDirection] || 0

	var nextX = snake[snake.length - 1][0] + addX
	var nextY = snake[snake.length - 1][1] + addY

	if (
		nextX < 0 ||
		nextX >= constants.board.width ||
		nextY < 0 || nextY >= constants.board.height ||
		snakeIsAtCoordinates(snake, nextX, nextY)
	) {
		return { dead: true } // When you're dead, nothing else matters
	}

	var last = snake.shift() // remove tail
	snake.push([ nextX, nextY ]) // create head

	if (food[0] === nextX && food[1] === nextY) { // food
		growSnake(snake, constants.growAmount)
		delayMs /= constants.accelerate
		food = createFood(constants.board, snake)
	}

	return {
		snake: snake,
		food: food,
		currentDirection: currentDirection,
		nextDirections: nextDirections,
		delayMs: delayMs,
		dead: false
	}
}


var inLoop = null

module.exports = function startGame(constants) {
	if (!constants || typeof constants !== 'object') throw new Error('Expected constants to be an object')
	if (typeof constants.initialLength !== 'number') throw new Error('Expected constants.initialLength to be a number')
	if (typeof constants.initialDelayMs !== 'number') throw new Error('Expected constants.initialDelayMs to be a number')
	if (typeof constants.growAmount !== 'number') throw new Error('Expected constants.growAmount to be a number')
	if (typeof constants.accelerate !== 'number') throw new Error('Expected constants.accelerate to be a number')

	var tmp = resetCanvas()
	var updateCanvas = tmp.updateCanvas
	constants.board = tmp.board

	var snake = createSnake(constants.initialLength)
	var state = {
		snake: snake,
		food: createFood(constants.board, snake),
		currentDirection: 'right',
		nextDirections: [],
		delayMs: constants.initialDelayMs,
		dead: false
	}

	loop()

	function loop() {
		clearTimeout(inLoop)

		updateCanvas(constants.board, state.snake, state.food)

		listenForKeyboardEvents(state)

		inLoop = setTimeout(function () {
			state = moveSnake(constants, state)
			if (!state.dead) {
				loop()
			}
		}, state.delayMs)
	}
}

},{"./canvas.js":1,"./keyboard.js":2}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2FudmFzLmpzIiwic3JjL2tleWJvYXJkLmpzIiwic3JjL3NuYWtlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgYmxvY2sgPSB7XHJcblx0d2lkdGg6IDUwLFxyXG5cdGhlaWdodDogNTBcclxufVxyXG5jb25zdCBjb2xvck11bHRpcGxpZXIgPSAzXHJcblxyXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpXHJcbnZhciBkcmF3ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuXHJcbmZ1bmN0aW9uIGNsZWFyQWxsQmxvY2tzKGJvYXJkKSB7XHJcblx0ZHJhdy5jbGVhclJlY3QoMCwgMCwgYm9hcmQud2lkdGggKiBibG9jay53aWR0aCwgYm9hcmQuaGVpZ2h0ICogYmxvY2suaGVpZ2h0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3QmxvY2soeCwgeSwgY29sb3IpIHtcclxuXHRkcmF3LmZpbGxTdHlsZSA9IGNvbG9yXHJcblx0ZHJhdy5maWxsUmVjdCh4ICogYmxvY2sud2lkdGgsIHkgKiBibG9jay5oZWlnaHQsIGJsb2NrLndpZHRoLCBibG9jay5oZWlnaHQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0Q2FudmFzKCkge1xyXG5cdGNhbnZhcy53aWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aFxyXG5cdGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0XHJcblxyXG5cdGRyYXcuZmlsbFN0eWxlID0gJyNlZWUnXHJcblx0ZHJhdy5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXHJcblxyXG5cdGNvbnN0IGJvYXJkID0ge1xyXG5cdFx0d2lkdGg6IE1hdGguZmxvb3IoY2FudmFzLndpZHRoIC8gYmxvY2sud2lkdGgpLFxyXG5cdFx0aGVpZ2h0OiBNYXRoLmZsb29yKGNhbnZhcy5oZWlnaHQgLyBibG9jay5oZWlnaHQpXHJcblx0fVxyXG5cdGNsZWFyQWxsQmxvY2tzKGJvYXJkKVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0dXBkYXRlQ2FudmFzOiB1cGRhdGVDYW52YXMsXHJcblx0XHRib2FyZDogYm9hcmRcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUNhbnZhcyhib2FyZCwgc25ha2UsIGZvb2QpIHtcclxuXHRjbGVhckFsbEJsb2Nrcyhib2FyZClcclxuXHJcblx0ZHJhd0Jsb2NrKGZvb2RbMF0sIGZvb2RbMV0sICdncmVlbicpXHJcblxyXG5cdHNuYWtlLmZvckVhY2goZnVuY3Rpb24gKGNvb3JkcywgaW5kZXgpIHtcclxuXHRcdHZhciBvZmZzZXQgPSBNYXRoLnJvdW5kKCgtaW5kZXggKyAoc25ha2UubGVuZ3RoIC0gMSkgLyAyKSAqIGNvbG9yTXVsdGlwbGllcilcclxuXHJcblx0XHR2YXIgYmx1ZSA9IE1hdGgubWF4KDI1NSArIE1hdGgubWluKDAsIG9mZnNldCksIDUwKVxyXG5cdFx0dmFyIHJlZEdyZWVuID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgb2Zmc2V0KSwgMjA1KVxyXG5cclxuXHRcdHZhciBwYWRkZWRSZ0hleCA9ICgnMCcgKyByZWRHcmVlbi50b1N0cmluZygxNikpLnNsaWNlKC0yKVxyXG5cdFx0dmFyIHBhZGRlZEJsdWVIZXggPSAoJzAnICsgYmx1ZS50b1N0cmluZygxNikpLnNsaWNlKC0yKVxyXG5cdFx0ZHJhd0Jsb2NrKGNvb3Jkc1swXSwgY29vcmRzWzFdLCAnIycgKyBwYWRkZWRSZ0hleCArIHBhZGRlZFJnSGV4ICsgcGFkZGVkQmx1ZUhleClcclxuXHR9KVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc2V0Q2FudmFzXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGlzdGVuRm9yS2V5Ym9hcmRFdmVudHMoc3RhdGUpIHtcclxuXHRjb25zdCBrZXlDb2RlVG9EaXJlY3Rpb24gPSB7XHJcblx0XHQzNzogJ2xlZnQnLFxyXG5cdFx0Mzg6ICd1cCcsXHJcblx0XHQzOTogJ3JpZ2h0JyxcclxuXHRcdDQwOiAnZG93bidcclxuXHR9XHJcblxyXG5cdGNvbnN0IGRpcmVjdGlvbkNvbXBhdGliaWxpdHkgPSB7XHJcblx0XHRsZWZ0OiBbICd1cCcsICdkb3duJyBdLFxyXG5cdFx0cmlnaHQ6IFsgJ3VwJywgJ2Rvd24nIF0sXHJcblx0XHR1cDogWyAnbGVmdCcsICdyaWdodCcgXSxcclxuXHRcdGRvd246IFsgJ2xlZnQnLCAncmlnaHQnIF1cclxuXHR9XHJcblxyXG5cdHdpbmRvdy5vbmtleWRvd24gPSBmdW5jdGlvbiAoZSkge1xyXG5cdFx0dmFyIGtleWVkRGlyZWN0aW9uID0ga2V5Q29kZVRvRGlyZWN0aW9uW2Uua2V5Q29kZV1cclxuXHRcdHZhciB3aWxsQmVHb2luZ0RpcmVjdGlvbiA9IHN0YXRlLm5leHREaXJlY3Rpb25zW3N0YXRlLm5leHREaXJlY3Rpb25zLmxlbmd0aCAtIDFdIHx8IHN0YXRlLmN1cnJlbnREaXJlY3Rpb25cclxuXHRcdHZhciBva0RpcmVjdGlvbnMgPSBkaXJlY3Rpb25Db21wYXRpYmlsaXR5W3dpbGxCZUdvaW5nRGlyZWN0aW9uXVxyXG5cdFx0aWYgKG9rRGlyZWN0aW9ucy5pbmNsdWRlcyhrZXllZERpcmVjdGlvbikpIHtcclxuXHRcdFx0c3RhdGUubmV4dERpcmVjdGlvbnMucHVzaChrZXllZERpcmVjdGlvbilcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuIiwidmFyIHJlc2V0Q2FudmFzID0gcmVxdWlyZSgnLi9jYW52YXMuanMnKVxyXG52YXIgbGlzdGVuRm9yS2V5Ym9hcmRFdmVudHMgPSByZXF1aXJlKCcuL2tleWJvYXJkLmpzJylcclxuXHJcbi8vIHNuYWtlID0gW1sgdGFpbFgsIHRhaWxZIF0sIFsgbWlkWCwgbWlkWSBdLCBbIGhlYWRYLCBoZWFkWSBdXVxyXG5mdW5jdGlvbiBjcmVhdGVTbmFrZShpbml0aWFsTGVuZ3RoKSB7XHJcblx0dmFyIHNuYWtlID0gW11cclxuXHRmb3IgKHZhciB4ID0gMDsgeCA8IGluaXRpYWxMZW5ndGg7IHgrKykge1xyXG5cdFx0c25ha2UucHVzaChbIHgsIDBdKVxyXG5cdH1cclxuXHRyZXR1cm4gc25ha2VcclxufVxyXG5cclxuZnVuY3Rpb24gc25ha2VJc0F0Q29vcmRpbmF0ZXMoc25ha2UsIHgsIHkpIHtcclxuXHRyZXR1cm4gc25ha2Uuc2xpY2UoMSkuc29tZShmdW5jdGlvbiAoY29vcmRzKSB7IC8vIGRvbid0IGluY2x1ZGUgdGhlIHRhaWwgdGlwXHJcblx0XHRyZXR1cm4gY29vcmRzWzBdID09PSB4ICYmIGNvb3Jkc1sxXSA9PT0geVxyXG5cdH0pXHJcbn1cclxuXHJcbi8vIGZvb2QgPSBbIHgsIHkgXVxyXG5mdW5jdGlvbiBjcmVhdGVGb29kKGJvYXJkLCBzbmFrZSkge1xyXG5cdGRvIHtcclxuXHRcdHZhciB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYm9hcmQud2lkdGgpXHJcblx0XHR2YXIgeSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGJvYXJkLmhlaWdodClcclxuXHR9IHdoaWxlIChzbmFrZUlzQXRDb29yZGluYXRlcyhzbmFrZSwgeCwgeSkpXHJcblx0cmV0dXJuIFsgeCwgeSBdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdyb3dTbmFrZShzbmFrZSwgZ3Jvd0Ftb3VudCkge1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZ3Jvd0Ftb3VudDsgaSsrKSB7XHJcblx0XHRzbmFrZS51bnNoaWZ0KHNuYWtlWzBdKVxyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gbW92ZVNuYWtlKGNvbnN0YW50cywgc3RhdGUpIHtcclxuXHR2YXIgc25ha2UgPSBzdGF0ZS5zbmFrZS5zbGljZSgpXHJcblx0dmFyIGZvb2QgPSBzdGF0ZS5mb29kLnNsaWNlKClcclxuXHR2YXIgbmV4dERpcmVjdGlvbnMgPSBzdGF0ZS5uZXh0RGlyZWN0aW9ucy5zbGljZSgpXHJcblx0dmFyIGRlbGF5TXMgPSBzdGF0ZS5kZWxheU1zXHJcblx0dmFyIGN1cnJlbnREaXJlY3Rpb24gPSBuZXh0RGlyZWN0aW9ucy5zaGlmdCgpIHx8IHN0YXRlLmN1cnJlbnREaXJlY3Rpb25cclxuXHJcblx0dmFyIGFkZFggPSB7IGxlZnQ6IC0xLCByaWdodDogMSB9W2N1cnJlbnREaXJlY3Rpb25dIHx8IDBcclxuXHR2YXIgYWRkWSA9IHsgdXA6IC0xLCBkb3duOiAxIH1bY3VycmVudERpcmVjdGlvbl0gfHwgMFxyXG5cclxuXHR2YXIgbmV4dFggPSBzbmFrZVtzbmFrZS5sZW5ndGggLSAxXVswXSArIGFkZFhcclxuXHR2YXIgbmV4dFkgPSBzbmFrZVtzbmFrZS5sZW5ndGggLSAxXVsxXSArIGFkZFlcclxuXHJcblx0aWYgKFxyXG5cdFx0bmV4dFggPCAwIHx8XHJcblx0XHRuZXh0WCA+PSBjb25zdGFudHMuYm9hcmQud2lkdGggfHxcclxuXHRcdG5leHRZIDwgMCB8fCBuZXh0WSA+PSBjb25zdGFudHMuYm9hcmQuaGVpZ2h0IHx8XHJcblx0XHRzbmFrZUlzQXRDb29yZGluYXRlcyhzbmFrZSwgbmV4dFgsIG5leHRZKVxyXG5cdCkge1xyXG5cdFx0cmV0dXJuIHsgZGVhZDogdHJ1ZSB9IC8vIFdoZW4geW91J3JlIGRlYWQsIG5vdGhpbmcgZWxzZSBtYXR0ZXJzXHJcblx0fVxyXG5cclxuXHR2YXIgbGFzdCA9IHNuYWtlLnNoaWZ0KCkgLy8gcmVtb3ZlIHRhaWxcclxuXHRzbmFrZS5wdXNoKFsgbmV4dFgsIG5leHRZIF0pIC8vIGNyZWF0ZSBoZWFkXHJcblxyXG5cdGlmIChmb29kWzBdID09PSBuZXh0WCAmJiBmb29kWzFdID09PSBuZXh0WSkgeyAvLyBmb29kXHJcblx0XHRncm93U25ha2Uoc25ha2UsIGNvbnN0YW50cy5ncm93QW1vdW50KVxyXG5cdFx0ZGVsYXlNcyAvPSBjb25zdGFudHMuYWNjZWxlcmF0ZVxyXG5cdFx0Zm9vZCA9IGNyZWF0ZUZvb2QoY29uc3RhbnRzLmJvYXJkLCBzbmFrZSlcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRzbmFrZTogc25ha2UsXHJcblx0XHRmb29kOiBmb29kLFxyXG5cdFx0Y3VycmVudERpcmVjdGlvbjogY3VycmVudERpcmVjdGlvbixcclxuXHRcdG5leHREaXJlY3Rpb25zOiBuZXh0RGlyZWN0aW9ucyxcclxuXHRcdGRlbGF5TXM6IGRlbGF5TXMsXHJcblx0XHRkZWFkOiBmYWxzZVxyXG5cdH1cclxufVxyXG5cclxuXHJcbnZhciBpbkxvb3AgPSBudWxsXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0YXJ0R2FtZShjb25zdGFudHMpIHtcclxuXHRpZiAoIWNvbnN0YW50cyB8fCB0eXBlb2YgY29uc3RhbnRzICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBjb25zdGFudHMgdG8gYmUgYW4gb2JqZWN0JylcclxuXHRpZiAodHlwZW9mIGNvbnN0YW50cy5pbml0aWFsTGVuZ3RoICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBjb25zdGFudHMuaW5pdGlhbExlbmd0aCB0byBiZSBhIG51bWJlcicpXHJcblx0aWYgKHR5cGVvZiBjb25zdGFudHMuaW5pdGlhbERlbGF5TXMgIT09ICdudW1iZXInKSB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGNvbnN0YW50cy5pbml0aWFsRGVsYXlNcyB0byBiZSBhIG51bWJlcicpXHJcblx0aWYgKHR5cGVvZiBjb25zdGFudHMuZ3Jvd0Ftb3VudCAhPT0gJ251bWJlcicpIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgY29uc3RhbnRzLmdyb3dBbW91bnQgdG8gYmUgYSBudW1iZXInKVxyXG5cdGlmICh0eXBlb2YgY29uc3RhbnRzLmFjY2VsZXJhdGUgIT09ICdudW1iZXInKSB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGNvbnN0YW50cy5hY2NlbGVyYXRlIHRvIGJlIGEgbnVtYmVyJylcclxuXHJcblx0dmFyIHRtcCA9IHJlc2V0Q2FudmFzKClcclxuXHR2YXIgdXBkYXRlQ2FudmFzID0gdG1wLnVwZGF0ZUNhbnZhc1xyXG5cdGNvbnN0YW50cy5ib2FyZCA9IHRtcC5ib2FyZFxyXG5cclxuXHR2YXIgc25ha2UgPSBjcmVhdGVTbmFrZShjb25zdGFudHMuaW5pdGlhbExlbmd0aClcclxuXHR2YXIgc3RhdGUgPSB7XHJcblx0XHRzbmFrZTogc25ha2UsXHJcblx0XHRmb29kOiBjcmVhdGVGb29kKGNvbnN0YW50cy5ib2FyZCwgc25ha2UpLFxyXG5cdFx0Y3VycmVudERpcmVjdGlvbjogJ3JpZ2h0JyxcclxuXHRcdG5leHREaXJlY3Rpb25zOiBbXSxcclxuXHRcdGRlbGF5TXM6IGNvbnN0YW50cy5pbml0aWFsRGVsYXlNcyxcclxuXHRcdGRlYWQ6IGZhbHNlXHJcblx0fVxyXG5cclxuXHRsb29wKClcclxuXHJcblx0ZnVuY3Rpb24gbG9vcCgpIHtcclxuXHRcdGNsZWFyVGltZW91dChpbkxvb3ApXHJcblxyXG5cdFx0dXBkYXRlQ2FudmFzKGNvbnN0YW50cy5ib2FyZCwgc3RhdGUuc25ha2UsIHN0YXRlLmZvb2QpXHJcblxyXG5cdFx0bGlzdGVuRm9yS2V5Ym9hcmRFdmVudHMoc3RhdGUpXHJcblxyXG5cdFx0aW5Mb29wID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHN0YXRlID0gbW92ZVNuYWtlKGNvbnN0YW50cywgc3RhdGUpXHJcblx0XHRcdGlmICghc3RhdGUuZGVhZCkge1xyXG5cdFx0XHRcdGxvb3AoKVxyXG5cdFx0XHR9XHJcblx0XHR9LCBzdGF0ZS5kZWxheU1zKVxyXG5cdH1cclxufVxyXG4iXX0=
