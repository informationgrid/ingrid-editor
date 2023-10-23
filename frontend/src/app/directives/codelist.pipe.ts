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
    value: string | BackendOption,
    id: string,
    lang = "de",
  ): Observable<string> {
    if (!id) return of(value as string);
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
      let fields = entries[0].fields;
      const hasDE = fields["de"];
      if (!hasDE) return { ...fields, de: fields["name"] };
      return fields;
    } else {
      console.log(
        `Codelist entry ${codelistValue} not found for codelist ${id}`,
      );
      return `${codelistValue} (Freier Eintrag)`;
    }
  }
}
