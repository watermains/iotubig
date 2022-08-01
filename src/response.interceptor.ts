import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import * as json2csv from 'json2csv';
import { Document } from 'mongoose';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fs from 'fs';
import * as PdfPrinter from 'pdfmake';
import * as moment from 'moment';

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
        const fonts = {
          Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
          },
        };
        const timeStamp = moment().format('MMMM Do YYYY, h:mm:ss a');
        const ddFields = fields.map((item: Object) => item['value']);
        const ddFields1 = ddFields.splice(0, 6);
        const ddFields2 = [ddFields1[0], ...ddFields];
        const ddData1 = data.map((item: Object) => [
          ...ddFields1.map((field: string) => item[field] ?? 'N/A'),
        ]);
        const ddData2 = data.map((item: Object) => [
          ...ddFields2.map((field: string) => item[field] ?? 'N/A'),
        ]);

        const documentData1 = [ddFields1, ...ddData1];
        const documentData2 = [ddFields2, ...ddData2];
        const widths1 = [...Array(ddFields1.length).keys()].map((key, index) =>
          index === ddFields1.length - 1 ? '*' : 'auto',
        );
        const widths2 = [...Array(ddFields2.length).keys()].map((key, index) =>
          index === ddFields2.length - 1 ? '*' : 'auto',
        );
        var dd = {
          pageOrientation: 'landscape',
          defaultStyle: {
            fontSize: 10,
            font: 'Helvetica',
          },
          content: [
            { text: "IoTubig", fontSize: 14, margin: [0, 0, 0, 16] },
            { text: timeStamp, fontSize: 11 },
            {
              layout: 'lightHorizontalLines',
              table: {
                headerRows: 1,
                widths: widths1,
                body: documentData1,
              },
              margin: [0, 16],
            },
            {
              layout: 'lightHorizontalLines',
              table: {
                headerRows: 1,
                widths: widths2,
                body: documentData2,
              },
            },
          ],
        };
        const printer = new PdfPrinter(fonts);
        const res = context.switchToHttp().getResponse();
        res.setHeader('Content-Type', 'application/pdf');
        let file_name = 'PDF' + '.pdf';
        const pdfDoc = printer.createPdfKitDocument(dd, {});
        pdfDoc.pipe(fs.createWriteStream(file_name));
        pdfDoc.end();
        return new StreamableFile(pdfDoc);
      }),
    );
  }
}

@Injectable()
export class AggregatedDocumentsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        if (response) {
          return { response };
        }

        return response;
      }),
    );
  }
}
