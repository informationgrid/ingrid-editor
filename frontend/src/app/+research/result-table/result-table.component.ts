/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ResearchResponse } from "../research.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { ProfileService } from "../../services/profile.service";
import { ProfileQuery } from "../../store/profile/profile.query";
import { IgeDocument } from "../../models/ige-document";
import { Router } from "@angular/router";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { DocumentService } from "../../services/document/document.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "../../services/config/config.service";
import { ExportService } from "../../services/export.service";
import { TranslocoService } from "@ngneat/transloco";

@Component({
  selector: "ige-result-table",
  templateUrl: "./result-table.component.html",
  styleUrls: ["./result-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultTableComponent implements OnInit, AfterViewInit {
  @Input() set result(val: ResearchResponse) {
    this.updateTableFromResponse(val);
  }

  @Input() isLoading = false;

  @Output() save = new EventEmitter<void>();
  @Output() export = new EventEmitter<string>();
  @Output() updated = new EventEmitter<void>();

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  dataSource = new MatTableDataSource<IgeDocument>([]);
  displayedColumns: string[] = [
    "_type",
    "title",
    "_contentModified",
    "settings",
  ];
  columnsMap: SelectOptionUi[];
  showSaveButton: boolean;

  totalHits = 0;
  profileIconsMap: {};

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private profileQuery: ProfileQuery,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private translocoService: TranslocoService,
  ) {}

  ngOnInit(): void {
    this.profileQuery.selectLoading().subscribe((isLoading) => {
      if (isLoading) return;

      let profiles = this.profileService.getProfiles();
      this.profileIconsMap = profiles.reduce((acc, val) => {
        acc[val.id] = val.iconClass;
        return acc;
      }, {});
      this.columnsMap = profiles[0].fieldsMap;
    });

    this.showSaveButton = this.save.observers.length > 0;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private updateTableFromResponse(val: ResearchResponse) {
    this.dataSource.data = val?.hits || [];
    this.totalHits = val?.totalHits || 0;
  }

  openDataset(element: IgeDocument) {
    const target =
      ConfigService.catalogId +
      (this.isAddress(element) ? "/address" : "/form");
    this.router.navigate([target, { id: element._uuid }]);
  }

  private isAddress(element: IgeDocument): boolean {
    return element._category === "address";
  }

  removeDataset(hit: IgeDocument) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Löschen",
          message: `Wollen Sie den Datensatz ${hit.title} wirklich löschen?`,
          buttons: [
            { text: "Abbruch" },
            {
              text: "Löschen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.documentService
            .delete([hit._id], this.isAddress(hit))
            .subscribe(() => this.updated.next());
        }
      });
  }

  downloadTable() {
    const rows: string[][] = [];
    rows.push([
      "ID",
      "Veröffentlichungsstatus",
      "Veröffentlichungseinschränkungen",
      "Typ",
      "Titel",
      "Aktualität",
    ]);
    for (const doc of this.dataSource.data) rows.push(this.buildRowByDoc(doc));
    this.exportService.exportCsv(rows, { exportName: "research" });
  }

  private buildRowByDoc(doc: IgeDocument) {
    return [
      doc._uuid,
      this.translocoService.translate(`docState.${doc._state}`),
      doc._tags ? this.translocoService.translate(`tags.${doc._tags}`) : "",
      this.translocoService.translate(`docType.${doc._type}`),
      doc.title,
      doc._contentModified,
    ];
  }
}
