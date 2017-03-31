import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './user.routing';
import {UserComponent} from './user.component';
import {ModalModule} from 'ng2-modal';
import {UserService} from './user.service';
import {FormsModule} from '@angular/forms';
import {RoleService} from './role.service';
import {RoleComponent} from './role.component';
import {MultiselectDropdown, MultiSelectSearchFilter} from './multi-select.component';
import {SharedModule} from '../shared.module';

@NgModule({
  imports: [FormsModule, CommonModule, routing, ModalModule, SharedModule],
  declarations: [UserComponent, RoleComponent, MultiselectDropdown, MultiSelectSearchFilter],
  providers: [UserService, RoleService],
  exports: []
})
export class UserModule {

}
