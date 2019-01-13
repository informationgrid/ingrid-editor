import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {routing} from "./fields.routing";
import {FieldsComponent} from "./fields.component";
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: FieldsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, routing],
  declarations: [FieldsComponent],
  exports: [RouterModule]
})
export class FieldsModule {
}
