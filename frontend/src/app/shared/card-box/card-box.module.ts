import { NgModule } from "@angular/core";
import { CardBoxComponent } from "./card-box.component";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatButtonModule } from "@angular/material/button";
import { NgIf } from "@angular/common";

@NgModule({
  declarations: [CardBoxComponent],
  imports: [MatCardModule, MatDividerModule, MatButtonModule, NgIf],
  exports: [CardBoxComponent],
})
export class CardBoxModule {}
