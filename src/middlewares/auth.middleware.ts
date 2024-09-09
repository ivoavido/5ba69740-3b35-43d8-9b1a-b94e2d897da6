import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import { JwtUser } from '../models/jwt_user.model'

/**
 * Check bearer authentication for the authoriztion header
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name)

  constructor(private readonly configService: ConfigService) { }

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
      this.logger.warn('Authorization header not found')
      throw new UnauthorizedException('Authorization header not found')
    }

    const [prefix, token] = authHeader.split(' ')

    if(prefix.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Malformed Authorization header')
    }

    if (!token) {
      this.logger.warn('Bearer token not found')
      throw new UnauthorizedException('Bearer token not found')
    }

    try {
      const decoded = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET')
      ) as any

      req['jwt'] = decoded
      const user = new JwtUser(decoded)
      req['user'] = user

      this.logger.log(`logged user ${user.uuid}`)
    } catch (err) {
      this.logger.warn('Invalid token')
      throw new UnauthorizedException('Invalid token')
    }


    next()
  }
}
