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
import { NativeDateAdapter } from "@angular/material/core";
import { Injectable } from "@angular/core";

@Injectable()
export class GermanDateAdapter extends NativeDateAdapter {
  parse(value: string) {
    if (typeof value === "string" && value.indexOf(".") > -1) {
      const str = value.split(".");

      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);

      return new Date(year, month, date);
    }
    const timestamp = typeof value === "number" ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  format(date: Date, displayFormat: Object) {
    return (
      ("0" + date.getDate()).slice(-2) +
      "." +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "." +
      date.getFullYear()
    );
  }
}
