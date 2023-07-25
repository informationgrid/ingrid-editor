import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CodelistPresenterComponent } from "./codelist-presenter.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MatTooltipModule } from "@angular/material/tooltip";

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    ScrollingModule,
    MatTooltipModule,
  ],
  declarations: [CodelistPresenterComponent],
  exports: [CodelistPresenterComponent],
})
export class CodelistPresenterModule {}
