import { NgModule } from "@angular/core";
import { CardBoxComponent } from "./card-box.component";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";

@NgModule({
  declarations: [CardBoxComponent],
  imports: [MatCardModule, MatDividerModule],
  exports: [CardBoxComponent],
})
export class CardBoxModule {}
