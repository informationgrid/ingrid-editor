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
import { UserManagementComponent } from './user-management/user-management.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AngularSplitModule.forChild(),
    SharedModule,
    MatTabsModule,
    MatFormFieldModule,
    FormsModule
  ],
  declarations: [UserComponent, RoleComponent, UserManagementComponent]
})
export class UserModule {

}
