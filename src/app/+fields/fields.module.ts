import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {routing} from "./fields.routing";
import {FieldsComponent} from "./fields.component";

@NgModule({
  imports: [CommonModule, routing],
  declarations: [FieldsComponent],
  exports: []
})
export class FieldsModule {
}
