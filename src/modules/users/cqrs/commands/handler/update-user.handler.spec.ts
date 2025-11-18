import { Roles } from '@common/enum/role.enum'
import { UpdateUserDto } from '@modules/users/dto/update-user.dto'
import { UserEntity } from '@modules/users/entities/user.entity'
import { UserRepository } from '@modules/users/repositories/user.repository'
import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { generateHash } from '@shared/security.utils'

import { UpdateUserCommand } from '../impl/update-user.command'
import { UpdateUserCommandHandler } from './update-user.handler'

describe('UpdateUserCommandHandler', () => {
  let handler: UpdateUserCommandHandler
  let userRepository: UserRepository

  const mockUser: Partial<UserEntity> = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Roles.User,
    password: generateHash('oldpassword'),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserCommandHandler,
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            merge: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<UpdateUserCommandHandler>(UpdateUserCommandHandler)
    userRepository = module.get<UserRepository>(UserRepository)
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  describe('execute', () => {
    it('should update user name successfully', async () => {
      const dto: UpdateUserDto = {
        name: 'Updated Name',
      }
      const updatedUser = { ...mockUser, name: dto.name }
      const command = new UpdateUserCommand(1, dto)

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'merge').mockReturnValue(updatedUser as UserEntity)
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as UserEntity)

      const result = await handler.execute(command)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(userRepository.merge).toHaveBeenCalledWith(mockUser, dto)
      expect(userRepository.save).toHaveBeenCalled()
      expect(result).toEqual(updatedUser)
    })

    it('should update user password with hash', async () => {
      const dto: UpdateUserDto = {
        password: 'newpassword123',
      }
      const command = new UpdateUserCommand(1, dto)

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'merge').mockReturnValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as UserEntity)

      await handler.execute(command)

      const mergeCall = (userRepository.merge as jest.Mock).mock.calls[0][1]
      expect(mergeCall.password).not.toBe('newpassword123')
      expect(mergeCall.password).toBeTruthy()
      expect(mergeCall.password.length).toBeGreaterThan(20) // Hashed password is longer
    })

    it('should update both name and password', async () => {
      const dto: UpdateUserDto = {
        name: 'New Name',
        password: 'newpassword123',
      }
      const command = new UpdateUserCommand(1, dto)

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'merge').mockReturnValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as UserEntity)

      await handler.execute(command)

      const mergeCall = (userRepository.merge as jest.Mock).mock.calls[0][1]
      expect(mergeCall.name).toBe('New Name')
      expect(mergeCall.password).not.toBe('newpassword123')
      expect(mergeCall.password).toBeTruthy()
    })

    it('should throw NotFoundException when user does not exist', async () => {
      const dto: UpdateUserDto = {
        name: 'Updated Name',
      }
      const command = new UpdateUserCommand(999, dto)

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined)

      await expect(handler.execute(command)).rejects.toThrow(NotFoundException)
      await expect(handler.execute(command)).rejects.toThrow('error.userNotFound')
      expect(userRepository.merge).not.toHaveBeenCalled()
      expect(userRepository.save).not.toHaveBeenCalled()
    })

    it('should update user without password if not provided', async () => {
      const dto: UpdateUserDto = {
        name: 'Only Name Update',
      }
      const command = new UpdateUserCommand(1, dto)

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'merge').mockReturnValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as UserEntity)

      await handler.execute(command)

      const mergeCall = (userRepository.merge as jest.Mock).mock.calls[0][1]
      expect(mergeCall.name).toBe('Only Name Update')
      expect(mergeCall.password).toBeUndefined()
    })

    it('should handle empty dto', async () => {
      const dto: UpdateUserDto = {}
      const command = new UpdateUserCommand(1, dto)

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'merge').mockReturnValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as UserEntity)

      const result = await handler.execute(command)

      expect(result).toBeDefined()
      expect(userRepository.save).toHaveBeenCalled()
    })

    it('should preserve existing user data when updating', async () => {
      const dto: UpdateUserDto = {
        name: 'New Name',
      }
      const command = new UpdateUserCommand(1, dto)

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'merge').mockReturnValue(mockUser as UserEntity)
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as UserEntity)

      await handler.execute(command)

      const mergeCall = (userRepository.merge as jest.Mock).mock.calls[0]
      expect(mergeCall[0]).toEqual(mockUser) // First argument is the original user
      expect(mergeCall[1]).toEqual(dto) // Second argument is the updates
    })
  })
})
