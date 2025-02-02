const gameBoard = document.getElementById("game-board")
const scoreElement = document.getElementById("score")
const widthInput = document.getElementById("width")
const heightInput = document.getElementById("height")
const startButton = document.getElementById("start")
const speedSlider = document.getElementById("speed")
const speedValue = document.getElementById("speed-value")

let snake = []
let food = {}
let adversaries = []
let direction = "right"
let gameLoop
let gameStartTime
let score = 0
let gameSpeed = 100
let baseScore = 0

function initializeGame() {
  clearInterval(gameLoop)
  snake = [{ x: 10, y: 10 }]
  food = generateFood()
  adversaries = []
  direction = "right"
  baseScore = 0
  score = 0
  gameStartTime = Date.now()
  updateScore()
  createGameBoard()
  gameSpeed = 200 - speedSlider.value
  gameLoop = setInterval(moveSnake, gameSpeed)
}

function createGameBoard() {
  const width = Number.parseInt(widthInput.value)
  const height = Number.parseInt(heightInput.value)
  gameBoard.style.setProperty("--width", width)
  gameBoard.style.setProperty("--height", height)
  gameBoard.innerHTML = ""
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = document.createElement("div")
      cell.classList.add("cell")
      cell.dataset.x = x
      cell.dataset.y = y
      gameBoard.appendChild(cell)
    }
  }
  updateGameBoard()
}

function updateGameBoard() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("snake", "food", "adversary")
  })

  snake.forEach((segment) => {
    const cell = document.querySelector(`.cell[data-x="${segment.x}"][data-y="${segment.y}"]`)
    if (cell) cell.classList.add("snake")
  })

  const foodCell = document.querySelector(`.cell[data-x="${food.x}"][data-y="${food.y}"]`)
  if (foodCell) foodCell.classList.add("food")

  adversaries.forEach((adversary) => {
    const cell = document.querySelector(`.cell[data-x="${adversary.x}"][data-y="${adversary.y}"]`)
    if (cell) cell.classList.add("adversary")
  })
}

function moveSnake() {
  const head = { ...snake[0] }

  switch (direction) {
    case "up":
      head.y--
      break
    case "down":
      head.y++
      break
    case "left":
      head.x--
      break
    case "right":
      head.x++
      break
  }

  if (isCollision(head)) {
    gameOver()
    return
  }

  snake.unshift(head)

  if (head.x === food.x && head.y === food.y) {
    food = generateFood()
    baseScore++
    updateScore()
  } else {
    snake.pop()
  }

  const currentTime = Date.now()
  if (currentTime - gameStartTime >= 10000) {
    gameStartTime = currentTime
    addAdversary()
  }

  moveAdversaries()
  updateGameBoard()
}

function isCollision(position) {
  const width = Number.parseInt(widthInput.value)
  const height = Number.parseInt(heightInput.value)

  if (
    position.x < 0 ||
    position.x >= width ||
    position.y < 0 ||
    position.y >= height ||
    snake.some((segment) => segment.x === position.x && segment.y === position.y) ||
    adversaries.some((adversary) => adversary.x === position.x && adversary.y === position.y)
  ) {
    return true
  }

  return false
}

function generateFood() {
  const width = Number.parseInt(widthInput.value)
  const height = Number.parseInt(heightInput.value)
  let newFood
  do {
    newFood = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
    }
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y) ||
    adversaries.some((adversary) => adversary.x === newFood.x && adversary.y === newFood.y)
  )
  return newFood
}

function addAdversary() {
  const width = Number.parseInt(widthInput.value)
  const height = Number.parseInt(heightInput.value)
  let newAdversary
  do {
    newAdversary = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      direction: ["up", "down", "left", "right"][Math.floor(Math.random() * 4)],
    }
  } while (
    snake.some((segment) => segment.x === newAdversary.x && segment.y === newAdversary.y) ||
    (food.x === newAdversary.x && food.y === newAdversary.y) ||
    adversaries.some((adversary) => adversary.x === newAdversary.x && adversary.y === newAdversary.y)
  )
  adversaries.push(newAdversary)
}

function moveAdversaries() {
  adversaries.forEach((adversary) => {
    const newPosition = { ...adversary }

    switch (adversary.direction) {
      case "up":
        newPosition.y--
        break
      case "down":
        newPosition.y++
        break
      case "left":
        newPosition.x--
        break
      case "right":
        newPosition.x++
        break
    }

    if (isCollision(newPosition)) {
      adversary.direction = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)]
    } else {
      adversary.x = newPosition.x
      adversary.y = newPosition.y
    }
  })
}

function updateScore() {
  const speedMultiplier = (200 - gameSpeed) / 100
  score = Math.round(baseScore * speedMultiplier)
  scoreElement.textContent = `Score: ${score}`
}

function gameOver() {
  clearInterval(gameLoop)
  alert(`Game Over! Your score: ${score}`)
  initializeGame()
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (direction !== "down") direction = "up"
      break
    case "ArrowDown":
      if (direction !== "up") direction = "down"
      break
    case "ArrowLeft":
      if (direction !== "right") direction = "left"
      break
    case "ArrowRight":
      if (direction !== "left") direction = "right"
      break
  }
})

startButton.addEventListener("click", initializeGame)

widthInput.addEventListener("change", createGameBoard)
heightInput.addEventListener("change", createGameBoard)

createGameBoard()

speedSlider.addEventListener("input", () => {
  gameSpeed = 200 - speedSlider.value
  clearInterval(gameLoop)
  gameLoop = setInterval(moveSnake, gameSpeed)
  const speedMultiplier = speedSlider.value / 100
  speedValue.textContent = `${speedMultiplier.toFixed(2)}x`
  updateScore()
})

