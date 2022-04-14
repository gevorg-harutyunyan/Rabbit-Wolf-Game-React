import { CHARACTERS } from "./RabbitWolf"


const RenderMatrix = ({ matrix }) => {

    if (matrix === undefined) {
        return null
    }

    return (
        <div id="container">
            <table>
                <tbody>
                    {matrix.map((row, X) => {
                        return (
                            <tr key={X + ""}>{
                                row.map((cell, Y) => {
                                    return <td key={X + "" + Y}>
                                        {CHARACTERS.hasOwnProperty(cell) ? <img src={CHARACTERS[cell].url}></img> : <></>}
                                    </td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export { RenderMatrix }