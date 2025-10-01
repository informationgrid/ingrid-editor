/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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

      let year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);
      //  Workaround Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
      if (year < 100) {
        year = year + 2000;
      }

      return new Date(year, month, date);
    }
    const timestamp = typeof value === "number" ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  format(date: Date, displayFormat: Object) {
    return "hour" in displayFormat
      ? this._formatOnlyTime(date)
      : this._formatDateWithoutTime(date);
  }

  _formatOnlyTime(date: Date) {
    return (
      ("0" + date.getHours()).slice(-2) +
      ":" +
      ("0" + date.getMinutes()).slice(-2)
    );
  }

  _formatDateWithoutTime(date: Date) {
    return (
      ("0" + date.getDate()).slice(-2) +
      "." +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "." +
      date.getFullYear()
    );
  }
}
