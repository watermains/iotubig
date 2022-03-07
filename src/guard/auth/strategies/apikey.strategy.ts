import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from 'src/module/auth/auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthService) {
    super(
      { header: `x-api-key`, prefix: `` },
      true,
      async (apikey, done, req) => {
        const checkKey = await authService.validateApiKey(apikey);
        if (!checkKey) {
          return done(false);
        }
        req.org_id = checkKey.organization_id;
        return done(true);
      },
    );
  }
}
