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
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { signal } from "@angular/core";

export class GeneralTable {
  declare paginator: MatPaginator;
  declare dataSource: MatTableDataSource<any>;
  declare selection: SelectionModel<any>;

  isLoading = signal<boolean>(true);

  updatePaginator(id: any, field: string) {
    if (this.paginator) {
      let indexInDatasource = this.dataSource
        .sortData(this.dataSource.data, this.dataSource.sort)
        .findIndex((d) => d[field] === id);

      const pageNumber = Math.max(
        0,
        Math.floor(indexInDatasource / this.paginator.pageSize),
      );

      this.paginator.pageIndex = pageNumber;
      this.paginator.page.next({
        pageIndex: pageNumber,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length,
      });
    }
  }

  setSelectionToItem(value: string | number, key: string) {
    this.selection.select(
      this.dataSource.data.find((group) => group[key] == value),
    );
  }
}
