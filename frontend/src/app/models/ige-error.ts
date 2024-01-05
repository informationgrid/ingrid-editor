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
    unhandledException: boolean = false,
  ) {
    this.unhandledException = unhandledException;
    this.message = message;
    this.showDetails = false;
    this.detail = detail;
    this.stacktrace = stacktrace;
  }
}
