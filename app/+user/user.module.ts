import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {routing} from "./user.routing";
import {UserComponent} from "./user.component";

@NgModule({
  imports: [CommonModule, routing],
  declarations: [UserComponent],
  exports: []
})
export class UserModule {
}
