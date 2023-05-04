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
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { GeneralTable } from "../../general.table";
import { saveAs } from "file-saver";
import { GroupService } from "../../../services/role/group.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";

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

  constructor(public groupService: GroupService, public dialog: MatDialog) {
    super();
    const initialSelection = [];
    const allowMultiSelect = false;
    this.selection = new SelectionModel<Group>(
      allowMultiSelect,
      initialSelection
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
    // Create the header row.
    const headerColumns = [
      "Gruppe eingerichtet am",
      "Gruppenname",
      "Gruppenbeschreibung",
      "Anzahl zugeordneter Benutzer",
    ];
    let fileText = this.createRow(headerColumns);

    // Create rows by groups.
    for (const group of this.dataSource.filteredData) {
      const users = await this.groupService
        .getUsersOfGroup(group.id)
        .toPromise();
      const groupColumns = [
        group.data.creationDate,
        group.name,
        group.description,
        users.length,
      ];
      fileText += this.createRow(groupColumns);
    }

    const blob = new Blob([fileText], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "groups.csv");
  }

  private createRow(values: string[]) {
    return `${values.join(";")}\n`;
  }
}
