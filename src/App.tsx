import { useState } from 'react'
import ConfigEditor, { defaultGlobalConfig, type ConfigurationSchema} from "./components/visualArray"
import ModelView from "./components/modelView"

const savedDat = localStorage.getItem('anim-dat') || JSON.stringify(defaultGlobalConfig)
const startingJSON = JSON.parse(savedDat)
console.log(savedDat)
console.log(startingJSON)

export const primaryScroll='overflow-y-auto scrollbar-thin scrollbar-track-primary-900 scrollbar-thumb-primary-400'

export default function App() {
  // const [jsonResult, setJsonResult] = useState<ArrayItem[]>([]);
  const [output, setOutput] = useState<ConfigurationSchema>(startingJSON);

  const handleDataChange = (updatedArray: ConfigurationSchema): void => {
    setOutput(updatedArray);
    localStorage.setItem("anim-dat",JSON.stringify(updatedArray))
  };

  return (
    <div className='flex bg-primary-800 text-primary-200 gap-2 h-screen'>
    <section id="input" className={`w-[50%]`}>
      <ModelView config={output}/>
      {/* <div className="shrink-0 h-[300vh] bg-primary-700 p-2">
      </div> */}
    </section>
    <section id="input" className={`w-[50%] flex flex-col gap-4 border-l-2 border-primary-500 pl-8 ${primaryScroll}`}>
      <ConfigEditor initialConfig={startingJSON} onChange={handleDataChange} />
      <h3>Output JSON Payload:</h3>
      <pre className='w-full rounded-[5rem] p-12 bg-primary-900'>
        <code>{JSON.stringify(output, null, 2)}</code>
      </pre>
      </section>
    </div>
  )
}