import { User } from '@/data/mock'
import { mockApi } from './mockApi'

const SESSION_KEY = 'demo_mvp_session'

export interface AuthResponse {
  token: string
  user: User
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const getRandomDelay = () => Math.random() * 600 + 200

export const mockAuth = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    await delay(getRandomDelay())

    const user = await mockApi.findUserByEmail(email)

    if (!user) {
      throw new Error('Invalid email or password')
    }

    if (user.password !== password) {
      throw new Error('Invalid email or password')
    }

    const token = `mock-token-${Date.now()}`
    const session = { token, user }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))

    return session
  },

  async signOut(): Promise<void> {
    await delay(300)
    localStorage.removeItem(SESSION_KEY)
  },

  async signUpStudent(formData: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }): Promise<AuthResponse> {
    await delay(getRandomDelay())

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const existingUser = await mockApi.findUserByEmail(formData.email)
    if (existingUser) {
      throw new Error('Email already exists')
    }

    const newUser = await mockApi.createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'student'
    })

    const token = `mock-token-${Date.now()}`
    const session = { token, user: newUser }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))

    return session
  },

  async signUpInstructor(formData: {
    name: string
    email: string
    password: string
    confirmPassword: string
    instructorTitle?: string
    bio?: string
  }): Promise<AuthResponse> {
    await delay(getRandomDelay())

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const existingUser = await mockApi.findUserByEmail(formData.email)
    if (existingUser) {
      throw new Error('Email already exists')
    }

    const newUser = await mockApi.createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'instructor',
      bio: formData.bio
    })

    const token = `mock-token-${Date.now()}`
    const session = { token, user: newUser }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))

    return session
  },

  getSession(): AuthResponse | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      console.warn('Failed to parse session')
    }
    return null
  },

  async switchUser(userId: string): Promise<AuthResponse> {
    await delay(300)

    const user = await mockApi.findUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const token = `mock-token-${Date.now()}`
    const session = { token, user }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))

    return session
  }
}
