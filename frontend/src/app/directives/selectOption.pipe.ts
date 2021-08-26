import { Pipe, PipeTransform } from "@angular/core";
import { SelectOption } from "../services/codelist/codelist.service";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

@Pipe({
  name: "selectOption",
})
export class SelectOptionPipe implements PipeTransform {
  constructor() {}

  transform(
    value: string,
    options: Observable<SelectOption[]>
  ): Observable<string> {
    if (!options) {
      return of(value);
    }

    return options.pipe(map((opts) => this.mapValue(value, opts)));
  }

  private mapValue(value: string, options: SelectOption[]) {
    const result = options
      ?.filter((option) => option.value === value)
      .map((option) => option.label);

    return result?.length > 0 ? result[0] : value;
  }
}
