import {FC, FormEvent, useState} from "react";
import Sidebar                   from "./sidebar";
import Actionbar                 from "./actionbar";
import Canvas                    from "./canvas";

const EditorView: FC = () => {
  return <div className="relative bg-base-300 w-screen h-screen flex overflow-hidden">
    <Sidebar/>
    <EditorViewport/>
    <div className="absolute top-3 right-4">
      <Actionbar/>
    </div>
  </div>
}

export const EditorViewport: FC = () => {
  const [[x, y], setTranslate] = useState([0, 0]);

  const handleStartPan = (e: any) => {
    const onUp   = () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mousemove", onMove);
    }
    const onMove = (e: any) => setTranslate(([oldX, oldY]) => [oldX + e.movementX, oldY + e.movementY])
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mousemove", onMove);
  }

  return <div onMouseDown={event => event.button === 1 && handleStartPan(event)} className="relative flex flex-grow items-center justify-center overflow-hidden">
    <div className="rounded-lg border border-dashed border-divider" style={{
      transform: `translate3d(${x}px, ${y}px, 0px)`,
    }}>
      <Canvas/>
    </div>
    <div className="absolute bottom-4"><STTInput/></div>
  </div>
}

const STTInput: FC = () => {
  const [inputValue, setInputValue] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue)
      return;
    setInputValue('');
    // window.API.pubsub.publish("inputfield.final", inputValue, {replicate: true});
  }

  const handleChange = (e: string) => {
    // window.API.pubsub.publish("inputfield.interim", e, {replicate: true});
    setInputValue(e);
  }

  return <div className="flex items-center space-x-2 p-4 w-96">
    {/* <button className="btn btn-circle btn-ghost"><RiChatDeleteFill/></button> */}
    <form onSubmit={submit} className="w-full">
      <input autoComplete="off" name="sttimput" placeholder="Type something and press [Enter]" className="w-full input" value={inputValue} onChange={e => handleChange(e.target.value)}/>
    </form>
  </div>
}

export default EditorView;
