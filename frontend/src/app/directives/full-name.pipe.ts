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
import { catchError, shareReplay } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { UserDataService } from "../services/user/user-data.service";

const fullNameCache = new Map<number, Observable<string>>([[null, of("")]]);

@Pipe({
    name: "fullName",
    standalone: true,
})
export class FullNamePipe implements PipeTransform {
  constructor(private userDataService: UserDataService) {}

  transform(value: number, args?: any): Observable<string> {
    if (!fullNameCache.has(value))
      fullNameCache.set(
        value,
        this.userDataService.getUserFullName(value).pipe(
          catchError(() => of(`Unbekannter Benutzer (${value})`)),
          shareReplay(1),
        ),
      );
    return fullNameCache.get(value);
  }
}
