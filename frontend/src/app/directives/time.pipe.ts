import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "time",
  standalone: true,
})
export class TimePipe implements PipeTransform {
  transform(value: number, args?: any): any {
    switch (args) {
      case "short":
        return `${Math.ceil(value / 60)}`;
      default:
        return `${Math.floor(value / 60)}:${("0" + (value % 60)).slice(-2)}`;
    }
  }
}
