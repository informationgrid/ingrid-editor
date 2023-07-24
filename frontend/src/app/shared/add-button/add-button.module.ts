import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddButtonComponent } from "./add-button.component";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  declarations: [AddButtonComponent],
  exports: [AddButtonComponent],
})
export class AddButtonModule {}
