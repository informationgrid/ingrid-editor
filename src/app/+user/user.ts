export class User {
  // id: string;
  firstName: string;
  lastName: string;
  roles: number[];
  login: string;
  attributes: any[];
  password?: string;

  constructor(values: Object = {}) {
    Object.assign( this, values );
  }
}
