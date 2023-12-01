import { AfterViewInit, Component, Input, ViewChild } from "@angular/core";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { IgeDocument } from "../../../models/ige-document";
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
import { A11yModule } from "@angular/cdk/a11y";

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
    A11yModule,
  ],
})
export class ExpirationTableComponent implements AfterViewInit {
  @Input() isSearching: boolean;

  @Input() set result(docs: IgeDocument[]) {
    this.dataSource.data = docs ?? [];
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<IgeDocument>([]);
  displayedColumns: string[] = [
    "_type",
    "title",
    "_contentModified",
    "_responsibleUser",
  ];

  constructor(private router: Router) {}

  openDataset(element: IgeDocument) {
    if (this.isSearching) return;
    this.router.navigate([this.getTargetRoute(element), { id: element._uuid }]);
  }

  private getTargetRoute(element: IgeDocument): string {
    const isAddress = element._category === "address";
    return ConfigService.catalogId + (isAddress ? "/address" : "/form");
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
