import {Observable} from "rxjs";
import {User} from "../../+user/user";
import {map} from "rxjs/operators";

export class UserMockService {

  private mockUsers: User[] = [
    {
      firstName: 'Herbert',
      lastName: 'Meier',
      login: 'hm',
      roles: [],
      attributes: []
    }
  ];

  getUsers(): Observable<User[]> {
    return Observable.of(this.mockUsers);

  }

  saveUser(user: User): Observable<User> {
    return Observable.of();

  }

  createUser(user: User): Observable<User> {
    return Observable.of();

  }

  deleteUser(login: string): Observable<any> {
    return Observable.of();

  }



  getUser(id: string): Observable<User> {
    return Observable.of();
  }
}
