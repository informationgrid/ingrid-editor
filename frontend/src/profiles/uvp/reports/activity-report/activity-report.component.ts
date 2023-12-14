import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { UvpResearchService } from "../uvp-bericht/uvp-research.service";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Router } from "@angular/router";
import { FormControl, UntypedFormControl } from "@angular/forms";
import { debounceTime } from "rxjs/operators";
import { PageTemplateModule } from "../../../../app/shared/page-template/page-template.module";
import { SearchInputComponent } from "../../../../app/shared/search-input/search-input.component";
import { SharedModule } from "../../../../app/shared/shared.module";
import { DocumentIconModule } from "../../../../app/shared/document-icon/document-icon.module";
import { MatMenuModule } from "@angular/material/menu";
import { DatePipe } from "@angular/common";
import { FormSharedModule } from "../../../../app/+form/form-shared/form-shared.module";

@UntilDestroy()
@Component({
  selector: "activity-report",
  templateUrl: "./activity-report.component.html",
  styleUrls: ["./activity-report.component.scss"],
  standalone: true,
  imports: [
    PageTemplateModule,
    SearchInputComponent,
    SharedModule,
    MatTableModule,
    DocumentIconModule,
    MatMenuModule,
    MatPaginatorModule,
    DatePipe,
    FormSharedModule,
    MatSortModule,
  ],
})
export class ActivityReportComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource([]);
  displayedColumns = [
    "document_type",
    "title",
    "contact_name",
    "actor",
    "action",
    "time",
    "settings",
  ];

  startDate: string;
  endDate: string;

  query = new FormControl<string>("");
  facets = {
    addresses: [],
    documents: [
      {
        id: "timeRef",
        label: "Datum",
        filter: [
          {
            id: "selectTimespan",
            label: "<group label will be used>",
          },
        ],
        viewComponent: "TIMESPAN",
      },
      {
        id: "actionType",
        label: "Aktion",
        filter: [
          {
            id: "create",
            label: "Erstellt",
          },
          {
            id: "update",
            label: "Aktualisiert",
          },
          {
            id: "publish",
            label: "Veröffentlicht",
          },
          {
            id: "delete",
            label: "Gelöscht",
          },
        ],
        combine: null,
        viewComponent: "CHECKBOX",
      },
    ],
  };
  facetForm = new UntypedFormControl();

  constructor(
    private uvpResearchService: UvpResearchService,
    private router: Router,
  ) {
    this.getReport(null);

    this.facetForm.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => this.getReport(this.facetForm.value));

    this.query.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => (this.dataSource.filter = this.query.value));
  }

  getReport(formValue) {
    this.startDate = formValue?.timeRef.start?.toISOString();
    this.endDate = formValue?.timeRef.end?.toISOString();
    const actions = ["create", "update", "publish", "delete"].filter(
      (action) => formValue?.actionType[action],
    );
    this.uvpResearchService
      .getActivityReport(this.startDate, this.endDate, actions)
      .subscribe((report) => {
        this.dataSource.data = report.map((entry) => {
          return {
            time: entry.time,
            title: entry.title,
            document_type: entry.document_type,
            dataset_uuid: entry.dataset_uuid,
            contact_name: entry.contact_name,
            contact_uuid: entry.contact_uuid,
            actor: entry.actor,
            action: this.translateAction(entry.action),
          };
        });
      });
  }

  translateAction(action: String) {
    switch (action) {
      case "create":
        return "Erstellt";
      case "update":
        return "Aktualisiert";
      case "publish":
        return "Veröffentlicht";
      case "delete":
        return "Gelöscht";
      default:
        return action;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  openDataset(element) {
    const target = ConfigService.catalogId + "/form";
    this.router.navigate([target, { id: element.dataset_uuid }]);
  }
}
