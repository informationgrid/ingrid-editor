import { HttpErrorResponse } from "@angular/common/http";

export class IgeError {
  message: string;
  status?: number;
  stacktrace?: any;
  detail?: string;
  actions?: any[];

  constructor(error?: HttpErrorResponse | string) {
    if (error instanceof HttpErrorResponse) {
      if (!error) {
        return;
      }

      this.message = error.message;
      this.detail = error.error ? error.error.message : null;
      this.status = error.status;
    } else {
      this.setMessage(error);
    }
  }

  setMessage(message: string, detail?: string) {
    this.message = message;
    this.detail = detail;
  }
}
