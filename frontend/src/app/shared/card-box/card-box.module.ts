import { NgModule } from "@angular/core";
import { CardBoxComponent } from "./card-box.component";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatDividerModule } from "@angular/material/divider";
import { FlexModule } from "@angular/flex-layout";

@NgModule({
  declarations: [CardBoxComponent],
  imports: [MatCardModule, MatDividerModule, FlexModule],
  exports: [CardBoxComponent],
})
export class CardBoxModule {}
