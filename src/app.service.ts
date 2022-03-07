import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  alive(): string {
    return 'I Am Alive';
  }
}
