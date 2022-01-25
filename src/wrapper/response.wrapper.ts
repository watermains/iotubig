export class ResponseWrapper {
  async wrap<T>(val: Promise<T>) {
    return await val.then((res) => ({
      response: res,
    }));
  }
}
