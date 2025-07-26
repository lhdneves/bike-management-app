import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../useAuth'
import { authAPI } from '../../utils/api'

// Mock the API
jest.mock('../../utils/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
  },
}))

const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>

describe('useAuth Hook', () => {
  let localStorageMock: { [key: string]: string }

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {}
    
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      return localStorageMock[key] || null
    })
    
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value
    })
    
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete localStorageMock[key]
    })

    // Reset API mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const renderUseAuth = () => {
    return renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })
  }

  describe('Initial State', () => {
    it('should initialize with loading state', () => {
      const { result } = renderUseAuth()
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
    })

    it('should load user from localStorage if available', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '123456789',
        role: 'BIKE_OWNER',
        createdAt: new Date(),
      }
      const mockToken = 'mock-jwt-token'

      localStorageMock['user'] = JSON.stringify(mockUser)
      localStorageMock['token'] = mockToken

      const { result } = renderUseAuth()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
    })

    it('should handle invalid localStorage data', async () => {
      localStorageMock['user'] = 'invalid-json'
      localStorageMock['token'] = 'some-token'

      const { result } = renderUseAuth()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
    })
  })

  describe('Login Function', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '123456789',
        role: 'BIKE_OWNER',
        createdAt: new Date(),
      }
      const mockToken = 'jwt-token'
      const loginData = { email: 'test@example.com', password: 'password123' }

      mockAuthAPI.login.mockResolvedValue({
        success: true,
        message: 'Login successful',
        data: { user: mockUser, token: mockToken },
      })

      const { result } = renderUseAuth()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login(loginData)
      })

      expect(loginResult.success).toBe(true)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken)
    })

    it('should handle login failure', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' }

      mockAuthAPI.login.mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
        errors: [{ field: 'password', message: 'Invalid password' }],
      })

      const { result } = renderUseAuth()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login(loginData)
      })

      expect(loginResult.success).toBe(false)
      expect(loginResult.message).toBe('Invalid credentials')
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
    })

    it('should handle network errors', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' }

      mockAuthAPI.login.mockRejectedValue({
        response: {
          data: {
            message: 'Network error',
            errors: [],
          },
        },
      })

      const { result } = renderUseAuth()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login(loginData)
      })

      expect(loginResult.success).toBe(false)
      expect(loginResult.message).toBe('Network error')
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Register Function', () => {
    it('should register successfully', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'New User',
        email: 'new@example.com',
        phoneNumber: '123456789',
        role: 'BIKE_OWNER',
        createdAt: new Date(),
      }
      const mockToken = 'jwt-token'
      const registerData = {
        name: 'New User',
        email: 'new@example.com',
        confirmEmail: 'new@example.com',
        phone: '123456789',
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
      }

      mockAuthAPI.register.mockResolvedValue({
        success: true,
        message: 'Registration successful',
        data: { user: mockUser, token: mockToken },
      })

      const { result } = renderUseAuth()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let registerResult: any
      await act(async () => {
        registerResult = await result.current.register(registerData)
      })

      expect(registerResult.success).toBe(true)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
    })

    it('should handle registration failure', async () => {
      const registerData = {
        name: 'New User',
        email: 'existing@example.com',
        confirmEmail: 'existing@example.com',
        phone: '123456789',
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
      }

      mockAuthAPI.register.mockResolvedValue({
        success: false,
        message: 'Email already exists',
        errors: [{ field: 'email', message: 'Email is already registered' }],
      })

      const { result } = renderUseAuth()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let registerResult: any
      await act(async () => {
        registerResult = await result.current.register(registerData)
      })

      expect(registerResult.success).toBe(false)
      expect(registerResult.message).toBe('Email already exists')
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Logout Function', () => {
    it('should logout and clear data', async () => {
      // Setup authenticated state
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '123456789',
        role: 'BIKE_OWNER',
        createdAt: new Date(),
      }
      localStorageMock['user'] = JSON.stringify(mockUser)
      localStorageMock['token'] = 'mock-token'

      const { result } = renderUseAuth()

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    })
  })
})