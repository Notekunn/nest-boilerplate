import { Roles } from '@common/enum/role.enum'
import { AuthenticatedRequest } from '@common/interfaces/authenticated-request.interface'
import { LocalAuthGuard } from '@guards/local-auth.guard'
import { TokenResponseDto } from '@modules/auth/dto/token-response.dto'
import { UserEntity } from '@modules/users/entities/user.entity'
import { CommandBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'

import { CreateTokenCommand } from '../cqrs/commands/impl/create-token.command'
import { RegisterByEmailCommand } from '../cqrs/commands/impl/register-by-email.command'
import { RegisterByEmailDto } from '../dto/register-by-email.dto'
import { AuthController } from './auth.controller'

/**
 * Creates a mock user for testing with proper UserEntity type
 */
function createMockUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Roles.User,
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as UserEntity
}

/**
 * Creates a mock authenticated request
 */
function createMockRequest(user: UserEntity): AuthenticatedRequest {
  return { user }
}

describe('AuthController', () => {
  let controller: AuthController
  let commandBus: CommandBus

  const mockUser = createMockUser()

  const mockToken: TokenResponseDto = {
    token: 'mock.jwt.token',
    expiresAt: new Date(Date.now() + 3600000),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()

    controller = module.get<AuthController>(AuthController)
    commandBus = module.get<CommandBus>(CommandBus)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      const mockRequest = createMockRequest(mockUser)
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockToken)

      const result = await controller.login(mockRequest)

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateTokenCommand(mockUser))
      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      })
    })

    it('should create token with user from request', async () => {
      const mockRequest = createMockRequest(mockUser)
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockToken)

      await controller.login(mockRequest)

      const executeCall = (commandBus.execute as jest.Mock).mock.calls[0][0]
      expect(executeCall).toBeInstanceOf(CreateTokenCommand)
      expect(executeCall.user).toEqual(mockUser)
    })

    it('should handle admin user login', async () => {
      const adminUser = createMockUser({
        id: 2,
        email: 'admin@example.com',
        role: Roles.Admin,
      })
      const mockRequest = createMockRequest(adminUser)
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockToken)

      const result = await controller.login(mockRequest)

      expect(result.user).toEqual(adminUser)
      expect(result.token).toEqual(mockToken)
    })
  })

  describe('register', () => {
    it('should create user and return user with token', async () => {
      const dto: RegisterByEmailDto = {
        email: 'newuser@example.com',
        password: 'password123',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockToken)

      const result = await controller.register(dto)

      expect(commandBus.execute).toHaveBeenCalledWith(new RegisterByEmailCommand(dto))
      expect(commandBus.execute).toHaveBeenCalledWith(new CreateTokenCommand(mockUser))
      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      })
    })

    it('should execute commands in correct order', async () => {
      const dto: RegisterByEmailDto = {
        email: 'newuser@example.com',
        password: 'password123',
      }
      const executeCalls: unknown[] = []
      jest.spyOn(commandBus, 'execute').mockImplementation((command) => {
        executeCalls.push(command)
        if (command instanceof RegisterByEmailCommand) {
          return Promise.resolve(mockUser)
        }
        return Promise.resolve(mockToken)
      })

      await controller.register(dto)

      expect(executeCalls).toHaveLength(2)
      expect(executeCalls[0]).toBeInstanceOf(RegisterByEmailCommand)
      expect(executeCalls[1]).toBeInstanceOf(CreateTokenCommand)
    })

    it('should pass registered user to token creation', async () => {
      const dto: RegisterByEmailDto = {
        email: 'newuser@example.com',
        password: 'password123',
      }
      const registeredUser = createMockUser({
        id: 3,
        email: dto.email,
      })
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(registeredUser).mockResolvedValueOnce(mockToken)

      const result = await controller.register(dto)

      const secondCall = (commandBus.execute as jest.Mock).mock.calls[1][0]
      expect(secondCall).toBeInstanceOf(CreateTokenCommand)
      expect(secondCall.user).toEqual(registeredUser)
      expect(result.user).toEqual(registeredUser)
    })

    it('should handle registration with valid email format', async () => {
      const dto: RegisterByEmailDto = {
        email: 'valid.email@example.com',
        password: 'securePassword123',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockToken)

      const result = await controller.register(dto)

      expect(result).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.token).toBeDefined()
    })
  })
})
