import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './user.routing';
import {UserComponent} from './user/user.component';
import {SharedModule} from '../shared/shared.module';
import {AngularSplitModule} from 'angular-split';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GroupComponent} from './group/group.component';
import {UserManagementComponent} from './user-management/user-management.component';
import {PermissionsComponent} from './permissions/permissions.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {PermissionsShowComponent} from './user/permissions-show/permissions-show.component';
import {TreePermissionComponent} from './permissions/tree-permission/tree-permission.component';
import {MatMenuModule} from '@angular/material/menu';
import {PermissionsDialogComponent} from './permissions/permissions-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import {NewUserDialogComponent} from './user/new-user-dialog/new-user-dialog.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {FormSharedModule} from "../+form/form-shared/form-shared.module";
import {HeaderMoreComponent} from "./user/header-more/header-more.component";
import {UserTableComponent} from "./user/user-table/user-table.component";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatChipsModule} from "@angular/material/chips";

@NgModule({
    imports: [
        CommonModule,
        routing,
        AngularSplitModule,
        SharedModule,
        MatTabsModule,
        MatFormFieldModule,
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
        MatChipsModule
    ],
  declarations: [
    UserComponent, GroupComponent, UserManagementComponent, PermissionsDialogComponent, PermissionsComponent,
    PermissionsShowComponent, TreePermissionComponent, NewUserDialogComponent, HeaderMoreComponent, UserTableComponent]
})
export class UserModule {

}
