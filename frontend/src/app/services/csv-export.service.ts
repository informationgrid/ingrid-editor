import { Injectable } from "@angular/core";
import { saveAs } from "file-saver";

@Injectable({
  providedIn: "root",
})
export class CsvExportService {
  constructor() {}

  export(
    rows: string[][],
    opts?: {
      exportName?: string;
    }
  ) {
    // with BOM at the beginning to handle german characters.
    let fileText = "\uFEFF";
    for (const row of rows) fileText += this.buildFileRow(row);
    const blob = new Blob([fileText], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, `${opts?.exportName ?? "data"}.csv`);
  }

  private buildFileRow(values: string[]): string {
    return `${values.join(";")}\n`;
  }
}
