import { ErrorHandler, Injectable } from "@angular/core";
import { ModalService } from "./services/modal/modal.service";
import { IgeError } from "./models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { IgeException } from "./server-validation.util";
import { TranslocoService } from "@ngneat/transloco";

export interface IgeValidationError {
  errorCode: string;
  data: { id: string };
  name: string;
}

@Injectable({
  providedIn: "root",
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private modalService: ModalService,
    private translocoService: TranslocoService
  ) {}

  handleError(error) {
    console.log("HANDLE ERROR", error);
    if (error instanceof IgeError) {
      this.modalService.showIgeError(error);
    } else if (error instanceof HttpErrorResponse) {
      if (error.error?.errorCode) {
        const e = new IgeError();
        const message = this.translateMessage(error.error);
        const unHandledException = message == null;
        e.setMessage(
          this.translateMessage(error.error) ?? error.error.errorText,
          null,
          error.error?.stacktrace,
          unHandledException
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
    } else if (error instanceof TypeError) {
      const e = new IgeError(error.message);
      e.stacktrace = error.stack;
      this.modalService.showIgeError(e);
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

  private translateMessage(error: IgeException) {
    switch (error.errorCode) {
      case "IS_REFERENCED_ERROR":
        return this.translocoService.translate(
          "replace-address.reference-error-multiple-files"
        );
      case "IS_REFERENCED_ERROR_ADDRESS_UNPUBLISH":
        return "Die Adresse wird von mindestens einem veröffentlichten Datensatz referenziert, so dass die Veröffentlichung nicht zurückgezogen werden kann";
      case "CATALOG_NOT_FOUND":
        return `Dem Benutzer "${error.data.user}" ist kein Katalog zugewiesen`;
      case "CONFLICT_WHEN_MOVING":
        return `Es ist nicht möglich, ein Dokument/einen Ordner in sich selbst zu verschieben`;
      case "CONFLICT_WHEN_COPYING":
        return `Kopieren von Dokumentenbäumen unter sich selbst ist nicht möglich`;
      case "CONFLICT":
        return error.errorText === "Conflicting email address"
          ? "Diese E-Mail-Adresse wird bereits für einen anderen Benutzernamen verwendet."
          : null;
      case "PARENT_IS_NOT_PUBLISHED":
        return "Der Datensatz liegt veröffentlicht vor und darf nicht unter einen unveröffentlichten Datensatz verschoben werden.";
      case "UNPUBLISH-CHILD_IS_PUBLISHED":
        return "Mindestens einer der untergeordneten Datensätze ist veröffentlicht. Sie müssen die Veröffentlichung von untergeordneten Datensätzen ebenfalls zurückziehen, bevor Sie fortfahren können.";
      case "MAIL_ERROR":
        return `Es gab ein Problem beim Versenden der Email: ${error.errorText}`;
      default:
        return null;
    }
  }
}
