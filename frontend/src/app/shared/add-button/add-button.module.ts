import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddButtonComponent } from "./add-button.component";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
  ],
  declarations: [AddButtonComponent],
  exports: [AddButtonComponent],
})
export class AddButtonModule {}
