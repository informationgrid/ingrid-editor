import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {routing} from "./dashboard.routing";
import {DashboardComponent} from "./dashboard.component";

@NgModule({
  imports: [CommonModule, routing],
  declarations: [DashboardComponent],
  exports: []
})
export class DashboardModule {}
