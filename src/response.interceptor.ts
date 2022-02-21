import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as json2csv from 'json2csv';
import { Document } from 'mongoose';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  errror: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            message: data.message,
            data: data.response,
            error: data.error,
          };
        } else {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            error: 'No data',
          };
        }
      }),
    );
  }
}

@Injectable()
export class DocumentInterceptor<T extends Document, U extends JSON>
  implements NestInterceptor<T, U>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((res) => {
        if (res) {
          return { response: res.toJSON() };
        }
        return res;
      }),
    );
  }
}

@Injectable()
export class DocumentsInterceptor<T extends Document[], U extends JSON>
  implements NestInterceptor<T, U>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((res) => {
        if (res) {
          return { response: res.map((e) => e.toJSON()) };
        }
        return res;
      }),
    );
  }
}

@Injectable()
export class MutableDocumentInterceptor<T extends Document, U extends JSON>
  implements NestInterceptor<T, U>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data) {
          return {
            response: { ...data.document.toJSON(), ...data.custom_fields },
          };
        }
        return data;
      }),
    );
  }
}

@Injectable()
export class MutableDocumentsInterceptor<T extends Document[], U extends JSON>
  implements NestInterceptor<T, U>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((res) => {
        if (res) {
          return {
            response: res.map((e) => ({
              ...e.document.toJSON(),
              ...e.custom_fields,
            })),
          };
        }
        return res;
      }),
    );
  }
}

@Injectable()
export class ReportsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async ({ data, fields }) => {
        const res = context.switchToHttp().getResponse();
        res.setHeader('Content-Type', 'text/csv');
        const csv = await json2csv.parseAsync(data, { fields });
        return res.send(csv);
      }),
    );
  }
}
