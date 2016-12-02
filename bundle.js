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
		if (okDirections.indexOf(keyedDirection) !== -1) {
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