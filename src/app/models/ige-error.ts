export class IgeError {
  message: string;
  status?: number;
  stacktrace?: any;
  detail?: string;
  actions?: any[];

  constructor(error?) {
    // TODO: if (error instanceof Error)
    if (!error) return;

    this.message = error.message;
    this.detail = error.error ? error.error.message : null;
    this.status = error.status;
    // this.stacktrace = 'XXX';
  }

  setMessage(message: string, detail?: string) {
    this.message = message;
    this.detail = detail;
  }
}
