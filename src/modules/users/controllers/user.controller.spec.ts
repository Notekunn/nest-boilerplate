import { Roles } from '@common/enum/role.enum'
import { JwtAuthGuard } from '@guards/jwt-auth.guard'
import { JwtClaimsDto } from '@modules/auth/dto/jwt-claims.dto'
import { UpdateUserDto } from '@modules/users/dto/update-user.dto'
import { UserEntity } from '@modules/users/entities/user.entity'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { AccessGuard } from 'nest-casl'

import { UpdateUserCommand } from '../cqrs/commands/impl/update-user.command'
import { GetUserByIdQuery } from '../cqrs/queries/impl/get-user-by-id.query'
import { UserController } from './user.controller'

describe('UserController', () => {
  let controller: UserController
  let queryBus: QueryBus
  let commandBus: CommandBus

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Roles.User,
  }

  const mockJwtClaims: JwtClaimsDto = {
    id: 1,
    email: 'test@example.com',
    roles: [Roles.User],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AccessGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()

    controller = module.get<UserController>(UserController)
    queryBus = module.get<QueryBus>(QueryBus)
    commandBus = module.get<CommandBus>(CommandBus)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getProfile', () => {
    it('should return user profile', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockUser)

      const result = await controller.getProfile(mockJwtClaims)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetUserByIdQuery(mockJwtClaims.id))
      expect(result).toEqual(mockUser)
    })

    it('should query user by id from JWT claims', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockUser)

      await controller.getProfile(mockJwtClaims)

      const executeCall = (queryBus.execute as jest.Mock).mock.calls[0][0]
      expect(executeCall).toBeInstanceOf(GetUserByIdQuery)
      expect(executeCall.id).toBe(mockJwtClaims.id)
    })

    it('should handle different user ids', async () => {
      const differentUser: JwtClaimsDto = {
        id: 42,
        email: 'other@example.com',
        roles: [Roles.User],
      }
      const differentUserEntity: Partial<UserEntity> = {
        id: 42,
        email: 'other@example.com',
      }
      jest.spyOn(queryBus, 'execute').mockResolvedValue(differentUserEntity)

      const result = await controller.getProfile(differentUser)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetUserByIdQuery(42))
      expect(result).toEqual(differentUserEntity)
    })

    it('should return null when user not found', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(undefined)

      const result = await controller.getProfile(mockJwtClaims)

      expect(result).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should update user profile with name', async () => {
      const dto: UpdateUserDto = {
        name: 'Updated Name',
      }
      const updatedUser = { ...mockUser, name: dto.name }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(updatedUser)

      const result = await controller.updateProfile(mockJwtClaims, dto)

      expect(commandBus.execute).toHaveBeenCalledWith(new UpdateUserCommand(mockJwtClaims.id, dto))
      expect(result).toEqual(updatedUser)
    })

    it('should update user profile with password', async () => {
      const dto: UpdateUserDto = {
        password: 'newpassword123',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      await controller.updateProfile(mockJwtClaims, dto)

      const executeCall = (commandBus.execute as jest.Mock).mock.calls[0][0]
      expect(executeCall).toBeInstanceOf(UpdateUserCommand)
      expect(executeCall.userId).toBe(mockJwtClaims.id)
      expect(executeCall.dto).toEqual(dto)
    })

    it('should update user profile with both name and password', async () => {
      const dto: UpdateUserDto = {
        name: 'New Name',
        password: 'newpassword123',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      const result = await controller.updateProfile(mockJwtClaims, dto)

      expect(commandBus.execute).toHaveBeenCalledWith(new UpdateUserCommand(mockJwtClaims.id, dto))
      expect(result).toBeDefined()
    })

    it('should use correct user id from JWT claims', async () => {
      const dto: UpdateUserDto = {
        name: 'Updated Name',
      }
      const specificClaims: JwtClaimsDto = {
        id: 99,
        email: 'specific@example.com',
        roles: [Roles.User],
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      await controller.updateProfile(specificClaims, dto)

      const executeCall = (commandBus.execute as jest.Mock).mock.calls[0][0]
      expect(executeCall.userId).toBe(99)
    })

    it('should handle empty update dto', async () => {
      const dto: UpdateUserDto = {}
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      const result = await controller.updateProfile(mockJwtClaims, dto)

      expect(result).toBeDefined()
      expect(commandBus.execute).toHaveBeenCalled()
    })

    it('should return updated user entity', async () => {
      const dto: UpdateUserDto = {
        name: 'Brand New Name',
      }
      const updatedUser: Partial<UserEntity> = {
        ...mockUser,
        name: 'Brand New Name',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(updatedUser)

      const result = await controller.updateProfile(mockJwtClaims, dto)

      expect(result).toEqual(updatedUser)
      expect(result.name).toBe('Brand New Name')
    })
  })
})
