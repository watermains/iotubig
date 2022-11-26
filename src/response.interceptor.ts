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
      map(async ({ data, fields, startDate, endDate }) => {
        const fonts = {
          Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
          },
        };
        const filteredFields = fields.filter(
          (item: { label: string }) => item.label !== 'Meter Name',
        );
        const ddFields = filteredFields.map(
          (item: { label: string }) => item.label,
        );
        const ddData = data.map((item: Object) => [
          ...filteredFields.map((field: { value: string }) => {
            switch (field.value) {
              case 'date':
                return moment(
                  new Date(item['createdAt'] ?? item['date']),
                ).format('DD-MMM-YYYY');
              case 'time':
                return {
                  text: moment(
                    new Date(
                      item['createdAt'] ?? `${item['date']} ${item['time']}`,
                    ),
                  ).format('h:mm'),
                  alignment: 'center',
                };
              case 'cumulative_flow':
                return {
                  text: item['meter']
                    ? Number(item['meter']['cumulative_flow']) /
                      Number(item['rate'])
                    : Number(item['cumulative_flow']),
                  alignment: 'center',
                };
              default:
                return {
                  text: item[field.value].toFixed(2) ?? 'N/A',
                  alignment: 'center',
                };
            }
          }),
        ]);

        const documentData = [ddFields, ...ddData];
        const widths = [...Array(ddFields.length).keys()].map(() => 'auto');

        const totalAmount = data.reduce(
          (accumulated: number, current: { amount: number }) => {
            return (accumulated += current.amount);
          },
          0,
        );

        var dd = {
          pageOrientation: 'landscape',
          defaultStyle: {
            fontSize: 10,
            font: 'Helvetica',
          },
          watermark: {
            text: 'IoTubig',
            color: 'gray',
            opacity: 0.2,
            bold: false,
            italics: false,
          },
          content: [
            {
              text: 'Detailed Individual Report',
              fontSize: 14,
              margin: [0, 0, 0, 8],
            },
            {
              text: `User Account Email: ${data[0].email}`,
              fontSize: 12,
              margin: [0, 0, 0, 8],
            },
            {
              text: `Meter Name: ${data[0].iot_meter_id}`,
              fontSize: 12,
              margin: [0, 0, 0, 8],
            },
            {
              text: `Date Covered: ${moment(startDate).format(
                'MMM DD, YYYY',
              )} - ${moment(endDate).format('MMM DD, YYYY')}`,
              fontSize: 12,
              margin: [0, 0, 0, 8],
            },
            {
              text: `Total Amount Reloaded: ${totalAmount.toFixed(2)}`,
              fontSize: 12,
              margin: [0, 0, 0, 8],
            },
            {
              layout: 'headerLineOnly',
              table: {
                headerRows: 1,
                widths: widths,
                body: documentData,
              },
              margin: [0, 16],
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
      map(
        async ({
          data,
          fields,
          startDate,
          endDate,
          workSheetName,
          sheetHeaderTitle,
        }) => {
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

          const worksheet = workbook.addWorksheet(workSheetName, {
            views: [{ state: 'frozen', ySplit: 5 }],
            headerFooter: { oddFooter: 'Page &P of &N', oddHeader: 'Odd Page' },
          });
          worksheet.mergeCells('A1', 'B1');

          worksheet.getCell('A1').value = sheetHeaderTitle;
          if (workSheetName !== 'Meter Status') {
            worksheet.getCell('A2').value = 'From';

            worksheet.getCell('B2').value = moment(startDate).format('LL');

            worksheet.getCell('C2').value = 'To';

            worksheet.getCell('D2').value = moment(endDate).format('LL');
          } else {
            worksheet.getCell('A2').value = 'Status as of: ';

            worksheet.getCell('B2').value = moment(startDate).format('LL');
          }

          if (workSheetName === 'Transaction Report') {
            const totalBalance = _data.reduce(
              (accumulated: number, current: { amount: number }) => {
                return (accumulated += current.amount);
              },
              0,
            );
            worksheet.getCell('A3').value = 'Total Amount';

            worksheet.getCell('B3').value = totalBalance.toFixed(2);
            worksheet.getCell('B3').alignment = { horizontal: 'left' };
          }

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
          const rows = _data.map((item: { [x: string]: any }) => {
            return fields.map(
              (field: { value: string | number }) => item[field.value],
            );
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
        },
      ),
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
