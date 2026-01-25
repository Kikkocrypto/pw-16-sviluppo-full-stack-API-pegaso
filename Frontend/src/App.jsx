import { useState } from 'react'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Project work 16 by Francesco Damiano</h1>
        <p>Sistema di gestione appuntamenti per una clinica privata</p>
      </header>
      <main className="app-main">
        <HomePage />
      </main>
    </div>
  )
}

export default App
