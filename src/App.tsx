import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="min-h-screen bg-[#0A0E17] text-white flex items-center justify-center"><h1 className="text-4xl font-bold">Whales Market</h1></div>} />
    </Routes>
  )
}

export default App
