/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Injectable } from "@angular/core";
import { saveAs } from "file-saver-es";

@Injectable({
  providedIn: "root",
})
export class ExportService {
  constructor() {}

  exportCsv(
    rows: string[][],
    opts?: {
      exportName?: string;
    },
  ) {
    // with BOM at the beginning to handle german characters.
    let fileText = "\uFEFF";
    for (const row of rows) fileText += this.buildFileRow(row);
    const blob = new Blob([fileText], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, `${opts?.exportName ?? "data"}.csv`);
  }

  exportXml(
    xmlText: string,
    opts?: {
      exportName?: string;
    },
  ) {
    const blob = new Blob([xmlText], {
      type: "text/xml",
    });
    saveAs(blob, `${opts?.exportName ?? "data"}.xml`);
  }

  private buildFileRow(values: string[]): string {
    return `${values.join(";")}\n`;
  }
}
