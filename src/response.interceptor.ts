import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Document } from 'mongoose';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as PdfPrinter from 'pdfmake';
import * as moment from 'moment';
import { Workbook } from 'exceljs';

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
        const timeStamp = moment()
          .tz('Asia/Manila')
          .format('MMMM Do YYYY, h:mm:ss a');
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
            { text: 'IoTubig', fontSize: 14, margin: [0, 0, 0, 16] },
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
        const pdfDoc = printer.createPdfKitDocument(dd, {});
        pdfDoc.end();
        return new StreamableFile(pdfDoc);
      }),
    );
  }
}

@Injectable()
export class CsvReportsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async ({ data, fields, startDate, endDate }) => {
        const _data = data.map((item) => {
          return {
            ...item,
            time: moment(item.createdAt).format('LT'),
          };
        });
        const workbook = new Workbook();
        workbook.creator = 'IoTubig Admin';
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();

        const worksheet = workbook.addWorksheet('Remittance Report', {
          views: [{ state: 'frozen', ySplit: 5 }],
          headerFooter: { oddFooter: 'Page &P of &N', oddHeader: 'Odd Page' },
        });
        worksheet.mergeCells('A1', 'B1');
        worksheet.getCell('A1').value = 'General Detailed Report';
        worksheet.getCell('A2').value = 'From';
        worksheet.getCell('B2').value = moment(startDate).format('LL');
        worksheet.getCell('C2').value = 'To';
        worksheet.getCell('D2').value = moment(endDate).format('LL');

        worksheet.getRow(5).values = fields.map(
          (field: { label: string }) => field.label,
        );
        worksheet.columns = fields.map(
          (field: { label: string; value: string }) => {
            return {
              key: field.value,
              width: 20,
            };
          },
        );
        const rows = _data.map((item: { [x: string]: any; }) => {
          return fields.map((field: { value: string | number; }) => item[field.value]);
        });

        worksheet.addRows(rows);
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber >= 5) {
            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
              };
              cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true,
              };
            });
          }
        });

        const response = context.switchToHttp().getResponse();

        response.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );

        response.setHeader(
          'Content-Disposition',
          'attachment; filename=IoTubig',
        );

        await workbook.xlsx.write(response);

        response.end();
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
