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
import { CodelistQuery } from "../store/codelist/codelist.query";
import { CodelistService } from "../services/codelist/codelist.service";
import { BackendOption, Codelist } from "../store/codelist/codelist.model";
import { filter, map, take } from "rxjs/operators";
import { Observable, of } from "rxjs";

@Pipe({
  name: "codelist",
})
export class CodelistPipe implements PipeTransform {
  constructor(
    private codelistQuery: CodelistQuery,
    private codelistService: CodelistService,
  ) {}

  transform(
    value: string | BackendOption | null,
    id: string,
    lang = "de",
  ): Observable<string> {
    if (!id) return of(value as string);
    if (value === null) return of(null);
    const codelist = this.codelistQuery.getEntity(id);

    if (!codelist) {
      this.codelistService.byId(id);
      return this.codelistQuery.selectEntity(id).pipe(
        filter((cl) => cl !== undefined),
        take(1),
        map(
          (lazyCodelist: Codelist) =>
            this.getEntryFromCodelist(lazyCodelist, value, id)[lang],
        ),
      );
    }

    const result = this.getEntryFromCodelist(codelist, value, id);
    return of(result[lang]);
  }

  private getEntryFromCodelist(
    codelist: Codelist,
    value: string | BackendOption,
    id: any,
  ) {
    let codelistValue = value;
    if (value instanceof Object) {
      codelistValue = value.key;
    }

    const entries = codelist.entries.filter(
      (item) => item.id === codelistValue,
    );
    if (entries.length === 1) {
      return entries[0].fields;
    } else {
      console.log(
        `Codelist entry ${codelistValue} not found for codelist ${id}`,
      );
      return `${codelistValue} (Freier Eintrag)`;
    }
  }
}
