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
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "dateAgo",
  pure: true,
  standalone: true,
})
export class DateAgoPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value) {
      switch (args) {
        case "DE":
          return DateAgoPipe.transform_DE(value);
        case "EN":
        default:
          return DateAgoPipe.transform_EN(value);
      }
    }
    return value;
  }

  private static transform_DE(value: any) {
    const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
    if (seconds < 29) {
      // less than 30 seconds ago will show as 'Just now'
      return "Gerade eben";
    }
    const intervals = {
      Jahren: 31536000,
      Monaten: 2592000,
      Wochen: 604800,
      Tagen: 86400,
      Stunden: 3600,
      Minuten: 60,
      Sekunden: 1,
    };
    const singleText = {
      Jahren: "einem Jahr",
      Monaten: "einem Monat",
      Wochen: "einer Woche",
      Tagen: "einem Tag",
      Stunden: "einer Stunde",
      Minuten: "einer Minute",
      Sekunden: "einer Sekunde",
    };
    let counter;
    for (const i in intervals) {
      counter = Math.floor(seconds / intervals[i]);
      if (counter > 0) {
        if (counter === 1) {
          return "vor " + singleText[i]; // singular (vor einem Tag)
        } else {
          return "vor " + counter + " " + i; // plural (vor 2 Tagen)
        }
      }
    }
  }

  private static transform_EN(value: any) {
    const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
    if (seconds < 29) {
      // less than 30 seconds ago will show as 'Just now'
      return "Just now";
    }
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };
    let counter;
    for (const i in intervals) {
      counter = Math.floor(seconds / intervals[i]);
      if (counter > 0) {
        if (counter === 1) {
          return counter + " " + i + " ago"; // singular (1 day ago)
        } else {
          return counter + " " + i + "s ago"; // plural (2 days ago)
        }
      }
    }
  }
}
