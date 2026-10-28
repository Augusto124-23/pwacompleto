import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import { api, setAuth } from '../api'
import '../App.css'

export default function Login() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Ajusta la ruta o el payload si tu backend cambió de endpoint
      const response = await api.post('/auth/login', { email, password })
      
      // Valida si tu backend devuelve el token directamente o dentro de otro objeto (ej: response.data.data.token)
      const { token } = response.data

      if (token) {
        localStorage.setItem('token', token)
        setAuth(token)
      }

      // Redirige al dashboard o ruta protegida
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err)
      const msg = err.response?.data?.message || err.message || 'Error de conexión con el servidor.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="background-shape shape-one"></div>
        <div className="background-shape shape-two"></div>
      </div>

      <section className="login-card">
        <div className="logo-container">
          <img src={logoImg} className="app-logo" alt="Logo" />
        </div>

        <div className="login-header">
          <h1>Proyecto</h1>
          <p>Bienvenido de nuevo 👋</p>
          <span>Inicia sesión para continuar</span>
        </div>

        {error && <div className="alert" style={{ marginTop: '12px', color: '#ff6b6b' }}>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="password-label">
              <label htmlFor="password">Contraseña</label>
            </div>

            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c5 0 8.5 4 9.5 6-.4.8-1.4 2.1-2.9 3.3" />
                    <path d="M6.6 6.6C4.5 8 3.3 9.6 2.5 10c1 2 4.5 6 9.5 6 1 0 2-.2 2.9-.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </form>

        <div className="register-section">
          <span>¿No tienes una cuenta?</span>
          <Link to="/register">Crear una cuenta</Link>
        </div>

        <div className="login-footer">
          <span>© 2026 To-Do PWA</span>
          <span>•</span>
          <span>Organiza. Planea. Cumple.</span>
        </div>
      </section>
    </main>
  )
}