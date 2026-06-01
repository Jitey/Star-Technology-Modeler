import React from 'react'
import { useStore } from './store/index.js'
import Header from './components/Header.jsx'
import RecipesView from './components/RecipesView.jsx'
import MachinesView from './components/MachinesView.jsx'
import ChainsView from './components/ChainsView.jsx'
import './App.css'

export default function App() {
  const activeView = useStore(s => s.activeView)

  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        {activeView === 'recipes' && <RecipesView />}
        {activeView === 'machines' && <MachinesView />}
        {activeView === 'chains' && <ChainsView />}
      </main>
    </div>
  )
}
