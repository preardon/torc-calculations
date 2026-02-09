import FormulaEditor from './components/FormulaEditor';
import './App.css'

function App() {
  return (
    <>
      <div className="card">
        <h1>Torc Calculations and automations</h1>
        <p>
          Configure your formula below.
        </p>
        <FormulaEditor />
      </div>
    </>
  )
}

export default App
