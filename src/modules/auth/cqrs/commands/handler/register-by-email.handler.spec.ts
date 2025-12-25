import { UserEntity } from '@modules/users/entities/user.entity'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { ConflictException } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import * as securityUtils from '@shared/security.utils'

import { RegisterByEmailCommand } from '../impl/register-by-email.command'
import { RegisterByEmailCommandHandler } from './register-by-email.handler'

// Mock typeorm-transactional to bypass @Transactional() decorator
jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
  initializeTransactionalContext: jest.fn(),
  StorageDriver: { AUTO: 'AUTO' },
}))

describe('RegisterByEmailCommandHandler', () => {
  let handler: RegisterByEmailCommandHandler
  let queryBus: jest.Mocked<QueryBus>
  let userRepository: jest.Mocked<UserRepository>

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterByEmailCommandHandler,
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<RegisterByEmailCommandHandler>(RegisterByEmailCommandHandler)
    queryBus = module.get(QueryBus)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  describe('execute', () => {
    const dto = { email: 'new@example.com', password: 'Password123!' }
    const command = new RegisterByEmailCommand(dto)

    it('should create new user when email not exists', async () => {
      queryBus.execute.mockResolvedValue(undefined)
      userRepository.create.mockReturnValue(mockUser as UserEntity)
      userRepository.save.mockResolvedValue(mockUser as UserEntity)

      jest.spyOn(securityUtils, 'generateHash').mockResolvedValue('hashedPassword')

      const result = await handler.execute(command)

      expect(queryBus.execute).toHaveBeenCalled()
      expect(userRepository.create).toHaveBeenCalledWith({
        email: dto.email,
        password: 'hashedPassword',
      })
      expect(userRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should throw ConflictException when email already exists', async () => {
      queryBus.execute.mockResolvedValue(mockUser)

      await expect(handler.execute(command)).rejects.toThrow(ConflictException)
      await expect(handler.execute(command)).rejects.toThrow('error.emailAlreadyExists')

      expect(userRepository.create).not.toHaveBeenCalled()
      expect(userRepository.save).not.toHaveBeenCalled()
    })

    it('should hash password before saving', async () => {
      queryBus.execute.mockResolvedValue(undefined)
      userRepository.create.mockReturnValue(mockUser as UserEntity)
      userRepository.save.mockResolvedValue(mockUser as UserEntity)

      const hashSpy = jest.spyOn(securityUtils, 'generateHash').mockResolvedValue('hashedPassword')

      await handler.execute(command)

      expect(hashSpy).toHaveBeenCalledWith(dto.password)
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashedPassword' }))
    })
  })
})
