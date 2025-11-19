import { GetUserByEmailQuery } from '@modules/users/cqrs/queries/impl/get-user-by-email.query'
import { UserEntity } from '@modules/users/entities/user.entity'
import { BadRequestException } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { generateHash } from '@shared/security.utils'

import { LoginByEmailCommand } from '../impl/login-by-email.command'
import { LoginByEmailCommandHandler } from './login-by-email.handler'

describe('LoginByEmailCommandHandler', () => {
  let handler: LoginByEmailCommandHandler
  let queryBus: QueryBus

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    password: generateHash('password123'),
    name: 'Test User',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginByEmailCommandHandler,
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<LoginByEmailCommandHandler>(LoginByEmailCommandHandler)
    queryBus = module.get<QueryBus>(QueryBus)
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  describe('execute', () => {
    it('should return user when credentials are valid', async () => {
      const command = new LoginByEmailCommand('test@example.com', 'password123')
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockUser)

      const result = await handler.execute(command)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetUserByEmailQuery('test@example.com'))
      expect(result).toEqual(mockUser)
    })

    it('should throw BadRequestException when user is not found', async () => {
      const command = new LoginByEmailCommand('notfound@example.com', 'password123')
      jest.spyOn(queryBus, 'execute').mockResolvedValue(undefined)

      await expect(handler.execute(command)).rejects.toThrow(BadRequestException)
      await expect(handler.execute(command)).rejects.toThrow('error.userPasswordNotMatching')
    })

    it('should throw BadRequestException when password is invalid', async () => {
      const command = new LoginByEmailCommand('test@example.com', 'wrongpassword')
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockUser)

      await expect(handler.execute(command)).rejects.toThrow(BadRequestException)
      await expect(handler.execute(command)).rejects.toThrow('error.userPasswordNotMatching')
    })

    it('should validate password hash correctly', async () => {
      const plainPassword = 'correctPassword123'
      const hashedPassword = generateHash(plainPassword)
      const userWithHashedPassword = {
        ...mockUser,
        password: hashedPassword,
      }

      const command = new LoginByEmailCommand('test@example.com', plainPassword)
      jest.spyOn(queryBus, 'execute').mockResolvedValue(userWithHashedPassword)

      const result = await handler.execute(command)

      expect(result).toEqual(userWithHashedPassword)
    })
  })
})
