/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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
import { Component, computed, input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { IgeError } from "../../../../models/ige-error";

@Component({
  selector: "ige-time-reference-explanation",
  imports: [],
  templateUrl: "./time-reference-explanation.component.html",
  styleUrl: "./time-reference-explanation.component.scss",
})
export class TimeReferenceExplanationComponent {
  value = input<
    Partial<{
      type: string;
      atDate: Date;
      intervalFrom: string;
      fromDate: Date;
      intervalTo: string;
      tillDate: Date;
    }>
  >(undefined);
  showTime = input<boolean>(false);

  private formatDate(date?: Date | null) {
    if (!date) return "";
    try {
      if (typeof date === "string") {
        date = new Date(date);
      }
      return date.toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(date);
    }
  }

  private formatDateWithOptionalTime(date?: Date | null) {
    const d = this.formatDate(date);
    if (!d) return "";
    if (!date) return "";
    if (this.showTime()) {
      try {
        const time = date.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `${d} um ${time} Uhr`;
      } catch {
        return d;
      }
    } else {
      return d;
    }
  }

  message = computed(() => {
    const v = this.value();
    if (!v || v.type == null) return "";

    if (v.type === "none") {
      return "Es gibt keine Zeitangaben zu den Daten.";
    }

    if (v.type === "at") {
      const at = this.formatDate(v.atDate);
      return at
        ? `Die Daten beziehen sich auf den ${at}.`
        : "Die Daten beziehen sich auf ein konkretes Datum.";
    }

    if (v.type === "range") {
      const fromIsDate = v.intervalFrom === "date";
      const toIsDate = v.intervalTo === "date";
      const toIsContinuous = v.intervalTo === "continuously";

      const fromStr = this.formatDateWithOptionalTime(v.fromDate);
      const toStr = this.formatDateWithOptionalTime(v.tillDate);

      // Both bounds are dates
      if (fromIsDate && toIsDate) {
        if (v.fromDate && v.tillDate) {
          return `Die Daten beziehen sich auf eine Zeitspanne vom ${fromStr} bis ${toStr}.`;
        }
        // invalid/missing dates, still provide a generic message
        return "Die Daten beziehen sich auf eine Zeitspanne mit angegebenem Beginn und Ende.";
      }

      // Start is date, end is continuously
      if (fromIsDate && toIsContinuous) {
        if (v.fromDate) {
          return `Die Daten beziehen sich auf eine fortlaufende Zeitspanne seit dem ${fromStr}.`;
        }
        return "Die Daten beziehen sich auf eine fortlaufende Zeitspanne seit einem bestimmten Datum.";
      }

      // Start unknown/not-available, end is date
      if (!fromIsDate && toIsDate) {
        if (v.tillDate) {
          return `Die Daten beziehen sich auf eine Zeitspanne bis ${toStr} (Beginn unbekannt).`;
        }
        return "Die Daten beziehen sich auf eine Zeitspanne bis zu einem bestimmten Datum (Beginn unbekannt).";
      }

      // Start is date, end unknown/not-available
      if (fromIsDate && !toIsDate && !toIsContinuous) {
        if (v.fromDate) {
          return `Die Daten beziehen sich auf eine Zeitspanne ab dem ${fromStr} (Ende unbekannt).`;
        }
        return "Die Daten beziehen sich auf eine Zeitspanne ab einem bestimmten Datum (Ende unbekannt).";
      }

      // Both unknown/not-available
      if (!fromIsDate && !toIsDate && !toIsContinuous) {
        return "Die Daten beziehen sich auf eine Zeitspanne (Beginn und Ende unbekannt).";
      }

      // Start unknown/not-available, end continuously
      if (!fromIsDate && toIsContinuous) {
        return "Die Daten beziehen sich auf eine fortlaufende Zeitspanne (Beginn unbekannt).";
      }

      throw new IgeError(
        "Unbekannte Kombination der Intervalle: intervalFrom=" +
          v.intervalFrom +
          ", intervalTo=" +
          v.intervalTo,
      );
    }

    throw new IgeError("Unbekannter Typ: " + v.type);
  });
}
