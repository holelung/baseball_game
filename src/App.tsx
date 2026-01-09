import { GameBoard } from './components/GameBoard'

function App() {
  return (
    <div className="min-h-screen p-4">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">⚾ 야구 덱빌딩</h1>
        <p className="text-gray-300 mt-2">프로토타입 v0.1</p>
      </header>
      <GameBoard />
    </div>
  )
}

export default App
