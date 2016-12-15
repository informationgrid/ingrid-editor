import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './user.routing';
import {UserComponent} from './user.component';
import {ModalModule} from 'ng2-modal';
import {UserService} from './user.service';
import {FormsModule} from '@angular/forms';
import {RoleService} from './role.service';
import {RoleComponent} from './role.component';

@NgModule({
  imports: [FormsModule, CommonModule, routing, ModalModule],
  declarations: [UserComponent, RoleComponent],
  providers: [UserService, RoleService],
  exports: []
})
export class UserModule {

}
