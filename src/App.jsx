import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TopicPage from './pages/TopicPage'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function App() {
  return (
    <div className="min-h-screen bg-reddot-950 text-reddot-text">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/topics/:id" element={<TopicPage />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  )
}

export default App