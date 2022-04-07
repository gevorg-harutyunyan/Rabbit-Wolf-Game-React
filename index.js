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



const createGame = (_containerID, _mapSizeID) => {
    const container = document.getElementById(_containerID)
    let matrix = []
    let config = createConfig(document.getElementById(_mapSizeID).value)

    const fillMatrix = () => {
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

    const setCharacter = (_character, _position) => {
        matrix[_position[X]][_position[Y]] = _character
    }

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

    const render = () => {
        container.innerHTML = ""
        const table = document.createElement('table')
        for (let x = 0; x < config.MAP_SIZE; x++) {
            const tr = document.createElement('tr')
            for (let y = 0; y < config.MAP_SIZE; y++) {
                const td = document.createElement('td')
                if (matrix[x][y] !== FREE_SPACE) {
                    const img = document.createElement('img')
                    img.src = CHARACTERS[matrix[x][y]].url
                    td.appendChild(img)
                }
                tr.appendChild(td)
            }
            table.appendChild(tr)
        }
        container.appendChild(table)
    }

    const getCharacterPositions = character => {
        let result = []
        for (let x = 0; x < config.MAP_SIZE; x++) {
            for (let y = 0; y < config.MAP_SIZE; y++) {
                if (matrix[x][y] === character) {
                    result.push([x, y])
                }
            }
        }
        return result
    }

    const checkTeleport = (_position, mapSize) => {
        if (_position[X] === mapSize) {
            _position[X] = 0
        } else if (_position[X] === -1) {
            _position[X] = mapSize - 1
        }
        if (_position[Y] === mapSize) {
            _position[Y] = 0
        } else if (_position[Y] === -1) {
            _position[Y] = mapSize - 1
        }
        return [_position[X], _position[Y]]
    }

    const isAvailableField = (character, _position) => {
        const availableFields = CHARACTERS[character].availableFields
        for (let i = 0; i < availableFields.length; i++) {
            if (matrix[_position[X]][_position[Y]] === availableFields[i]) {
                return true
            }
        }
        return false
    }

    const isWinOrLose = (_position1, _position2) => {
        const position1 = matrix[_position1[X]][_position1[Y]]
        const position2 = matrix[_position2[X]][_position2[Y]]
        if (position1 === RABBIT && position2 === HOME) {
            config.isGameInProcess = false
            container.innerHTML = '<h1 class="win">You Win</h1>'
        } else if (
            (position1 === RABBIT && position2 === WOLF)
            ||
            (position1 === WOLF && position2 === RABBIT)) {
            config.isGameInProcess = false
            container.innerHTML = '<h1 class="lose">You Lose</h1>'
        }
    }

    const characterStep = (_currentPosition, _nextPosition) => {
        isWinOrLose(_currentPosition, _nextPosition)
        matrix[_nextPosition[X]][_nextPosition[Y]] = matrix[_currentPosition[X]][_currentPosition[Y]]
        matrix[_currentPosition[X]][_currentPosition[Y]] = FREE_SPACE
        if (config.isGameInProcess) {
            render()
        }
    }

    const neighborPositions = currentPosicion => {
        return [
            [currentPosicion[X], currentPosicion[Y] + 1],
            [currentPosicion[X], currentPosicion[Y] - 1],
            [currentPosicion[X] + 1, currentPosicion[Y]],
            [currentPosicion[X] - 1, currentPosicion[Y]]
        ]
    }
    
    const filterIllegalPositions = neighborPositions => {
        return neighborPositions.filter(position => position[X] >= 0 && position[X] < config.MAP_SIZE && position[Y] >= 0 && position[Y] < config.MAP_SIZE)
    }

    const filterUnavailableFields = positions => positions.filter(position => isAvailableField(WOLF, position))

    const getDistancesFromRabbit = positions => {
        const rabbit = getCharacterPositions(RABBIT)[0]
        const distances = positions.map(position => Math.sqrt((position[X] - rabbit[X]) ** 2 + (position[Y] - rabbit[Y]) ** 2))
        return {
            distances,
            positions
        }
    }

    const getOptimalPosition = ({distances, positions}) =>  positions[distances.indexOf(Math.min(...distances))]

    const wolfNextPosition = compose(
        getOptimalPosition,
        getDistancesFromRabbit,
        filterUnavailableFields,
        filterIllegalPositions,
        neighborPositions
    )

    const wolvesStep = () => {
        getCharacterPositions(WOLF)
            .forEach(wolf => {
                if (config.isGameInProcess) {
                    characterStep(wolf, wolfNextPosition(wolf))
                }
            })
    }

    const rabbitStep = _coordinates => {
        const currentPosition = getCharacterPositions(RABBIT)[0]
        const nextPosition = checkTeleport([currentPosition[X] + _coordinates[X], currentPosition[Y] + _coordinates[Y]], config.MAP_SIZE)

        if (!config.isGameInProcess) {
            return
        }
        if (isAvailableField(RABBIT, nextPosition)) {
            characterStep(currentPosition, nextPosition)
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

    const start = (_mapSizeID) => {
        config = createConfig(document.getElementById(_mapSizeID).value)
        config.isGameInProcess = true
        fillMatrix()
        fillMatrixWithCharacters()
        render()
    }

    return {
        start,
        event
    }
}

const game = createGame('container', 'mapSize')

const play = () => {
    game.start('mapSize')
}

window.addEventListener('keyup', evn => {
        game.event(evn.key)
    })