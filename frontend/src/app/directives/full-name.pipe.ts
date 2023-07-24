import { Pipe, PipeTransform } from "@angular/core";
import { catchError } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { UserDataService } from "../services/user/user-data.service";

@Pipe({
  name: "fullName",
})
export class FullNamePipe implements PipeTransform {
  constructor(private userDataService: UserDataService) {}

  transform(value: number, args?: any): Observable<string> {
    return this.userDataService
      .getUserFullName(value)
      .pipe(catchError(() => of("Unbekannter Benutzer")));
  }
}
