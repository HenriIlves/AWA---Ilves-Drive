import { useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { getTheme } from './theme'
import Header from './components/Header'
import Register from './components/Register'
import Login from './components/Login'
import Welcome from './components/Welcome'
import HomePage from './components/HomePage'
import NewDocument from './components/NewDocument'
import DocumentView from './components/DocumentView'
import DocumentEdit from './components/DocumentEdit'
import PublicDocumentView from './components/PublicDocumentView'
import ProtectedRoute from './components/ProtectedRoute'
import './i18n'

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })

  const handleThemeChange = () => {
    setThemeMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', newMode)
      return newMode
    })
  }

  return (
    <ThemeProvider theme={getTheme(themeMode)}>
      <CssBaseline />
      <BrowserRouter>
        <Header 
          theme={themeMode}
          onThemeChange={handleThemeChange}
        />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/new"
            element={
              <ProtectedRoute>
                <NewDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/:documentId"
            element={
              <ProtectedRoute>
                <DocumentView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/:documentId/edit"
            element={
              <ProtectedRoute>
                <DocumentEdit />
              </ProtectedRoute>
            }
          />
          <Route path="/public/:documentId" element={<PublicDocumentView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App