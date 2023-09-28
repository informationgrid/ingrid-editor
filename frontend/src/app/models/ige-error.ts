import { HttpErrorResponse } from "@angular/common/http";

export class IgeError {
  message: string;
  items?: string[];
  status?: number;
  stacktrace?: any;
  detail?: string;
  actions?: any[];
  unhandledException?: boolean;
  showDetails?: boolean;

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

  setMessage(
    message: string,
    detail?: string,
    stacktrace: string = null,
    unhandledException: boolean = false
  ) {
    this.unhandledException = unhandledException;
    this.message = message;
    this.showDetails = false;
    this.detail = detail;
    this.stacktrace = stacktrace;
  }
}
