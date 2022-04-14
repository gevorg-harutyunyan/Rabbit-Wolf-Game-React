import { useState } from "react"

const Config = ({ setSize }) => {

    const [mapSize, setMapSize] = useState(5)

    return (
        <>
            <select id="mapSize" onChange={(e) => setMapSize(parseInt(e.target.value))}>
                <option value="5" >5X5</option>
                <option value="7" >7X7</option>
                <option value="9" >9X9</option>
            </select>
            <button onClick={() => setSize(mapSize)}>Play Game</button>
        </>
    )
}

export { Config }