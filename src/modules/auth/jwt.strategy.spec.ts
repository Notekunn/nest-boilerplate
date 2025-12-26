import { Roles } from '@common/enum/role.enum'
import { GetUserByIdQuery } from '@modules/users/cqrs/queries/impl/get-user-by-id.query'
import { UserEntity } from '@modules/users/entities/user.entity'
import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'

import { JwtStrategy } from './jwt.strategy'

describe('JwtStrategy', () => {
  let strategy: JwtStrategy
  let queryBus: QueryBus

  const mockUser: UserEntity = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Roles.User,
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserEntity

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile()

    strategy = module.get<JwtStrategy>(JwtStrategy)
    queryBus = module.get<QueryBus>(QueryBus)
  })

  it('should be defined', () => {
    expect(strategy).toBeDefined()
  })

  describe('validate', () => {
    it('should return jwt claims when user exists', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockUser)

      const result = await strategy.validate({ id: 1 })

      expect(queryBus.execute).toHaveBeenCalledWith(new GetUserByIdQuery(1))
      expect(result).toEqual({
        ...mockUser,
        roles: [Roles.User],
      })
    })

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(undefined)

      await expect(strategy.validate({ id: 999 })).rejects.toThrow(UnauthorizedException)
      expect(queryBus.execute).toHaveBeenCalledWith(new GetUserByIdQuery(999))
    })

    it('should include user role in roles array', async () => {
      const adminUser = { ...mockUser, id: 2, role: Roles.Admin }
      jest.spyOn(queryBus, 'execute').mockResolvedValue(adminUser)

      const result = await strategy.validate({ id: 2 })

      expect(result.roles).toEqual([Roles.Admin])
    })
  })
})
