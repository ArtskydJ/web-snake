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
