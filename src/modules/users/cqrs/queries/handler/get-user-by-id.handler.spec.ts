import { Roles } from '@common/enum/role.enum'
import { UserEntity } from '@modules/users/entities/user.entity'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { Test, TestingModule } from '@nestjs/testing'

import { GetUserByIdQuery } from '../impl/get-user-by-id.query'
import { GetUserByIdQueryHandler } from './get-user-by-id.handler'

describe('GetUserByIdQueryHandler', () => {
  let handler: GetUserByIdQueryHandler
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
        GetUserByIdQueryHandler,
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<GetUserByIdQueryHandler>(GetUserByIdQueryHandler)
    userRepository = module.get<UserRepository>(UserRepository)
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  describe('execute', () => {
    it('should return user when found by id', async () => {
      const query = new GetUserByIdQuery(1)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)

      const result = await handler.execute(query)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user is not found', async () => {
      const query = new GetUserByIdQuery(999)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined)

      const result = await handler.execute(query)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      })
      expect(result).toBeNull()
    })

    it('should query with correct user id', async () => {
      const query = new GetUserByIdQuery(42)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)

      await handler.execute(query)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 42 },
      })
    })

    it('should handle admin user lookup', async () => {
      const adminUser: Partial<UserEntity> = {
        id: 2,
        email: 'admin@example.com',
        role: Roles.Admin,
      }
      const query = new GetUserByIdQuery(2)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(adminUser as UserEntity)

      const result = await handler.execute(query)

      expect(result).toEqual(adminUser)
      expect(result?.role).toBe(Roles.Admin)
    })

    it('should return complete user entity with all fields', async () => {
      const completeUser: Partial<UserEntity> = {
        id: 1,
        email: 'complete@example.com',
        name: 'Complete User',
        role: Roles.User,
        password: 'hashedpassword',
      }
      const query = new GetUserByIdQuery(1)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(completeUser as UserEntity)

      const result = await handler.execute(query)

      expect(result).toEqual(completeUser)
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('role')
    })
  })
})
