import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context)
  }

  override handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException('error.credentialsNotCorrect')
    }
    return user
  }
}
