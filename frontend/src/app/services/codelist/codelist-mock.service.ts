import {Observable, of} from "rxjs";

export class CodelistMockService {

  byId(id: string): Observable<any> {
    return of({
      entries: [
        {
          id: 1,
          localisations: [
            ['de', 'Codelist Wert 1']
          ]
        },
        {
          id: 2,
          localisations: [
            ['de', 'Codelist Wert 2']
          ]
        },
        {
          id: 3,
          localisations: [
            ['de', 'Codelist Wert 3']
          ]
        }
      ],
    })
  }
}
