/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
      this._filterById(id, this.addresses),
    );
  }

  private _filterById(id: number, docs: IgeDocument[]): IgeDocument[] {
    return docs?.filter((doc) => doc._responsibleUser == id);
  }
}
// Data structure for expired dataset
export class ExpiredDataset {
  uuid: string | null = null;
  responsibleUserId: number | null = null;
  responsibleUserLogin: string | null = null;
  title: string | null = null;
  contentmodified: string | null = null; // OffsetDateTime equivalent in TypeScript is typically represented as ISO string
  contentmodifiedby: string | null = null;
  type: string = "";
  category: string = "";
}
