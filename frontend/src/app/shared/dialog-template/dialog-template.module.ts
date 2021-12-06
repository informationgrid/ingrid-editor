import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogTemplateComponent } from "./dialog-template.component";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { FlexModule } from "@angular/flex-layout";

@NgModule({
  declarations: [DialogTemplateComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FlexModule,
  ],
  exports: [DialogTemplateComponent],
})
export class DialogTemplateModule {}
