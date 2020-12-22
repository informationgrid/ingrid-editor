import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './user.routing';
import {UserComponent} from './user/user.component';
import {SharedModule} from '../shared/shared.module';
import {AngularSplitModule} from 'angular-split';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {RoleComponent} from './role/role.component';
import {UserManagementComponent} from './user-management/user-management.component';
import {PermissionsComponent} from './permissions/permissions.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AngularSplitModule.forChild(),
    SharedModule,
    MatTabsModule,
    MatFormFieldModule,
    MatDialogModule,
    FormsModule,
    MatSlideToggleModule
  ],
  declarations: [UserComponent, RoleComponent, UserManagementComponent, PermissionsComponent]
})
export class UserModule {

}
