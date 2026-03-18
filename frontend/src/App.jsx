import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MyLearning from './pages/MyLearning'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-learning" element={<MyLearning />} />
      </Routes>
    </Router>
  )
}

export default App
