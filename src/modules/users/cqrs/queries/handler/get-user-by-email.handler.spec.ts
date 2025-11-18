import { Roles } from '@common/enum/role.enum'
import { UserEntity } from '@modules/users/entities/user.entity'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { Test, TestingModule } from '@nestjs/testing'

import { GetUserByEmailQuery } from '../impl/get-user-by-email.query'
import { GetUserByEmailQueryHandler } from './get-user-by-email.handler'

describe('GetUserByEmailQueryHandler', () => {
  let handler: GetUserByEmailQueryHandler
  let userRepository: UserRepository

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Roles.User,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByEmailQueryHandler,
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<GetUserByEmailQueryHandler>(GetUserByEmailQueryHandler)
    userRepository = module.get<UserRepository>(UserRepository)
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  describe('execute', () => {
    it('should return user when found by email', async () => {
      const query = new GetUserByEmailQuery('test@example.com')
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)

      const result = await handler.execute(query)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user is not found', async () => {
      const query = new GetUserByEmailQuery('notfound@example.com')
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined)

      const result = await handler.execute(query)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'notfound@example.com' },
      })
      expect(result).toBeNull()
    })

    it('should query with correct email address', async () => {
      const query = new GetUserByEmailQuery('specific@example.com')
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)

      await handler.execute(query)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'specific@example.com' },
      })
    })

    it('should handle admin user lookup by email', async () => {
      const adminUser: Partial<UserEntity> = {
        id: 2,
        email: 'admin@example.com',
        role: Roles.Admin,
      }
      const query = new GetUserByEmailQuery('admin@example.com')
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(adminUser as UserEntity)

      const result = await handler.execute(query)

      expect(result).toEqual(adminUser)
      expect(result?.role).toBe(Roles.Admin)
    })

    it('should be case-sensitive for email lookup', async () => {
      const query = new GetUserByEmailQuery('Test@Example.com')
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined)

      await handler.execute(query)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'Test@Example.com' },
      })
    })

    it('should return complete user entity with all fields', async () => {
      const completeUser: Partial<UserEntity> = {
        id: 1,
        email: 'complete@example.com',
        name: 'Complete User',
        role: Roles.User,
        password: 'hashedpassword',
      }
      const query = new GetUserByEmailQuery('complete@example.com')
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(completeUser as UserEntity)

      const result = await handler.execute(query)

      expect(result).toEqual(completeUser)
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('role')
    })

    it('should handle email with special characters', async () => {
      const specialEmail = 'user+test@example.com'
      const query = new GetUserByEmailQuery(specialEmail)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)

      await handler.execute(query)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: specialEmail },
      })
    })
  })
})
