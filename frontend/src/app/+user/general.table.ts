import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";

export class GeneralTable {
  declare paginator: MatPaginator;
  declare dataSource: MatTableDataSource<any>;
  declare selection: SelectionModel<any>;

  isLoading = true;

  updatePaginator(id, field: string) {
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
