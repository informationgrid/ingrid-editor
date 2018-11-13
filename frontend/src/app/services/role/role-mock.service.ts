import {Observable, of} from "rxjs";
import {Role} from "../../models/user-role";

export class RoleMockService {

  getRoleMapping(id: string): Observable<any> {
    return of({

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
    return of();
  }
}
