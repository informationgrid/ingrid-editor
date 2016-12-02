import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './user.routing';
import {UserComponent} from './user.component';
import {ModalModule} from 'ng2-modal';
import {UserService} from './user.service';

@NgModule({
  imports: [CommonModule, routing, ModalModule],
  declarations: [UserComponent],
  providers: [UserService],
  exports: []
})
export class UserModule {

}
