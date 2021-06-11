import { IgeValidationError } from "./error-handler";

export interface IgeException {
  errorCode: string;
  errorId: string;
  errorText: string;
}

const SERVER_ERRORS = {
  VALIDATION_ERROR: "Bei der Validierung des Formulars traten Fehler auf",
};

const SERVER_VALIDATION_ERRORS = {
  NOT_PUBLISHED: "Eine Referenz ist noch nicht veröffentlicht",
};

export class ServerValidation {
  static prepareServerValidationErrors(data: {
    fields: IgeValidationError[];
  }): { key: string; messages: any[] }[] {
    return data.fields.map((field) => ({
      key: field.name,
      messages: [{ other: { message: this.mapError(field) } }],
    }));
  }

  static prepareServerError(error: IgeException) {
    return (
      SERVER_ERRORS[error?.errorCode] ??
      error?.errorText ??
      error?.errorCode ??
      "Unbekannter Server Fehler"
    );
  }

  private static mapError(field: IgeValidationError): string {
    return (
      SERVER_VALIDATION_ERRORS[field.errorCode] ??
      field.errorCode ??
      "Unbekannter Validierungsfehler"
    );
  }
}
