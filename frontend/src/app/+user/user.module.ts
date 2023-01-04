import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { routing } from "./user.routing";
import { UserComponent } from "./user/user.component";
import { SharedModule } from "../shared/shared.module";
import { AngularSplitModule } from "angular-split";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GroupComponent } from "./group/group.component";
import { UserManagementComponent } from "./user-management/user-management.component";
import { PermissionsComponent } from "./permissions/permissions.component";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { PermissionsDialogComponent } from "./permissions/permissions-dialog.component";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { NewUserDialogComponent } from "./user/new-user-dialog/new-user-dialog.component";
import { NewGroupDialogComponent } from "./group/new-group-dialog/new-group-dialog.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FormSharedModule } from "../+form/form-shared/form-shared.module";
import { HeaderMoreComponent } from "./user/header-more/header-more.component";
import { UserTableComponent } from "./user/user-table/user-table.component";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import {
  MatLegacyPaginatorIntl as MatPaginatorIntl,
  MatLegacyPaginatorModule as MatPaginatorModule,
} from "@angular/material/legacy-paginator";
import { IgePagingIntl } from "../shared/IgePagingIntl";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { GroupsTableComponent } from "./group/groups-table/groups-table.component";
import { GroupHeaderMoreComponent } from "./group/group-header-more/group-header-more.component";
import { PermissionTableComponent } from "./permissions/permission-table/permission-table.component";
import { PermissionAddDialogComponent } from "./permissions/permission-add-dialog/permission-add-dialog.component";
import { IgeSearchField } from "./ige-search-field/ige-search-field.component";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { UserManagementService } from "./user-management.service";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { RouterModule } from "@angular/router";
import { SharedPipesModule } from "../directives/shared-pipes.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { BreadcrumbModule } from "../+form/form-info/breadcrumb/breadcrumb.module";
import { TranslocoModule } from "@ngneat/transloco";

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
    SharedPipesModule,
    DragDropModule,
    BreadcrumbModule,
    TranslocoModule,
  ],
  declarations: [
    UserComponent,
    GroupComponent,
    UserManagementComponent,
    PermissionsDialogComponent,
    PermissionsComponent,
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
  exports: [RouterModule],
  providers: [
    UserManagementService,
    {
      provide: MatPaginatorIntl,
      useValue: new IgePagingIntl(),
    },
  ],
})
export class UserModule {}
