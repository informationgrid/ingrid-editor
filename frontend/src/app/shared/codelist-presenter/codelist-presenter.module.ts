import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CodelistPresenterComponent } from "./codelist-presenter.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { ScrollingModule } from "@angular/cdk/scrolling";

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    ScrollingModule,
  ],
  declarations: [CodelistPresenterComponent],
  exports: [CodelistPresenterComponent],
})
export class CodelistPresenterModule {}
