import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";
import {
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  MatAutocompleteModule,
} from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { DateAdapter, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { FormlyModule } from "@ngx-formly/core";
import { FormlyMatDatepickerModule } from "@ngx-formly/material/datepicker";
import { CommonModule } from "@angular/common";
import { MatPopoverEditModule } from "@angular/material-experimental/popover-edit";
import { FormFieldsModule } from "../form-fields/form-fields.module";
import { SharedModule } from "../shared/shared.module";
import { MatCardModule } from "@angular/material/card";
import { CodelistPipe } from "../directives/codelist.pipe";
import { MatMenuModule } from "@angular/material/menu";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatRadioModule } from "@angular/material/radio";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CloseScrollStrategy, Overlay } from "@angular/cdk/overlay";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { GermanDateAdapter } from "../services/german-date.adapter";
import { DialogTemplateModule } from "../shared/dialog-template/dialog-template.module";
import { UploadModule } from "../shared/upload/upload.module";
import { SharedPipesModule } from "../directives/shared-pipes.module";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { IgePagingIntl } from "../shared/IgePagingIntl";
import { FormlyMatToggleModule } from "@ngx-formly/material/toggle";
import { PrintTypeComponent } from "./types/print/print-type.component";
import { IgeFormlyModule } from "./ige-formly.module";

export function scrollFactory(overlay: Overlay): () => CloseScrollStrategy {
  return () => overlay.scrollStrategies.close();
}

@NgModule({
  imports: [
    IgeFormlyModule,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
    MatListModule,
    MatTableModule,
    MatPopoverEditModule,
    MatCardModule,
    FormlyMaterialModule,
    FormlyMatDatepickerModule,
    FormlyMatToggleModule,
    FormFieldsModule,
    SharedModule,
    MatMenuModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatRadioModule,
    DragDropModule,
    MatSlideToggleModule,
    DialogTemplateModule,
    UploadModule,
    SharedPipesModule,
    FormlySelectModule,
    NgxMatSelectSearchModule,
    MatPaginatorModule,
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: "de-DE",
    },
    {
      provide: DateAdapter,
      useClass: GermanDateAdapter,
    },
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: scrollFactory,
      deps: [Overlay],
    },
    {
      provide: MatPaginatorIntl,
      useValue: new IgePagingIntl(),
    },
  ],
  declarations: [PrintTypeComponent],
  exports: [ReactiveFormsModule, FormsModule, FormlyModule],
})
export class IgeFormlyPreviewModule {}
