export class RoleAttribute {
  id: string;
  value: string;
}

export class Role {
  id: string;
  name: string;
  pages: string[];
  attributes: RoleAttribute[];
  datasets: any[];

  constructor(values: Object = {}) {
    Object.assign( this, values );
  }
}
