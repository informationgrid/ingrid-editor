import {NgModule, ViewChild} from "@angular/core";
import {CommonModule} from "@angular/common";
import {routing} from "./user.routing";
import {UserComponent} from "./user.component";
import {ModalModule, Modal} from "ng2-modal";

@NgModule({
  imports: [CommonModule, routing, ModalModule],
  declarations: [UserComponent],
  exports: []
})
export class UserModule {

}
