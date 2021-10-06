import { NativeDateAdapter } from "@angular/material/core";

export class GermanDateAdapter extends NativeDateAdapter {
  parse(value: string) {
    if (typeof value === "string" && value.indexOf(".") > -1) {
      const str = value.split(".");

      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);

      return new Date(year, month, date);
    } else if (typeof value === "string" && value === "") {
      return new Date();
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
