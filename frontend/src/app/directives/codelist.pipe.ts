import {Pipe, PipeTransform} from '@angular/core';
import {CodelistQuery} from '../store/codelist/codelist.query';
import {CodelistService} from '../services/codelist/codelist.service';
import {Codelist} from '../store/codelist/codelist.model';
import {filter, map, take} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Pipe({
  name: 'codelist'
})
export class CodelistPipe implements PipeTransform {

  constructor(
    private codelistQuery: CodelistQuery,
    private codelistService: CodelistService
  ) {
  }

  transform(value: string, id: string): Observable<string> {

    const codelist = this.codelistQuery.getEntity(id);

    if (!codelist) {
      this.codelistService.byId(id);
      return this.codelistQuery.selectEntity(id)
        .pipe(
          filter(cl => cl !== undefined),
          take(1),
          map((lazyCodelist: Codelist) => this.getEntryFromCodelist(lazyCodelist, value, id))
        );
    }

    const result = this.getEntryFromCodelist(codelist, value, id);
    return of(result);

  }


  private getEntryFromCodelist(codelist: Codelist, value: any, id: any) {

    const entries = codelist.entries.filter(item => item.id === value);
    if (entries.length === 1) {
      return entries[0].value;
    } else {
      console.error(`Codelist entry ${value} not found for codelise ${id}`);
      return `${value} (Freier Eintrag)`;
    }

  }
}
