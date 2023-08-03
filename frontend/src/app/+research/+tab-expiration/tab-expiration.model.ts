import { IgeDocument } from "../../models/ige-document";

export class ExpiredData {
  objects?: IgeDocument[];
  addresses?: IgeDocument[];
  totalHits: number;

  constructor(objects?: IgeDocument[], addresses?: IgeDocument[]) {
    this.objects = objects;
    this.addresses = addresses;
    this.totalHits = (objects?.length ?? 0) + (addresses?.length ?? 0);
  }

  filterById(id: number): ExpiredData {
    return new ExpiredData(
      this._filterById(id, this.objects),
      this._filterById(id, this.addresses)
    );
  }

  private _filterById(id: number, docs: IgeDocument[]): IgeDocument[] {
    return docs?.filter((doc) => doc._responsibleUser == id);
  }
}
