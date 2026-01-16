import { GameBoard } from './components/GameBoard'

function App() {
  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="text-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Baseball Poker</h1>
        <p className="text-gray-400 mt-1 text-sm">프로토타입 v0.2.0</p>
      </header>
      <GameBoard />
    </div>
  )
}

export default App
