import { ErrorHandler, Injectable } from "@angular/core";
import { ModalService } from "./services/modal/modal.service";
import { IgeError } from "./models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { IgeException } from "./server-validation.util";

export interface IgeValidationError {
  errorCode: string;
  data: { id: string };
  name: string;
}

@Injectable({
  providedIn: "root",
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private modalService: ModalService) {}

  handleError(error) {
    console.log("HANDLE ERROR", error);

    if (error instanceof IgeError) {
      this.modalService.showIgeError(error);
    } else if (error instanceof HttpErrorResponse) {
      if (error.error?.errorCode) {
        const e = new IgeError();
        e.setMessage(
          GlobalErrorHandler.translateMessage(error.error) ??
            error.error.errorText
        );
        this.modalService.showIgeError(e);
      } else {
        const e = new IgeError();
        e.setMessage(
          error.message,
          error.error && error.error.message ? error.error.message : error.error
        );
        this.modalService.showIgeError(e);
      }
    } else if (error.errorCode) {
      const e = new IgeError();
      e.setMessage(error.errorText);
      this.modalService.showIgeError(e);
    } else if (error.rejection) {
      const e = new IgeError();
      const message =
        error.rejection.error?.errorText ?? error.rejection.message;
      const detail = error.rejection.error?.stacktrace;
      e.setMessage(message, detail);
      this.modalService.showIgeError(e);
    } else {
      this.modalService.showJavascriptError(error.message, error.stack);
    }
  }

  private static translateMessage(error: IgeException) {
    switch (error.errorCode) {
      case "IS_REFERENCED_ERROR":
        return "Die Adresse kann nicht gelöscht werden, sie wird von anderen Datensätzen referenziert. Bitte entfernen Sie zunächst die Referenzierungen.";
      case "CATALOG_NOT_FOUND":
        return `Dem Nutzer "${error.data.user}" ist kein Katalog zugewiesen`;
      default:
        return null;
    }
  }
}
