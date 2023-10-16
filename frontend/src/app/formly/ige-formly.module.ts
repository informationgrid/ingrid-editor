import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  MatAutocompleteModule,
} from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatPseudoCheckboxModule,
} from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { FormlyModule } from "@ngx-formly/core";
import { ContextHelpComponent } from "../shared/context-help/context-help.component";
import { AutocompleteTypeComponent } from "./types/autocomplete-type.component";
import { LeafletTypeComponent } from "./types/map/leaflet-type.component";
import { FormlyMatDatepickerModule } from "@ngx-formly/material/datepicker";
import { TableTypeComponent } from "./types/table/table-type.component";
import { CommonModule } from "@angular/common";
import { MatPopoverEditModule } from "@angular/material-experimental/popover-edit";
import { FormFieldsModule } from "../form-fields/form-fields.module";
import { SharedModule } from "../shared/shared.module";
import { AddressTypeComponent } from "./types/address-type/address-type.component";
import { AddressCardComponent } from "./types/address-type/address-card/address-card.component";
import { ChooseAddressDialogComponent } from "./types/address-type/choose-address-dialog/choose-address-dialog.component";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { SpatialDialogComponent } from "./types/map/spatial-dialog/spatial-dialog.component";
import { FreeSpatialComponent } from "./types/map/spatial-dialog/free-spatial/free-spatial.component";
import { WktSpatialComponent } from "./types/map/spatial-dialog/wkt-spatial/wkt-spatial.component";
import { RepeatListComponent } from "./types/repeat-list/repeat-list.component";
import { FormDialogComponent } from "./types/table/form-dialog/form-dialog.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { RepeatComponent } from "./types/repeat/repeat.component";
import { SelectOptionPipe } from "../directives/selectOption.pipe";
import { RepeatChipComponent } from "./types/repeat-chip/repeat-chip.component";
import { MatChipsModule } from "@angular/material/chips";
import { ChipDialogComponent } from "./types/repeat-chip/chip-dialog/chip-dialog.component";
import { DateRangeTypeComponent } from "./types/date-range-type/date-range-type.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatRadioModule } from "@angular/material/radio";
import { RepeatDetailListComponent } from "./types/repeat-detail-list/repeat-detail-list.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CloseScrollStrategy, Overlay } from "@angular/cdk/overlay";
import { UploadTypeComponent } from "./types/upload-type/upload-type.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { GermanDateAdapter } from "../services/german-date.adapter";
import { LinkDialogComponent } from "./types/table/link-dialog/link-dialog.component";
import { UploadFilesDialogComponent } from "./types/table/upload-files-dialog/upload-files-dialog.component";
import { DialogTemplateModule } from "../shared/dialog-template/dialog-template.module";
import { UploadModule } from "../shared/upload/upload.module";
import { SharedPipesModule } from "../directives/shared-pipes.module";
import {
  EmailValidator,
  IpValidator,
  LowercaseValidator,
  NotEmptyArrayValidator,
  PositiveNumValidator,
  UrlValidator,
} from "./input.validators";
import { SelectTypeComponent } from "./types/select-type/select-type.component";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { UvpSectionsComponent } from "./types/uvp-sections/uvp-sections.component";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { ReferencedDocumentsTypeComponent } from "./types/referenced-documents-type/referenced-documents-type.component";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { IgePagingIntl } from "../shared/IgePagingIntl";
import { FormlyMatToggleModule } from "@ngx-formly/material/toggle";
import { ValidUntilDialogComponent } from "./types/table/valid-until-dialog/valid-until-dialog.component";
import { PrintTypeComponent } from "./types/print/print-type.component";
import { PrintViewDialogComponent } from "../+form/dialogs/print-view/print-view-dialog.component";
import { AngularSplitModule } from "angular-split";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { DocumentReferenceTypeComponent } from "./types/document-reference-type/document-reference-type.component";
import { SelectGeoDatasetDialog } from "./types/document-reference-type/select-service-dialog/select-geo-dataset-dialog.component";
import { SelectCswRecordDialog } from "./types/document-reference-type/select-csw-record-dialog/select-csw-record-dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { DocumentIconModule } from "../shared/document-icon/document-icon.module";
import { CoordinatesSpatialComponent } from "./types/map/spatial-dialog/coordinates-spatial/coordinates-spatial.component";
import { UpdateGetCapabilitiesComponent } from "./types/update-get-capabilities/update-get-capabilities.component";
import { TranslocoModule } from "@ngneat/transloco";
import { PreviewImageComponent } from "./types/preview-image/preview-image.component";
import { GeothesaurusWfsgndeComponent } from "./types/map/spatial-dialog/geothesaurus-wfsgnde/geothesaurus-wfsgnde.component";
import { FormErrorComponent } from "../+form/form-shared/ige-form-error/form-error.component";
import { MixedCdkDragDropModule } from "angular-mixed-cdk-drag-drop";
import { RepeatDistributionDetailListComponent } from "../../profiles/bmi/formtypes/repeat-distribution-detail-list/repeat-distribution-detail-list.component";
import { FieldToAiraLabelledbyPipe } from "../directives/fieldToAiraLabelledby.pipe";

export function scrollFactory(overlay: Overlay): () => CloseScrollStrategy {
  return () => overlay.scrollStrategies.close();
}

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
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
    SharedPipesModule,
    FormlyModule.forChild({
      types: [
        {
          name: "autocomplete",
          component: AutocompleteTypeComponent,
        },
        {
          name: "leaflet",
          component: LeafletTypeComponent,
        },
        {
          name: "table",
          component: TableTypeComponent,
        },
        {
          name: "address-card",
          component: AddressTypeComponent,
        },
        {
          name: "repeat",
          component: RepeatComponent,
        },
        {
          name: "repeatList",
          component: RepeatListComponent,
        },
        {
          name: "repeatDetailList",
          component: RepeatDetailListComponent,
        },
        {
          name: "repeatDistributionDetailList",
          component: RepeatDistributionDetailListComponent,
        },
        {
          name: "repeatChip",
          component: RepeatChipComponent,
        },
        {
          name: "date-range",
          component: DateRangeTypeComponent,
        },
        {
          name: "upload",
          component: UploadTypeComponent,
        },
        {
          name: "select",
          component: SelectTypeComponent,
        },
        {
          name: "uvpPhases",
          component: UvpSectionsComponent,
        },
        {
          name: "referencedDocuments",
          component: ReferencedDocumentsTypeComponent,
        },
        {
          name: "couplingService",
          component: DocumentReferenceTypeComponent,
        },
        {
          name: "updateGetCapabilities",
          component: UpdateGetCapabilitiesComponent,
        },
        {
          name: "previewImage",
          component: PreviewImageComponent,
        },
        /* FOR PREVIEW */
        {
          name: "inputPrint",
          component: PrintTypeComponent,
        },
        {
          name: "textareaPrint",
          component: PrintTypeComponent,
        },
        {
          name: "address-cardPrint",
          component: PrintTypeComponent,
        },
        {
          name: "datepickerPrint",
          component: PrintTypeComponent,
        },
        {
          name: "repeatListPrint",
          component: PrintTypeComponent,
        },
        {
          name: "tablePrint",
          component: PrintTypeComponent,
        },
        {
          name: "selectPrint",
          component: PrintTypeComponent,
        },
        {
          name: "autocompletePrint",
          component: PrintTypeComponent,
        },
        {
          name: "previewImagePrint",
          component: PrintTypeComponent,
        },
      ],
      validators: [
        { name: "ip", validation: IpValidator },
        { name: "lowercase", validation: LowercaseValidator },
        { name: "email", validation: EmailValidator },
        { name: "notEmptyArray", validation: NotEmptyArrayValidator },
        { name: "url", validation: UrlValidator },
        { name: "positiveNum", validation: PositiveNumValidator },
      ],
      /*,
      wrappers: [
        { name: 'panel', component: OneColumnWrapperComponent },
      ]*/
    }),
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
    AngularSplitModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    DocumentIconModule,
    TranslocoModule,
    GeothesaurusWfsgndeComponent,
    FormErrorComponent,
    MixedCdkDragDropModule,
    PrintViewDialogComponent,
    MatPseudoCheckboxModule,
    FieldToAiraLabelledbyPipe,
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
  declarations: [
    SelectOptionPipe,
    ContextHelpComponent,
    AutocompleteTypeComponent,
    LeafletTypeComponent,
    TableTypeComponent,
    AddressTypeComponent,
    AddressCardComponent,
    ChooseAddressDialogComponent,
    SpatialDialogComponent,
    FreeSpatialComponent,
    WktSpatialComponent,
    RepeatListComponent,
    RepeatComponent,
    FormDialogComponent,
    RepeatChipComponent,
    ChipDialogComponent,
    DateRangeTypeComponent,
    UploadTypeComponent,
    LinkDialogComponent,
    UploadFilesDialogComponent,
    SelectTypeComponent,
    UvpSectionsComponent,
    ReferencedDocumentsTypeComponent,
    ValidUntilDialogComponent,
    PrintTypeComponent,
    DocumentReferenceTypeComponent,
    SelectGeoDatasetDialog,
    SelectCswRecordDialog,
    CoordinatesSpatialComponent,
    UpdateGetCapabilitiesComponent,
  ],
  exports: [
    ReactiveFormsModule,
    FormsModule,
    FormlyModule,
    ContextHelpComponent,
  ],
})
export class IgeFormlyModule {}
