import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

// createRoot is the React 18 API for rendering.
// StrictMode renders components twice in development to help catch bugs —
// you may notice double API calls in the console; that's expected.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
