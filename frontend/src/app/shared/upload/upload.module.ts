import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UploadComponent } from "./upload.component";
import { UploadItemComponent } from "./upload-item/upload-item.component";
import { SizePipe } from "../../directives/size.pipe";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonModule } from "@angular/material/button";
import { NgxFlowModule } from "@flowjs/ngx-flow";

@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    NgxFlowModule,
  ],
  declarations: [UploadComponent, UploadItemComponent, SizePipe],
  exports: [UploadComponent],
})
export class UploadModule {}
