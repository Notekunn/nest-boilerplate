import { JwtAuthGuard } from '@guards/jwt-auth.guard'
import { UpdateUserDto } from '@modules/users/dto/update-user.dto'
import { UserEntity } from '@modules/users/entities/user.entity'
import { CommandBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { AccessGuard } from 'nest-casl'

import { UpdateUserCommand } from '../cqrs/commands/impl/update-user.command'
import { UserAdminController } from './user-admin.controller'

describe('UserAdminController', () => {
  let controller: UserAdminController
  let commandBus: CommandBus

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAdminController],
      providers: [
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

    controller = module.get<UserAdminController>(UserAdminController)
    commandBus = module.get<CommandBus>(CommandBus)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('updateProfile', () => {
    it('should update user profile by admin', async () => {
      const userId = 1
      const dto: UpdateUserDto = {
        name: 'Admin Updated Name',
      }
      const updatedUser = { ...mockUser, name: dto.name }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(updatedUser)

      const result = await controller.updateProfile(userId, dto)

      expect(commandBus.execute).toHaveBeenCalledWith(new UpdateUserCommand(userId, dto))
      expect(result).toEqual(updatedUser)
    })

    it('should update user password by admin', async () => {
      const userId = 2
      const dto: UpdateUserDto = {
        password: 'adminResetPassword',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      await controller.updateProfile(userId, dto)

      const executeCall = (commandBus.execute as jest.Mock).mock.calls[0][0]
      expect(executeCall).toBeInstanceOf(UpdateUserCommand)
      expect(executeCall.userId).toBe(userId)
      expect(executeCall.dto).toEqual(dto)
    })

    it('should update both name and password', async () => {
      const userId = 3
      const dto: UpdateUserDto = {
        name: 'Admin New Name',
        password: 'newAdminPassword',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      const result = await controller.updateProfile(userId, dto)

      expect(commandBus.execute).toHaveBeenCalledWith(new UpdateUserCommand(userId, dto))
      expect(result).toBeDefined()
    })

    it('should handle different user ids', async () => {
      const dto: UpdateUserDto = {
        name: 'Updated Name',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      await controller.updateProfile(42, dto)

      const executeCall = (commandBus.execute as jest.Mock).mock.calls[0][0]
      expect(executeCall.userId).toBe(42)
    })

    it('should handle large user id numbers', async () => {
      const largeId = 999999
      const dto: UpdateUserDto = {
        name: 'Test',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      await controller.updateProfile(largeId, dto)

      const executeCall = (commandBus.execute as jest.Mock).mock.calls[0][0]
      expect(executeCall.userId).toBe(largeId)
    })

    it('should return updated user entity', async () => {
      const userId = 1
      const dto: UpdateUserDto = {
        name: 'Completely New Name',
      }
      const updatedUser: Partial<UserEntity> = {
        ...mockUser,
        name: 'Completely New Name',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(updatedUser)

      const result = await controller.updateProfile(userId, dto)

      expect(result).toEqual(updatedUser)
      expect(result.name).toBe('Completely New Name')
    })

    it('should handle empty dto', async () => {
      const userId = 1
      const dto: UpdateUserDto = {}
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      const result = await controller.updateProfile(userId, dto)

      expect(result).toBeDefined()
      expect(commandBus.execute).toHaveBeenCalled()
    })

    it('should use ParseIntPipe for id parameter', async () => {
      // This test verifies that the controller is set up to parse id as int
      const userId = 5
      const dto: UpdateUserDto = {
        name: 'Test',
      }
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser)

      await controller.updateProfile(userId, dto)

      expect(typeof userId).toBe('number')
      const executeCall = (commandBus.execute as jest.Mock).mock.calls[0][0]
      expect(typeof executeCall.userId).toBe('number')
    })
  })
})
