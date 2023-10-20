import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";
import { Group } from "../../../models/user-group";
import { firstValueFrom, Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { GeneralTable } from "../../general.table";
import { GroupService } from "../../../services/role/group.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ExportService } from "../../../services/export.service";

@Component({
  selector: "groups-table",
  templateUrl: "./groups-table.component.html",
  styleUrls: ["../../table.styles.scss"],
})
export class GroupsTableComponent
  extends GeneralTable
  implements OnInit, AfterViewInit
{
  @Input()
  set groups(val: Group[]) {
    if (val) this.isLoading = false;
    this.dataSource.data = val ?? [];

    // select previously selected group
    const selectedGroup = this.selection.selected[0];
    if (selectedGroup) this.setSelectionToItem(selectedGroup.id, "id");
  }

  @Input()
  set query(filter: string) {
    this.dataSource.filter = filter;
  }

  @Input() selectedGroup: Observable<number>;
  @Input() userGroupNames: string[];

  @Output() onGroupSelect = new EventEmitter<Group>();
  @Output() onDelete = new EventEmitter<number>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ["role-icon", "name"]; //, "settings"];
  dataSource = new MatTableDataSource([]);
  selection: SelectionModel<Group>;

  constructor(
    public groupService: GroupService,
    public dialog: MatDialog,
    private exportService: ExportService,
  ) {
    super();
    const initialSelection = [];
    const allowMultiSelect = false;
    this.selection = new SelectionModel<Group>(
      allowMultiSelect,
      initialSelection,
    );
    this.dataSource.filterPredicate = (group: Group, filterValue: string) => {
      let searchIn = [group.name ?? "", group.description ?? ""]
        .join(" ")
        .trim()
        .toLowerCase();
      return searchIn.includes(filterValue.trim().toLowerCase());
    };
  }

  ngOnInit() {
    this.selectedGroup
      .pipe(filter((groupId) => this.selection.selected[0]?.id !== groupId))
      .subscribe((groupId) => {
        this.setSelectionToItem(groupId, "id");
        this.updatePaginator(groupId, "id");
      });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  select(element) {
    this.selection.select(element);
    this.onGroupSelect.emit(element);
  }

  exportTable() {
    this.dialog
      .open(ConfirmDialogComponent, {
        hasBackdrop: true,
        data: <ConfirmDialogData>{
          title: "Exportieren",
          message:
            "Möchten Sie die Gruppendaten aus der Tabelle als csv-Datei herunterladen?",
          confirmButtonText: "Herunterladen",
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.downloadTable();
      });
  }

  private async downloadTable() {
    const rows: string[][] = [];
    const headerCol = [
      "Gruppe eingerichtet am",
      "Gruppenname",
      "Gruppenbeschreibung",
      "Anzahl zugeordneter Benutzer",
    ];
    rows.push(headerCol);
    for (const group of this.dataSource.filteredData) {
      rows.push(await this.buildRowByGroup(group));
    }
    this.exportService.exportCsv(rows, { exportName: "groups" });
  }

  private async buildRowByGroup(group): Promise<string[]> {
    const users = await firstValueFrom(
      this.groupService.getUsersOfGroup(group.id),
    );
    return [
      group.data.creationDate,
      group.name,
      group.description,
      users.length,
    ];
  }
}
