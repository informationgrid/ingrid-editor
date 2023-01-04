import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UploadComponent } from "./upload.component";
import { UploadItemComponent } from "./upload-item/upload-item.component";
import { SizePipe } from "../../directives/size.pipe";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyProgressBarModule as MatProgressBarModule } from "@angular/material/legacy-progress-bar";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { FlexModule } from "@angular/flex-layout";
import { NgxFlowModule } from "@flowjs/ngx-flow";

@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    FlexModule,
    NgxFlowModule,
  ],
  declarations: [UploadComponent, UploadItemComponent, SizePipe],
  exports: [UploadComponent],
})
export class UploadModule {}
