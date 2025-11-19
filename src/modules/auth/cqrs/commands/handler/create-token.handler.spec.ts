import { Roles } from '@common/enum/role.enum'
import { TokenResponseDto } from '@modules/auth/dto/token-response.dto'
import { UserEntity } from '@modules/users/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { CreateTokenCommand } from '../impl/create-token.command'
import { CreateTokenCommandHandler } from './create-token.handler'

describe('CreateTokenCommandHandler', () => {
  let handler: CreateTokenCommandHandler
  let jwtService: JwtService

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    role: Roles.User,
  }

  const mockToken = 'mock.jwt.token'
  const mockExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTokenCommandHandler,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<CreateTokenCommandHandler>(CreateTokenCommandHandler)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  describe('execute', () => {
    it('should create a token with user information', async () => {
      const command = new CreateTokenCommand(mockUser as UserEntity)
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken)
      jest.spyOn(jwtService, 'verify').mockReturnValue({ exp: mockExp })

      const result = await handler.execute(command)

      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        roles: [mockUser.role],
      })
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken)
      expect(result).toBeInstanceOf(TokenResponseDto)
      expect(result.token).toBe(mockToken)
      expect(result.expiresIn).toEqual(new Date(mockExp * 1000))
    })

    it('should include user id, email, and role in token payload', async () => {
      const command = new CreateTokenCommand(mockUser as UserEntity)
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken)
      jest.spyOn(jwtService, 'verify').mockReturnValue({ exp: mockExp })

      await handler.execute(command)

      const signCall = (jwtService.sign as jest.Mock).mock.calls[0][0]
      expect(signCall).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        roles: [mockUser.role],
      })
    })

    it('should handle admin user token creation', async () => {
      const adminUser: Partial<UserEntity> = {
        id: 2,
        email: 'admin@example.com',
        role: Roles.Admin,
      }
      const command = new CreateTokenCommand(adminUser as UserEntity)
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken)
      jest.spyOn(jwtService, 'verify').mockReturnValue({ exp: mockExp })

      await handler.execute(command)

      const signCall = (jwtService.sign as jest.Mock).mock.calls[0][0]
      expect(signCall.roles).toEqual([Roles.Admin])
    })

    it('should return valid TokenResponseDto', async () => {
      const command = new CreateTokenCommand(mockUser as UserEntity)
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken)
      jest.spyOn(jwtService, 'verify').mockReturnValue({ exp: mockExp })

      const result = await handler.execute(command)

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('expiresIn')
      expect(result.token).toBeTruthy()
      expect(result.expiresIn).toBeInstanceOf(Date)
    })

    it('should correctly convert exp timestamp to Date', async () => {
      const specificExp = 1700000000 // Specific timestamp
      const command = new CreateTokenCommand(mockUser as UserEntity)
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken)
      jest.spyOn(jwtService, 'verify').mockReturnValue({ exp: specificExp })

      const result = await handler.execute(command)

      expect(result.expiresIn).toEqual(new Date(specificExp * 1000))
    })
  })
})
