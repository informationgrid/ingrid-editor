import { Pipe, PipeTransform } from "@angular/core";
import { CodelistQuery } from "../store/codelist/codelist.query";
import { CodelistService } from "../services/codelist/codelist.service";
import { BackendOption, Codelist } from "../store/codelist/codelist.model";
import { filter, map, take, tap } from "rxjs/operators";
import { Observable, of, pipe } from "rxjs";
import { KeycloakService } from "keycloak-angular";
import { UserService } from "../services/user/user.service";
import { FrontendUser } from "../+user/user";
import { UserDataService } from "../services/user/user-data.service";

@Pipe({
  name: "fullName",
})
export class FullNamePipe implements PipeTransform {
  constructor(private userDataService: UserDataService) {}

  transform(value: number, args?: any): Observable<string> {
    return this.userDataService.getUserFullName(value);
  }
}
