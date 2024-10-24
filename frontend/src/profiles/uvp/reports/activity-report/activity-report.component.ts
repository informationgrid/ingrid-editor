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
import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { UvpResearchService } from "../uvp-bericht/uvp-research.service";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Router } from "@angular/router";
import {
  FormControl,
  ReactiveFormsModule,
  UntypedFormControl,
} from "@angular/forms";
import { debounceTime } from "rxjs/operators";

import { SearchInputComponent } from "../../../../app/shared/search-input/search-input.component";

import { MatMenuModule } from "@angular/material/menu";
import { DatePipe } from "@angular/common";
import { ExportService } from "../../../../app/services/export.service";
import { BackendQuery } from "../../../../app/+research/backend-query.model";
import { PageTemplateNoHeaderComponent } from "../../../../app/shared/page-template/page-template-no-header.component";
import { CardBoxComponent } from "../../../../app/shared/card-box/card-box.component";
import { MatTooltip } from "@angular/material/tooltip";
import { DocumentIconComponent } from "../../../../app/shared/document-icon/document-icon.component";
import { FacetsComponent } from "../../../../app/+research/+facets/facets.component";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";

@UntilDestroy()
@Component({
  selector: "activity-report",
  templateUrl: "./activity-report.component.html",
  styleUrls: ["./activity-report.component.scss"],
  standalone: true,
  imports: [
    SearchInputComponent,
    MatTableModule,
    MatMenuModule,
    MatPaginatorModule,
    DatePipe,
    MatSortModule,
    PageTemplateNoHeaderComponent,
    CardBoxComponent,
    MatTooltip,
    DocumentIconComponent,
    ReactiveFormsModule,
    FacetsComponent,
    MatIcon,
    MatIconButton,
    MatButton,
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
            id: "unpublish",
            label: "Veröffentlichung zurückgezogen",
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
    private exportService: ExportService,
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
    this.startDate = formValue?.timeRef.start;
    this.endDate = BackendQuery.modifyToEndOfDay(formValue?.timeRef.end);
    const actions = [
      "create",
      "update",
      "publish",
      "unpublish",
      "delete",
    ].filter((action) => formValue?.actionType[action]);
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
            deleted: entry.action === "delete",
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
      case "unpublish":
        return "Veröffentlichung zurückgezogen";
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

  downloadTable() {
    const rows: string[][] = [];
    const headerCol = [
      "Typ",
      "UUID",
      "Titel",
      "Verfahrensführende Behörde UUID",
      "Verfahrensführende Behörde",
      "User",
      "Aktion",
      "Datum",
    ];
    rows.push(headerCol);
    for (const entry of this.dataSource.filteredData) {
      rows.push([
        entry.document_type,
        entry.dataset_uuid,
        entry.title,
        entry.contact_uuid,
        entry.contact_name,
        entry.actor,
        entry.action,
        entry.time,
      ]);
    }
    this.exportService.exportCsv(rows, { exportName: "bericht" });
  }
}
