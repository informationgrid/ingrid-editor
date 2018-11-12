import {Observable} from "rxjs";
import {ConfigService, Configuration} from "../config/config.service";
import {HttpClient} from "@angular/common/http";
import {Role} from "../../models/user-role";

export class RoleMockService {

  getRoleMapping(id: string): Observable<any> {
    return Observable.of({

    });
  }

  saveRole(role: Role): Observable<any> {
    return null;
  }

  createRole(role: Role): Observable<any> {
    return null;
  }

  // delete group metadata from backend
  deleteRole(id: string): Observable<any> {
    return null;
  }

  getGroups(): Observable<any> {
    return Observable.of();
  }
}
