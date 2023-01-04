import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddButtonComponent } from "./add-button.component";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";

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
