import { NgModule } from "@angular/core";
import { DocumentIconComponent } from "./document-icon.component";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  imports: [MatIconModule, CommonModule, MatTooltipModule, TranslocoModule],
  declarations: [DocumentIconComponent],
  exports: [DocumentIconComponent],
})
export class DocumentIconModule {}
