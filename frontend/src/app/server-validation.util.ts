/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { IgeValidationError } from "./error-handler";

export interface IgeException {
  errorCode: string;
  errorId: string;
  errorText: string;
  data: any;
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
