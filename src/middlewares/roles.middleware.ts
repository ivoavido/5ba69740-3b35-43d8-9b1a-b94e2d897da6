import { ForbiddenException, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { JwtUser, UserRoles } from '../models/jwt_user.model'

/**
 * Check user roles for requested actions
 */
@Injectable()
export class RolesMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RolesMiddleware.name)

  use(req: Request, res: Response, next: NextFunction) {

    const user = req['user'] as JwtUser

    if(['POST', 'PATCH', 'DELETE', 'PUT'].includes(req.method.toUpperCase())) {
      if(!user.hasRole(UserRoles.write)) {
        this.logger.warn(`forbidden operation ${req.method} for user ${user.uuid} on ${req.path}`)
        throw new ForbiddenException('Role not granted')
      }
    }

    next()
  }
}
