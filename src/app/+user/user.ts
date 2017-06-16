export class User {
  firstName: string;
  lastName: string;
  roles: number[];
  login: string;
  password: string;

  constructor(values: Object = {}) {
    Object.assign( this, values );
  }
}
