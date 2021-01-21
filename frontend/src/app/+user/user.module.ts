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
    MatSelectModule
  ],
  declarations: [
    UserComponent, GroupComponent, UserManagementComponent, PermissionsDialogComponent, PermissionsComponent,
    PermissionsShowComponent, TreePermissionComponent, NewUserDialogComponent]
})
export class UserModule {

}
