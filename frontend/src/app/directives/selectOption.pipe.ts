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
import { SelectOptionUi } from "../services/codelist/codelist.service";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

@Pipe({
  name: "selectOption",
  standalone: true,
})
export class SelectOptionPipe implements PipeTransform {
  constructor() {}

  transform(
    value: string,
    options: Observable<SelectOptionUi[]>,
  ): Observable<string> {
    if (!options) {
      return of(value);
    }

    return options.pipe(map((opts) => this.mapValue(value, opts)));
  }

  private mapValue(value: string, options: SelectOptionUi[]) {
    const result = options
      ?.filter((option) => option.value === value)
      .map((option) => option.label);

    return result?.length > 0 ? result[0] : value;
  }
}
