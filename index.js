const X = 0, Y = 1
const FREE_SPACE = 0
const RABBIT = 1
const WOLF = 2
const WALL = 3
const HOME = 4

const CHARACTERS = {
    [RABBIT]: {
        url: "images/rabbit.png",
        availableFields: [WOLF, HOME, FREE_SPACE]
    },
    [WOLF]: {
        url: "images/wolf.png",
        availableFields: [RABBIT, FREE_SPACE]
    },
    [WALL]: {
        url: "images/wall.png"
    },
    [HOME]: {
        url: "images/home.png"
    }
}

const isEqual = (a) => (b) => a === b
const calculateDistance = (a) => (b) => Math.sqrt((b[X] - a[X]) ** 2 + (b[Y] - a[Y]) ** 2)
const idGenerator = () => Math.floor(Math.random() * 100000)

const renderMatrix = (container, matrix) => {
    container.innerHTML = ""
    const table = document.createElement('table')
    matrix.forEach(row => {
        const tr = document.createElement('tr')
        row.forEach(cell => {
            const td = document.createElement('td')
            if (cell !== FREE_SPACE) {
                const img = document.createElement('img')
                img.src = CHARACTERS[cell].url
                td.appendChild(img)
            }
            tr.appendChild(td)
        })
        table.appendChild(tr)
    })
    container.appendChild(table)
}

const renderWinOrLose = (container, winOrLose) => {
    container.innerHTML = `<h1 class=${winOrLose}>You ${winOrLose}</h1>`
}

const compose = (...funcs) => {
    if (funcs.length === 0) {
        return arg => arg;
    }
    if (funcs.length === 1) {
        return funcs[0];
    }
    const lastFn = funcs[funcs.length - 1];
    const withoutLastFn = funcs.slice(0, funcs.length - 1);
    return (...args) => compose(...withoutLastFn)(lastFn(...args));
}

const createConfig = _mapSize => {
    const MAP_SIZE = _mapSize * 1
    const WOLF_COUNT = Math.floor(_mapSize / 2) + 1
    const WALL_COUNT = Math.floor(_mapSize / 2)
    let isGameInProcess = false

    return {
        MAP_SIZE,
        WOLF_COUNT,
        WALL_COUNT,
        isGameInProcess
    }
}

const createGame = (container) => {
    let matrix
    let config = createConfig(5)

    const isInRange = (start, end) => (number) => number >= start && number <= end
    let _isInRange = isInRange(0, config.MAP_SIZE - 1)

    const fillMatrix = () => {
        matrix = []
        for (let x = 0; x < config.MAP_SIZE; x++) {
            matrix[x] = []
            for (let y = 0; y < config.MAP_SIZE; y++) {
                matrix[x][y] = FREE_SPACE
            }
        }
    }

    const getFreeRandomPosition = () => {
        const RandomX = Math.floor(Math.random() * config.MAP_SIZE)
        const RandomY = Math.floor(Math.random() * config.MAP_SIZE)
        if (matrix[RandomX][RandomY] === FREE_SPACE) {
            return [RandomX, RandomY]
        }
        return getFreeRandomPosition()
    }

    const setCharacter = (character, [X, Y]) => {
        matrix[X][Y] = character
    }

    const removeCharacter = (position) => setCharacter(FREE_SPACE, position)

    const setCharacters = (character, count = 1) => {
        for (let i = 0; i < count; i++) {
            setCharacter(character, getFreeRandomPosition())
        }
    }

    const fillMatrixWithCharacters = () => {
        setCharacters(RABBIT)
        setCharacters(HOME)
        setCharacters(WOLF, config.WOLF_COUNT)
        setCharacters(WALL, config.WALL_COUNT)
    }

    const getCharacterPositions = character => {
        return matrix.reduce((positions, row, X) => {
            return [...positions, ...row.reduce((rowPositions, cell, Y) => {
                if (cell === character) {
                    return [...rowPositions, [X, Y]]
                }
                return rowPositions
            }, [])]
        }, [])
    }

    const checkTeleport = ([X, Y], mapSize) => {
        const isXEqual = isEqual(X)
        const isYEqual = isEqual(Y)
        if (isXEqual(mapSize)) {
            X = 0
        } else if (isXEqual(-1)) {
            X = mapSize - 1
        }
        if (isYEqual(mapSize)) {
            Y = 0
        } else if (isYEqual(-1)) {
            Y = mapSize - 1
        }
        return [X, Y]
    }

    const isAvailableField = (character, [X, Y]) => {
        return CHARACTERS[character]
            .availableFields
            .some(isEqual(matrix[X][Y]))
    }

    const chackWinOrLose = ([X, Y], [newX, newY]) => {
        const isCurrentPositionEqual = isEqual(matrix[X][Y])
        const isNewPositionEqual = isEqual(matrix[newX][newY])

        if (isCurrentPositionEqual(RABBIT) && isNewPositionEqual(HOME)) {
            return 'Win'
        } else if (
            isCurrentPositionEqual(RABBIT) && isNewPositionEqual(WOLF) ||
            isCurrentPositionEqual(WOLF) && isNewPositionEqual(RABBIT)) {
            return 'Lose'
        }
    }

    const characterStep = ([currentX, currentY], [nextX, nextY]) => {
        const winOrLose = chackWinOrLose([currentX, currentY], [nextX, nextY])
        if (winOrLose === 'Win' || winOrLose === 'Lose') {
            config.isGameInProcess = false
            renderWinOrLose(container, winOrLose)
        }
        const character = matrix[currentX][currentY]
        setCharacter(character, [nextX, nextY])
        removeCharacter([currentX, currentY])
        if (config.isGameInProcess) {
            renderMatrix(container, matrix)
        }
    }

    const neighborPositions = ([X, Y]) => {
        return [
            [X, Y + 1],
            [X, Y - 1],
            [X + 1, Y],
            [X - 1, Y]
        ]
    }

    const filterIllegalPositions = neighborPositions => neighborPositions.filter(([X, Y]) => _isInRange(X) && _isInRange(Y))

    const filterUnavailableFields = positions => positions.filter(position => isAvailableField(WOLF, position))

    const getDistancesFromRabbit = positions => {
        const rabbit = getCharacterPositions(RABBIT)[0]
        const calculateDistanceFromRabbit = calculateDistance(rabbit)
        const distances = positions.map(position => calculateDistanceFromRabbit(position))
        return {
            distances,
            positions
        }
    }

    const getShortestDistancePosition = ({ distances, positions }) => positions[distances.indexOf(Math.min(...distances))]

    const wolfNextPosition = compose(
        getShortestDistancePosition,
        getDistancesFromRabbit,
        filterUnavailableFields,
        filterIllegalPositions,
        neighborPositions
    )

    const wolvesStep = () => {
        getCharacterPositions(WOLF)
            .forEach(wolf => {
                if (config.isGameInProcess) {
                    const nextPosition = wolfNextPosition(wolf)
                    if (nextPosition !== undefined) {
                        characterStep(wolf, nextPosition)
                    }
                }
            })
    }

    const rabbitStep = ([x, y]) => {
        const rabbit = getCharacterPositions(RABBIT)[0]
        const nextPosition = checkTeleport([rabbit[X] + x, rabbit[Y] + y], config.MAP_SIZE)

        if (!config.isGameInProcess) {
            return
        }
        if (isAvailableField(RABBIT, nextPosition)) {
            characterStep(rabbit, nextPosition)
            wolvesStep()
        }
    }

    const stepsPosition = () => {
        return {
            ['ArrowUp']: [-1, 0],
            ['ArrowDown']: [+1, 0],
            ['ArrowRight']: [0, +1],
            ['ArrowLeft']: [0, -1]
        }
    }

    const event = key => {
        if (config.isGameInProcess) {
            const positions = stepsPosition()
            if (positions.hasOwnProperty(key)) {
                rabbitStep(positions[key])
            }
        }
    }

    const start = (mapSize) => {
        config = createConfig(mapSize)
        _isInRange = isInRange(0, config.MAP_SIZE - 1)
        config.isGameInProcess = true
        fillMatrix()
        fillMatrixWithCharacters()
        renderMatrix(container, matrix)
    }

    return {
        start,
        event
    }
}



const newGame = () => {
    const container = document.getElementById('container')
    const id = idGenerator()
    
    const gameBlock = document.createElement('div')

    gameBlock.setAttribute("id", id)
    gameBlock.setAttribute("class", "game")

    gameBlock.innerHTML = `
    <select id="mapSize-${id}">
        <option value="5">5X5</option>
        <option value="7">7X7</option>
        <option value="9">9X9</option>
    </select>
    <button id="playGameButton-${id}">Play Game</button>
    <button id="deleteGameButton-${id}" class="delete">&#x2716;</button>

    <div id="gameContainer-${id}" class="gameContainer"></div>

    <div><button id="ArrowUp-${id}">&#x21e1;</button></div>
    <button id="ArrowLeft-${id}">&#x21e0;</button>
    <button id="ArrowDown-${id}">&#x21e3;</button>
    <button id="ArrowRight-${id}">&#x21e2;</button>
    `

    container.appendChild(gameBlock)
    
    document.getElementById("playGameButton-" + id)
    .onclick = () => game.start(document.getElementById("mapSize-" + id).value)

    document.getElementById("deleteGameButton-" + id)
    .onclick = () => gameBlock.remove()
    
    const gameContainer = document.getElementById("gameContainer-" + id)

    document.getElementById("ArrowLeft-" + id).onclick = () => game.event("ArrowLeft")
    document.getElementById("ArrowUp-" + id).onclick = () => game.event("ArrowUp")
    document.getElementById("ArrowDown-" + id).onclick = () => game.event("ArrowDown")
    document.getElementById("ArrowRight-" + id).onclick = () => game.event("ArrowRight")
    
    const game = createGame(gameContainer)
}