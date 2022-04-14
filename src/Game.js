import { Config } from './Config';
import {Controller} from './Controller';
import { RenderMatrix } from './RenderMatrix';
import { createGame } from './RabbitWolf';
import { useState } from 'react';


const Game = () => {
    
    const [game, setGame] = useState()
    const [matrix, setMatrix] = useState()
    const [gameStatus, setGameStatus] = useState("continued")

    return (
        <div className='game'>

            <Config setSize={(mapSize) => {
                const game = createGame()
                setMatrix(game.start(mapSize))
                setGame(game)
                setGameStatus("continued")
            }}/>

            {gameStatus === "continued" ? <RenderMatrix matrix={matrix}/> : 
            <h1 className={gameStatus}>You {gameStatus}</h1>
            }

            <Controller getKey={(key) => {
                const [newMatrix, status] = game.step(key)
                setMatrix([...newMatrix])
                setGameStatus(status)
            }}/>

        </div>
    );
}

export { Game }
