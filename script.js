const FREE_CELL = 0
const RABBIT = 1
const WOLF = 2
const WALL = 3
const HOME = 4
const X = 0
const Y = 1
let matrix
let board
let isGameInProcess = false
let MAP_SIZE = 7
let WOLFCOUNT = 3
let WALLCOUNT = 2


const CHARACTERS = {
    [RABBIT]: {
        src: 'images/rabbit.png',
        allowedMoves: [FREE_CELL, WOLF, HOME],
    },
    [WOLF]: {
        src: 'images/wolf.png',
        allowedMoves: [FREE_CELL, RABBIT]
    },
    [WALL]: {
        src: 'images/wall.png'

    },
    [HOME]: {
        src: 'images/home.png'
    }
}

const getPossibleNextCoordinates = (currentCoordinates) => {
    return [
        [currentCoordinates[X], currentCoordinates[Y] - 1],
        [currentCoordinates[X] - 1, currentCoordinates[Y]],
        [currentCoordinates[X], currentCoordinates[Y] + 1],
        [currentCoordinates[X] + 1, currentCoordinates[Y]],
    ]
}

const getKeyCodeIndex = (keyCode) => {
    const keyCodeIndex = {
        37: 0,
        38: 1,
        39: 2,
        40: 3
    }
    return keyCodeIndex[keyCode]
}

const setConfig = () => {
    isGameInProcess = true
    MAP_SIZE = parseInt(document.getElementById('mapSizeSelector').value)
    WOLFCOUNT = Math.floor(MAP_SIZE / 2) + 1
    WALLCOUNT = Math.floor(MAP_SIZE / 2)
}

const createMatrix = () => {
    matrix = new Array(MAP_SIZE)
        .fill(FREE_CELL)
        .map(() => new Array(MAP_SIZE).fill(FREE_CELL));
}

const boardInDisplay = () => {
    board = document.getElementById('container')
    board.style.width = `${MAP_SIZE * 64}px`
    board.innerHTML = ''
    matrix.forEach((x, indexX) => {
        x.forEach((y, indexY) => {
            const cell = document.createElement('div')
            cell.id = `${indexX}${indexY}`
            board.appendChild(cell)
        })
    })
}

const getRandomCoord = (max) => {
    return Math.floor(Math.random() * max)
}

const getRandomFreeCoords = (board) => {
    const randomX = getRandomCoord(MAP_SIZE)
    const randomY = getRandomCoord(MAP_SIZE)
    if (board[randomX][randomY] === FREE_CELL) {
        return [randomX, randomY]
    }
    return getRandomFreeCoords(matrix)
}

const fillBoardWithSingleCharacter = (character) => {
    const [x, y] = getRandomFreeCoords(matrix)
    matrix[x][y] = character
    const img = document.createElement('img')
    img.src = CHARACTERS[character].src
    document.getElementById(`${x}${y}`).appendChild(img)
}

const fillBoardWithCharacter = (character, count) => {
    for (let i = 0; i < count; i++) {
        fillBoardWithSingleCharacter(character)
    }
}

const fillBoardWithCharacters = () => {
    fillBoardWithCharacter(RABBIT, 1)
    fillBoardWithCharacter(HOME, 1)
    fillBoardWithCharacter(WOLF, WOLFCOUNT)
    fillBoardWithCharacter(WALL, WALLCOUNT)
}

const startGame = () => {
    setConfig()
    createMatrix()
    boardInDisplay()
    fillBoardWithCharacters()
}

const getCharactersCoordinates = (character, matrix) => {
    let charactersPositions = []

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            if (matrix[y][x] === character) {
                charactersPositions.push([y, x])
            }
        }
    }
    return charactersPositions
}

const getNewCoordinates = (currentCoordinates, keyCode) => {
    const neighborCoordinates = getPossibleNextCoordinates(currentCoordinates)
    const keyCodeIndex = getKeyCodeIndex(keyCode)
    return neighborCoordinates[keyCodeIndex]
}

const checkTeleportation = (newCoordinates) => {
    let [newX, newY] = newCoordinates

    if (newX >= MAP_SIZE) {
        newX = 0
    } else if (newX <= -1) {
        newX = MAP_SIZE - 1
    } else if (newY >= MAP_SIZE) {
        newY = 0
    } else if (newY <= -1) {
        newY = MAP_SIZE - 1
    }
    return [newX, newY]
}

const moveOneCharacter = (character, [currentX, currentY], newCoordinates) => {
    const [newX, newY] = newCoordinates
    matrix[currentX][currentY] = FREE_CELL
    matrix[newX][newY] = character
    const characterHTMLElement = document.getElementById(`${currentX}${currentY}`).firstChild
    document.getElementById(`${currentX}${currentY}`).removeChild
    document.getElementById(`${newX}${newY}`).appendChild(characterHTMLElement)
}

const isStepAllowed = (character, newCoordinates) => {
    for (let i = 0; i < CHARACTERS[character].allowedMoves.length; i++) {
        if (matrix[newCoordinates[X]][newCoordinates[Y]] == CHARACTERS[character].allowedMoves[i]) {
            return true
        }
    }
    return false
}

const youLoseOrWin = (status) => {
    isGameInProcess = false
    matrix = []
    board.innerHTML = `<h2 class="${status}Game">!!!YOU ${status} !!!</h2>`
}

const checkLoseOrWin = (coordinates) => {
    const [x, y] = coordinates
    if (matrix[x][y] === WOLF) {
        youLoseOrWin('LOSE')
        return true
    } else if (matrix[x][y] === RABBIT) {
        youLoseOrWin('LOSE')
        return true
    } else if (matrix[x][y] === HOME) {
        youLoseOrWin('WIN')
        return true
    }
    return false
}

const filterAllowedCoordinates = (coordinates) => {
    return coordinates.filter((cord) => {
        return (cord[X] >= 0 && cord[Y] >= 0 && cord[X] < MAP_SIZE && cord[Y] < MAP_SIZE && isStepAllowed(WOLF, cord))
    })
}

const getPythagoras = (coordinate) => {
    const rabbitCoordinate = getCharactersCoordinates(RABBIT, matrix)[0]
    return Math.sqrt(Math.pow(coordinate[X] - rabbitCoordinate[X], 2) + Math.pow(coordinate[Y] - rabbitCoordinate[Y], 2))
}

const getShortestCoordinateIndex = (possibleCoordinates, wolf) => {
    const pythagoras = possibleCoordinates.map(coordinate => {
        return getPythagoras(coordinate)
    })
    let index = 0
    for (let i = 0; i < pythagoras.length; i++) {
        if (pythagoras[i] < pythagoras[index]) {
            index = i
        }
    }
    return index
}

const moveWolves = () => {
    getCharactersCoordinates(WOLF, matrix)
        .forEach(wolf => {
            if (isGameInProcess) {
                const possibleCoordinates = filterAllowedCoordinates(getPossibleNextCoordinates(wolf))
                const shortestCoordinateIndex = getShortestCoordinateIndex(possibleCoordinates)
                if (checkLoseOrWin(possibleCoordinates[shortestCoordinateIndex])) {
                    return
                }
                moveOneCharacter(WOLF, wolf, possibleCoordinates[shortestCoordinateIndex])
            }
        })
}

const moveRabbit = (event) => {
    const currentCoordinates = getCharactersCoordinates(RABBIT, matrix)[0]
    const newCoordinates = checkTeleportation(getNewCoordinates(currentCoordinates, event.keyCode))
    if (checkLoseOrWin(newCoordinates)) {
        return
    }
    if (isStepAllowed(RABBIT, newCoordinates)) {
        moveOneCharacter(RABBIT, currentCoordinates, newCoordinates)
        moveWolves()
    }
}

window.addEventListener("keyup", event => {
    if (event.keyCode < 37 || event.keyCode > 40) {
        return
    }
    if (isGameInProcess) {
        moveRabbit(event)
    }
})


