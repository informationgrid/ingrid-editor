/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ObjectAttributesDialogComponent } from "../dialogs/object-attributes-dialog/object-attributes-dialog.component";
import { GeometriesDialogComponent } from "../dialogs/geometries-dialog/geometries-dialog.component";
import { BatchEditObjectAttributesComponent } from "../dialogs/batch-edit-object-attributes/batch-edit-object-attributes.component";
import { FormControl } from "@angular/forms";
import { MetadataOption } from "../../../app/formly/types/metadata-type/metadata-type.component";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeLubwSkdvOk extends GeoDatasetDoctype {
  constructor() {
    super();
    this.showAdVCompatible = false;
    this.showAdVProductGroup = false;
  }

  protected metadataOptions(): MetadataOption[] {
    return [
      /*      {
        label: "Verantwortung der Änderung",
        contextHelpKey: "responsible",
        required: true,
        typeOptions: [
          {
            multiple: false,
            key: "responsible",
            items: [
              {
                label: "Fachredaktion",
                value: "editor",
              },
              {
                label: "WIBAS AG Daten",
                value: "wibas",
              },
            ],
          },
        ],
      }*/ ...super
        .metadataOptions()
        .filter((item) => item.contextHelpKey !== "subType"),
    ];
  }

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    const isAuthor = this.configService.$userInfo.value.role === "author";
    if (isAuthor) {
      this.hideFieldsForEditor(fieldConfig);
    }

    const position = this.findFieldElementWithId(fieldConfig, "pointOfContact");
    this.addMultipleAfter(position, [
      this.addRepeatList("dataManagement", "Datenführende Stelle", {
        asSelect: true,
        codelistId: "30000",
        options: this.getCodelistForSelect("30000", "dataManagement"),
      }),
    ]);

    const positionAccessConstraints = this.findFieldElementWithId(
      fieldConfig,
      "accessConstraints",
    );
    this.addMultipleAfter(positionAccessConstraints, [
      this.addRadioboxes("personalData", "Personenbezogene Daten", {
        required: true,
        options: [
          {
            value: "Ja",
            id: true,
          },
          {
            value: "Nein",
            id: false,
          },
        ],
      }),
      this.addTextArea(
        "protectDataAccessControl",
        "Sperrung und Löschung in Hinblick auf den Schutz personenbezogener Daten",
        this.id,
        {
          wrappers: ["panel", "form-field"],
          expressions: {
            hide: (field: FormlyFieldConfig, a, b) =>
              field.options.formState.mainModel?.resource?.personalData !==
              true,
          },
        },
      ),
    ]);

    const positionFachbezug = this.findFieldElementWithId(
      fieldConfig,
      "featureTypes",
    );
    this.addMultipleAfter(positionFachbezug, [
      this.addSelect("environmentDescription", "Produktionsumgebung", {
        codelistId: "30001",
        options: this.getCodelistForSelect("30001", "environmentDescription"),
      }),
      this.addTable("objectAttributes", "Sachattribute", {
        supportUpload: false,
        allowDuplicate: true,
        dialog: ObjectAttributesDialogComponent,
        columns: [
          {
            key: "group",
            label: "Gruppe",
            props: {
              formatter: (item: any) => this.formatCodelistValue("30002", item),
            },
          },
          {
            key: "number",
            label: "Nummer",
            // type: "number",
          },
          {
            key: "designation",
            label: "Bezeichnung",
            props: { required: true },
          },
          {
            key: "description",
            label: "Beschreibung",
          },
          {
            key: "category",
            label: "Kategorie",
            type: "ige-select",
            props: {
              required: true,
              formatter: (item: any) => this.formatCodelistValue("30003", item),
            },
          },
          {
            key: "transmissionLevel",
            label: "Übermittlungsstufe",
            type: "ige-select",
            props: {
              required: true,
              formatter: (item: any) =>
                // this.formatCodelistValue("30004", item),
                item.key,
            },
          },
        ],
        batchActions: [
          {
            label: "Ändern",
            click: (items: any[], form: FormControl) => {
              this.handleBatchUpdate(items, form);
            },
          },
        ],
      }),
      this.addTable("geometries", "Geometrie", {
        supportUpload: false,
        allowDuplicate: true,
        dialog: GeometriesDialogComponent,
        columns: [
          {
            key: "number",
            label: "Nummer",
          },
          {
            key: "designation",
            label: "Bezeichnung",
            props: { required: true },
          },
          {
            key: "description",
            label: "Beschreibung",
            hidden: true,
          },
          {
            key: "type",
            label: "Geometrietyp",
            props: {
              required: true,
              formatter: (item: any) => this.formatCodelistValue("30005", item),
            },
          },
          {
            key: "scale",
            label: "Maßstab",
            props: {
              required: true,
              formatter: (item: any) => this.formatCodelistValue("30006", item),
            },
          },
          {
            key: "category",
            label: "Kategorie",
            props: {
              required: true,
              formatter: (item: any) => this.formatCodelistValue("30003", item),
            },
          },
          {
            key: "transmissionLevel",
            label: "Übermittlungsstufe",
            props: {
              required: true,
              formatter: (item: any) =>
                // this.formatCodelistValue("30004", item),
                item.key,
            },
          },
        ],
        batchActions: [
          {
            label: "Ändern",
            click: (items: any[], form: FormControl) => {
              this.handleBatchUpdate(items, form);
            },
          },
        ],
      }),
    ]);
    return fieldConfig;
  };

  private handleBatchUpdate(items: any[], form: FormControl<any>) {
    this.dialog
      .open(BatchEditObjectAttributesComponent)
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        items.forEach((item) => {
          if (result.category) {
            item.category = { key: result.category.value };
          }
          if (result.step) {
            item.transmissionLevel = { key: result.step.value };
          }
        });
        form.updateValueAndValidity();
        form.markAsDirty();
      });
  }

  private hideFieldsForEditor(fieldConfig: FormlyFieldConfig[]) {
    [
      "parentIdentifier",
      "alternateTitle",
      "graphicOverviews",
      "identifier",
      "spatialRepresentationType",
      "vectorSpatialRepresentation",
      "gridSpatialRepresentation",
      "resolution",
      "descriptions",
      ["portrayalCatalogueInfo", "citation"],
      ["featureCatalogueDescription", "citation"],
      ["processStep", "description"],
      "featureTypes",
      "language",
      "languages",
      "characterSet",
      "conformanceResult",
      "specificUsage",
      "format",
      "digitalTransferOptions",
      "orderInfo",
    ].forEach((field) => {
      if (field instanceof Array) {
        this.hideField(
          this.findFieldElementWithId(fieldConfig, field[1], field[0]).field,
        );
      } else {
        this.hideField(this.findFieldElementWithId(fieldConfig, field).field);
      }
    });

    this.hideField(this.findSectionWithLabel(fieldConfig, "Datenqualität"));
    this.hideField(this.findSectionWithLabel(fieldConfig, "Raumbezug"));
  }

  private hideField(fieldElement: FormlyFieldConfig) {
    if (!fieldElement.className || fieldElement.className.trim() === "") {
      fieldElement.className = "hide";
    } else {
      fieldElement.className += " hide";
    }
    // remove dynamic setting of className
    if (fieldElement.expressions?.className) {
      fieldElement.expressions.className = undefined;
    }
  }
}
