import { Observable, of } from "rxjs";
import { User } from "../../+user/user";

export class UserMockService {
  private mockUsers: User[] = [
    {
      // id: '1',
      firstName: "Herbert",
      lastName: "Meier",
      login: "hm",
      role: "md-admin",
      creationDate: new Date(),
      modificationDate: new Date(),
      attributes: [],
    },
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
