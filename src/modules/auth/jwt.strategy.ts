import { GetUserByIdQuery } from '@modules/users/cqrs/queries/impl/get-user-by-id.query'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QueryBus } from '@nestjs/cqrs'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtClaimsDto } from './dto/jwt-claims.dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(public readonly configService: ConfigService, private readonly queryBus: QueryBus) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.secret'),
    })
  }

  async validate({ id: userId }): Promise<JwtClaimsDto> {
    const user = await this.queryBus.execute(new GetUserByIdQuery(userId))

    return user
  }
}
