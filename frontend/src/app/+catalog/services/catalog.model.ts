export class Catalog {
  id: string;
  label: string;
  type: string;
  adminUser: string;

  constructor(dataFromServer: any) {
    this.id = dataFromServer.id;
    this.label = dataFromServer.name;
    this.type = dataFromServer.type;
    this.adminUser = dataFromServer.adminUser;
  }

  prepareForBackend(): any {
    return {
      id: this.id,
      name: this.label,
      type: this.type
    };
  }
}
