import { AfterViewInit, Component, Input, ViewChild } from "@angular/core";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { IgeDocument } from "../../../models/ige-document";
import { ResearchResponse } from "../../research.service";
import { AsyncPipe, DatePipe, NgIf } from "@angular/common";
import { DocumentIconModule } from "../../../shared/document-icon/document-icon.module";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { ConfigService } from "../../../services/config/config.service";
import { Router } from "@angular/router";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatDividerModule } from "@angular/material/divider";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SharedPipesModule } from "../../../directives/shared-pipes.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: "ige-expiration-table",
  templateUrl: "./expiration-table.component.html",
  styleUrls: ["./expiration-table.component.scss"],
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    DocumentIconModule,
    NgIf,
    MatPaginatorModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    AsyncPipe,
    SharedPipesModule,
    DatePipe,
    MatTooltipModule,
    SharedModule,
  ],
})
export class ExpirationTableComponent implements AfterViewInit {
  @Input() isSearching: boolean;

  @Input()
  set filterUserId(id: number) {
    this.dataSource.filter = id?.toString();
  }

  @Input() set result(val: ResearchResponse) {
    this.updateTableByResult(val);
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  totalHits: number;
  dataSource = new MatTableDataSource<IgeDocument>([]);
  displayedColumns: string[] = [
    "_type",
    "title",
    "_contentModified",
    "_responsibleUser",
  ];

  constructor(private router: Router) {
    this.dataSource.filterPredicate = (doc, filter) => {
      return doc._responsibleUser.toString() == filter;
    };
  }

  private updateTableByResult(val: ResearchResponse) {
    this.dataSource.data = val?.hits ?? [];
    this.totalHits = val?.totalHits ?? 0;
  }

  openDataset(element: IgeDocument) {
    if (this.isSearching) return;
    const target = `${ConfigService.catalogId}/form`;
    this.router.navigate([target, { id: element._uuid }]);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
