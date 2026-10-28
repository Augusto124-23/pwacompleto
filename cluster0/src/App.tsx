import { useState } from 'react'
import heroImg from './assets/hero.png'
import { api, setAuth } from './api'
import './App.css'

export default function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // Estados de los formularios
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Estados de interfaz
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Petición de Login
        const response = await api.post('/auth/login', { email, password })
        const { token } = response.data
        
        // Guardar token y configurar axios header
        localStorage.setItem('token', token)
        setAuth(token)
        
        alert('¡Inicio de sesión exitoso!')
      } else {
        // Petición de Registro
        await api.post('/auth/register', { name, email, password })
        
        alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const toggleView = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="background-shape shape-one"></div>
        <div className="background-shape shape-two"></div>
      </div>

      <section className="login-card">
        {/* Logo */}
        <div className="logo-container">
          <img src={heroImg} className="app-logo" alt="To-Do PWA" />
        </div>

        {/* Encabezado */}
        <div className="login-header">
          <h1>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h1>
          <p>{isLogin ? 'Bienvenido de nuevo 👋' : 'Únete y comienza a organizar tus tareas'}</p>
        </div>

        {/* Alerta de Error */}
        {error && <div className="alert" style={{ marginTop: '12px' }}>{error}</div>}

        {/* Formulario */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Nombre (Solo en Registro) */}
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">Nombre completo</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
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
                required
              />
            </div>
          </div>

          {/* Contraseña */}
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
                placeholder={isLogin ? '••••••••' : 'Mínimo 6 caracteres'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Mostrar u ocultar contraseña"
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

          {/* Botón */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </form>

        {/* Cambio entre Login y Registro */}
        <div className="register-section">
          <span>{isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}</span>
          <button 
            type="button" 
            onClick={toggleView} 
            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600, marginLeft: '6px' }}
          >
            {isLogin ? 'Crear una cuenta' : 'Iniciar sesión'}
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <span>© 2026 To-Do PWA</span>
          <span>•</span>
          <span>Organiza. Planea. Cumple.</span>
        </div>
      </section>
    </main>
  )
}