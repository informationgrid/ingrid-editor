export class Catalog {
  id: string;
  label: string;
  description: string;
  type: string;
  adminUser: string;

  static prepareForBackend(catalog: Catalog): any {
    return {
      id: catalog.id,
      name: catalog.label,
      description: catalog.description,
      type: catalog.type
    };
  }

  constructor(dataFromServer: any) {
    this.id = dataFromServer.id;
    this.label = dataFromServer.name;
    this.description = dataFromServer.description;
    this.type = dataFromServer.type;
    this.adminUser = dataFromServer.adminUser;
  }
}
