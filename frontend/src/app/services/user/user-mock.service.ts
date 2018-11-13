import {Observable, of} from "rxjs";
import {User} from "../../+user/user";

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
    return of(this.mockUsers);

  }

  saveUser(user: User): Observable<User> {
    return of();

  }

  createUser(user: User): Observable<User> {
    return of();

  }

  deleteUser(login: string): Observable<any> {
    return of();

  }



  getUser(id: string): Observable<User> {
    return of();
  }
}
