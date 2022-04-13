import { useState } from 'react';
import './App.css';
import Game from './Game';
import { idGenerator } from './RabbitWolf';

function App() {
  const [gameId, setGameId] = useState([])

  const newGameId = idGenerator()

  return (
    <div className="App">
      <button onClick={() => setGameId(gameId.concat(newGameId))}>New Game</button>

      {gameId.map(id => {
        return <Game key={id}/>
      })}
      
    </div>
  );
}

export default App;
