import { Query } from '@nestjs-architects/typed-cqrs'

export class LoginByEmailCommand extends Query<boolean> {
  constructor(public readonly email: string, public readonly password: string) {
    super()
  }
}
