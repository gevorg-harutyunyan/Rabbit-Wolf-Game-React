
export default function Controller({ getKey }) {
    return (
        <>
            <div><button onClick={() => getKey("ArrowUp")}>&#x21e1;</button></div>
            <button onClick={() => getKey("ArrowLeft")}>&#x21e0;</button>
            <button onClick={() => getKey("ArrowDown")}>&#x21e3;</button>
            <button onClick={() => getKey("ArrowRight")}>&#x21e2;</button>
        </>
    )
}