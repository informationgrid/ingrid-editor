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
import {
  AfterViewInit,
  Component,
  effect,
  input,
  Input,
  OnInit,
  output,
  ViewChild,
} from "@angular/core";
import {
  FrontendUser,
  PermissionLevel,
  User,
  UserWithDocPermission,
} from "../../user";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";
import { firstValueFrom } from "rxjs";
import { UserService } from "../../../services/user/user.service";
import { GeneralTable } from "../../general.table";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { GroupDataService } from "../../../services/role/group-data.service";
import { Group } from "../../../models/user-group";
import { TranslocoModule } from "@ngneat/transloco";
import { MatIconModule } from "@angular/material/icon";

import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PermissionLegendsComponent } from "../../permissions/permission-legends/permission-legends.component";
import { ExportService } from "../../../services/export.service";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "user-table",
  templateUrl: "./user-table.component.html",
  styleUrls: ["../../table.styles.scss"],
  imports: [
    MatTableModule,
    MatIconModule,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    PermissionLegendsComponent,
    TranslocoModule,
    MatTooltipModule,
  ],
  standalone: true,
})
export class UserTableComponent
  extends GeneralTable
  implements OnInit, AfterViewInit
{
  @Input() tableType: "default" | "simple" | "permission" = "default";

  users = input<User[]>(null);
  query = input<string>("");
  canExport = input<boolean>(true);
  defaultSort = input<string>();
  selectedUser = input<User>(null);

  onUserSelect = output<User>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  PERMISSION_LEVEL = PermissionLevel;

  displayedColumns: string[];
  dataSource = new MatTableDataSource<User>([]);
  selection: SelectionModel<User>;

  constructor(
    public userService: UserService,
    public groupDataService: GroupDataService,
    public dialog: MatDialog,
    private exportService: ExportService,
  ) {
    super();
    const initialSelection = [];
    const allowMultiSelect = false;
    this.selection = new SelectionModel<User>(
      allowMultiSelect,
      initialSelection,
    );
    this.dataSource.filterPredicate = (user: User, filterValue: string) => {
      // collect values from attributes
      let searchInValues = [
        user.login ?? "",
        user.firstName ?? "",
        user.lastName ?? "",
        user.email ?? "",
        user.organisation ?? "",
        user.department ?? "",
      ];

      // append permission value
      if (user instanceof UserWithDocPermission) {
        searchInValues = [
          ...searchInValues,
          this.getSearchKeyByPermission(user.permission),
        ];
      }

      const combined = searchInValues.join(" ").trim().toLowerCase();
      return combined.includes(filterValue.trim().toLowerCase());
    };

    effect(() => {
      const userLogin = this.selectedUser()?.login;
      if (this.selection.selected[0]?.login !== userLogin) {
        this.setSelectionToItem(userLogin, "login");
        this.updatePaginator(userLogin, "login");
      }
    });

    effect(
      () => {
        if (this.users() === null) return;
        this.dataSource.data = this.users();
        this.isLoading.set(false);
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      this.dataSource.filter = this.query();
    });
  }

  ngOnInit() {
    this.displayedColumns = this.getColumnsByViewType();
  }

  private getColumnsByViewType(): string[] {
    switch (this.tableType) {
      case "simple":
        return ["role-icon", "firstName"];
      case "permission":
        return ["login", "firstName", "role", "permission"];
      default:
        return ["role-icon", "login", "firstName", "organisation"];
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  select(element) {
    this.selection.select(element);
    this.onUserSelect.emit(element);
  }

  exportTable() {
    this.dialog
      .open(ConfirmDialogComponent, {
        hasBackdrop: true,
        data: <ConfirmDialogData>{
          title: "Exportieren",
          message:
            "Möchten Sie die Nutzerdaten aus der Tabelle als csv-Datei herunterladen?",
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
    const headerCols = [
      "Account eingerichtet am",
      "Benutzername",
      "Rolle",
      "Name",
      "Vorname",
      "E-Mail-Adresse",
      "Organisation",
      "Abteilung",
      "Telefon-Nr.",
      "Zugeordnete Gruppe(n)",
    ];
    rows.push(headerCols);

    // Get groups for [Zugeordnete Gruppe(n)].
    const groups = (
      await firstValueFrom(this.groupDataService.getGroups())
    ).map((group) => group.backendGroup);

    // Create rows by existing users.
    for (const user of this.dataSource.filteredData) {
      rows.push(this.buildRowByUser(user, groups));
    }

    this.exportService.exportCsv(rows, { exportName: "users" });
  }

  private buildRowByUser(user: FrontendUser, groups: Group[]): string[] {
    const columns = [
      user.creationDate.toString(),
      user.login,
      user.role,
      user.lastName,
      user.firstName,
      user.email,
      user.organisation,
      user.department,
      user.phoneNumber,
    ];
    // Add group names if assigned.
    if (user.groups?.length) {
      let groupNames = [];
      for (const userGroup of user.groups) {
        const group = groups.find(
          (group) => group.id.toString() == userGroup.key,
        );
        if (group != undefined) groupNames.push(group.name);
      }
      if (groupNames.length) columns.push(groupNames.join(" | "));
    }
    return columns;
  }

  private getSearchKeyByPermission(permission: PermissionLevel): string {
    switch (permission) {
      case PermissionLevel.WRITE:
        return "Schreibrecht";
      case PermissionLevel.READ:
        return "Leserecht";
      case PermissionLevel.WRITE_EXCEPT_PARENT:
        return "Nur Unterordner";
    }
  }
}
