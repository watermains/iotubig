import { Injectable, NestMiddleware } from '@nestjs/common';
import * as passport from 'passport';
@Injectable()
export class APIKeyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    passport.authenticate(
      'headerapikey',
      { session: false, failureRedirect: 'api/unauthorized' },
      (val) => {
        if (val) {
          next();
        } else {
          res.status(401).send({ error: 'Invalid Token' });
        }
      },
    )(req, res, next);
  }
}
