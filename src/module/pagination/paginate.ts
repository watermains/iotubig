export class PaginatedData {
  data: any;
  total_rows: number;
  constructor(data, total_rows) {
    this.data = data;
    this.total_rows = total_rows;
  }
}
