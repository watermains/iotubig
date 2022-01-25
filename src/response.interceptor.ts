import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  errror: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor <T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) => ({
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: data.message,
          data: data.response,
          error: data.error,
        })),
      );
  }
}
