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
      organisation: "",
      department: "",
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
