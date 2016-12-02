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