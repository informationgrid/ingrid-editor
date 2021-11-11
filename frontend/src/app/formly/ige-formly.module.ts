import { NgModule } from "@angular/core";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
} from "@angular/forms";
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
import { CodelistPipe } from "../directives/codelist.pipe";
import { MatMenuModule } from "@angular/material/menu";
import { SpatialDialogComponent } from "./types/map/spatial-dialog/spatial-dialog.component";
import { FreeSpatialComponent } from "./types/map/spatial-dialog/free-spatial/free-spatial.component";
import { WktSpatialComponent } from "./types/map/spatial-dialog/wkt-spatial/wkt-spatial.component";
import { DrawSpatialComponent } from "./types/map/spatial-dialog/draw-spatial/draw-spatial.component";
import { NameSpatialComponent } from "./types/map/spatial-dialog/name-spatial/name-spatial.component";
import { RepeatListComponent } from "./types/repeat-list/repeat-list.component";
import { FormErrorComponent } from "../+form/form-shared/ige-form-error/form-error.component";
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

export function IpValidator(control: FormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : { ip: true };
}

export function EmailValidator(control: FormControl): ValidationErrors {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(control.value)
    ? null
    : { email: true };
}

export function EmailInRepeatValidator(control: FormControl): ValidationErrors {
  const connectionType = control.parent.value.type;
  // if connection type is email
  if (connectionType === "3") {
    console.log(EmailValidator(control));
    return EmailValidator(control);
  }
}

export function LowercaseValidator(control: FormControl): ValidationErrors {
  return control.value === control.value.toLowerCase()
    ? null
    : { lowercase: true };
}

export function scrollFactory(overlay: Overlay): () => CloseScrollStrategy {
  return () => overlay.scrollStrategies.close();
}

@NgModule({
  imports: [
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
      ],
      validators: [
        { name: "ip", validation: IpValidator },
        { name: "lowercase", validation: LowercaseValidator },
        { name: "email", validation: EmailValidator },
        { name: "emailInRepeat", validation: EmailInRepeatValidator },
      ],
      validationMessages: [
        { name: "required", message: "Dieses Feld muss ausgefüllt sein" },
        {
          name: "email",
          message: "Dieses Feld muss eine gültige E-Mail Adresse sein",
        },
        {
          name: "emailInRepeat",
          message: "Dieses Feld muss eine gültige E-Mail Adresse sein",
        },
        {
          name: "lowercase",
          message: "Dieses Feld darf keine Großbuchstaben enthalten",
        },
      ] /*,
      wrappers: [
        { name: 'panel', component: OneColumnWrapperComponent },
      ]*/,
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
  ],
  declarations: [
    CodelistPipe,
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
    DrawSpatialComponent,
    NameSpatialComponent,
    RepeatListComponent,
    RepeatComponent,
    RepeatDetailListComponent,
    FormErrorComponent,
    FormDialogComponent,
    RepeatChipComponent,
    ChipDialogComponent,
    DateRangeTypeComponent,
    RepeatDetailListComponent,
    UploadTypeComponent,
  ],
  exports: [
    ReactiveFormsModule,
    FormsModule,
    FormlyModule,
    ContextHelpComponent,
  ],
})
export class IgeFormlyModule {}
