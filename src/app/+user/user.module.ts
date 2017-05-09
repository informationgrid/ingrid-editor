import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './user.routing';
import {UserComponent} from './user.component';
import {ModalModule} from 'ngx-modal';
import {UserService} from './user.service';
import {FormsModule} from '@angular/forms';
import {RoleService} from './role.service';
import {RoleComponent} from './role.component';
import {SharedModule} from '../shared.module';
import {MultiselectDropdownModule} from 'angular-2-dropdown-multiselect';

@NgModule({
  imports: [FormsModule, CommonModule, MultiselectDropdownModule, routing, ModalModule, SharedModule],
  declarations: [UserComponent, RoleComponent],
  providers: [UserService, RoleService],
  exports: []
})
export class UserModule {

}
