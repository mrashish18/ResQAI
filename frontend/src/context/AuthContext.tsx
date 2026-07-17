import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { User, RegisterData } from '../types'
import { authAPI } from '../lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setAuthToken = useCallback((newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('resqai_token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('resqai_token')
      localStorage.removeItem('resqai_user')
      delete axios.defaults.headers.common['Authorization']
    }
    setToken(newToken)
  }, [])

  // On mount: check localStorage for existing token and validate it
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('resqai_token')
      const storedUser = localStorage.getItem('resqai_user')

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      // Restore token to axios headers immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      setToken(storedToken)

      // Try to restore user from localStorage first for speed
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          // ignore parse errors
        }
      }

      // Validate token with server
      try {
        const response = await authAPI.me()
        const fetchedUser: User = response.data
        setUser(fetchedUser)
        localStorage.setItem('resqai_user', JSON.stringify(fetchedUser))
      } catch {
        // Token is invalid or expired - clear everything
        setUser(null)
        setToken(null)
        localStorage.removeItem('resqai_token')
        localStorage.removeItem('resqai_user')
        delete axios.defaults.headers.common['Authorization']
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    const { access_token, user: loggedInUser } = response.data

    setAuthToken(access_token)
    setUser(loggedInUser)
    localStorage.setItem('resqai_user', JSON.stringify(loggedInUser))
  }, [setAuthToken])

  const register = useCallback(async (data: RegisterData) => {
    const response = await authAPI.register(data)
    const { access_token, user: registeredUser } = response.data

    setAuthToken(access_token)
    setUser(registeredUser)
    localStorage.setItem('resqai_user', JSON.stringify(registeredUser))
  }, [setAuthToken])

  const logout = useCallback(() => {
    setUser(null)
    setAuthToken(null)
  }, [setAuthToken])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('resqai_user', JSON.stringify(updatedUser))
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
