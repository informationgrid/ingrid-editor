import { NgModule } from "@angular/core";
import { DateAgoPipe } from "./date-ago.pipe";
import { FocusDirective } from "./focus.directive";

@NgModule({
  declarations: [DateAgoPipe, FocusDirective],
  imports: [],
  exports: [DateAgoPipe, FocusDirective],
})
export class SharedPipesModule {}
