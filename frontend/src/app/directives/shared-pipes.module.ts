import { NgModule } from "@angular/core";
import { DateAgoPipe } from "./date-ago.pipe";
import { FocusDirective } from "./focus.directive";
import { CodelistPipe } from "./codelist.pipe";

@NgModule({
  declarations: [DateAgoPipe, FocusDirective, CodelistPipe],
  imports: [],
  exports: [DateAgoPipe, FocusDirective, CodelistPipe],
})
export class SharedPipesModule {}
