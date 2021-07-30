import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { routing } from "./user.routing";
import { UserComponent } from "./user/user.component";
import { SharedModule } from "../shared/shared.module";
import { AngularSplitModule } from "angular-split";
import { MatTabsModule } from "@angular/material/tabs";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GroupComponent } from "./group/group.component";
import { UserManagementComponent } from "./user-management/user-management.component";
import { PermissionsComponent } from "./permissions/permissions.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { TreePermissionComponent } from "./permissions/tree-permission/tree-permission.component";
import { MatMenuModule } from "@angular/material/menu";
import { PermissionsDialogComponent } from "./permissions/permissions-dialog.component";
import { MatSelectModule } from "@angular/material/select";
import { NewUserDialogComponent } from "./user/new-user-dialog/new-user-dialog.component";
import { NewGroupDialogComponent } from "./group/new-group-dialog/new-group-dialog.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FormSharedModule } from "../+form/form-shared/form-shared.module";
import { HeaderMoreComponent } from "./user/header-more/header-more.component";
import { UserTableComponent } from "./user/user-table/user-table.component";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { GroupsTableComponent } from "./group/groups-table/groups-table.component";
import { GroupHeaderMoreComponent } from "./group/group-header-more/group-header-more.component";
import { PermissionTableComponent } from "./permissions/permission-table/permission-table.component";
import { PermissionAddDialogComponent } from "./permissions/permission-add-dialog/permission-add-dialog.component";
import { IgeSearchField } from "./ige-search-field/ige-search-field.component";
import { MatInputModule } from "@angular/material/input";
import { UserManagementService } from "./user-management.service";
import { MatSnackBarModule } from "@angular/material/snack-bar";

@NgModule({
  imports: [
    CommonModule,
    routing,
    AngularSplitModule,
    SharedModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    FormsModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatSelectModule,
    MatToolbarModule,
    FormSharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  declarations: [
    UserComponent,
    GroupComponent,
    UserManagementComponent,
    PermissionsDialogComponent,
    PermissionsComponent,
    TreePermissionComponent,
    NewUserDialogComponent,
    NewGroupDialogComponent,
    GroupHeaderMoreComponent,
    UserTableComponent,
    GroupsTableComponent,
    GroupHeaderMoreComponent,
    HeaderMoreComponent,
    PermissionTableComponent,
    PermissionAddDialogComponent,
    IgeSearchField,
  ],
  providers: [UserManagementService],
})
export class UserModule {}
