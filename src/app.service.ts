import { Injectable } from '@nestjs/common';
import * as pjson from '../package.json';

@Injectable()
export class AppService {
  alive(): string {
    return `I Am Alive ${pjson.version} 160622@1547`;
  }
}
