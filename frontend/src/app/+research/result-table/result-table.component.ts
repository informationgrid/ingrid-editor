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
import { MatLegacyTableDataSource as MatTableDataSource } from "@angular/material/legacy-table";
import { MatSort } from "@angular/material/sort";
import { MatLegacyPaginator as MatPaginator } from "@angular/material/legacy-paginator";
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
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { ConfigService } from "../../services/config/config.service";

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
  displayedColumns: string[] = ["_type", "title", "_modified", "settings"];
  columnsMap: SelectOptionUi[];
  showSaveButton: boolean;

  totalHits = 0;
  profileIconsMap: {};

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private profileQuery: ProfileQuery,
    private documentService: DocumentService,
    private dialog: MatDialog
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
}
