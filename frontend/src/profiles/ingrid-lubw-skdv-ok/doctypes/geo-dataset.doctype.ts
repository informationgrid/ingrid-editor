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
    this.allowOptionFieldsToggle = false;
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
    const position = this.findFieldElementWithId(fieldConfig, "pointOfContact");

    const isAuthor = this.configService.$userInfo.value.role === "author";
    if (isAuthor) {
      this.hideFieldsForEditor(fieldConfig);
      // only allow pointOfContact
      position.field.props.allowedTypes = ["7"];
    }

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
    const currentValidaors = positionAccessConstraints.field.validators ?? {};
    positionAccessConstraints.field.validators = {
      ...currentValidaors,
      personalDataLink: {
        expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
          !field.form.value.personalData ||
          ctrl.value?.some((item) => item.key === "7"),
        message:
          "Bei personenbezogenen Daten muss der Wert 'aufgrund der Vertraulichkeit personenbezogener Daten' vorhanden sein",
      },
      noPersonalDataLink: {
        expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
          field.form.value.personalData ||
          ctrl.value?.every((item) => item.key !== "7"),
        message:
          "Bei keinen personenbezogenen Daten darf der Wert 'aufgrund der Vertraulichkeit personenbezogener Daten' nicht verwendet werden",
      },
      ifNoneThenSingle: {
        expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
          !ctrl.value?.some((item) => item.key === "1") ||
          ctrl.value?.length === 1,
        message:
          "Neben 'Es gelten keine Zugriffsbeschränkungen' dürfen keine weiteren Zugriffsbeschränkungen angegeben sein",
      },
    };
    this.addMultipleBefore(positionAccessConstraints, [
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
        click: (field: FormlyFieldConfig) => {
          // delay execution in order to get the actual clicked value
          setTimeout(() => {
            const isPersonRelated = field.formControl.value;

            if (isPersonRelated) {
              this.handlePersonRelatedChoice(field);
            } else {
              this.handleNonPersonRelatedChoice(field);
            }
          });
        },
      }),
      this.addTextArea(
        "protectDataAccessControl",
        "Sperrung und Löschung in Hinblick auf den Schutz personenbezogener Daten",
        this.id,
        {
          wrappers: ["panel", "form-field"],
          required: true,
          resetOnHide: false,
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
        duplicatePostfixField: "designation",
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
        customAddFn: (
          allData: any[],
          item: any,
          isNew: boolean,
          currentIndex: number,
        ) =>
          this.addSortedTableEntry(isNew, item, allData, currentIndex, "group"),
      }),
      this.addTable("geometries", "Geometrie", {
        supportUpload: false,
        allowDuplicate: true,
        duplicatePostfixField: "designation",
        dialog: GeometriesDialogComponent,
        columns: [
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
        /*        customAddFn: (
          allData: any[],
          item: any,
          isNew: boolean,
          currentIndex: number,
        ) =>
          this.addSortedTableEntry(isNew, item, allData, currentIndex, "type"),*/
      }),
    ]);
    return fieldConfig;
  };

  private addSortedTableEntry(
    isNew: boolean,
    item: any,
    allData: any[],
    currentIndex: number,
    field: string,
  ) {
    if (!isNew) {
      if (
        (item[field].key !== null &&
          item[field].key === allData[currentIndex][field].key) ||
        (item[field].value !== null &&
          item[field].value === allData[currentIndex][field].value)
      ) {
        allData.splice(currentIndex, 1, item);
        return;
      } else {
        allData.splice(currentIndex, 1);
      }
    }

    const index = this.findLastWithItem(allData, field, item[field]);
    if (index === undefined) {
      allData.push(item);
    } else {
      allData.splice(index, 0, item);
    }
  }

  private handleNonPersonRelatedChoice(field: FormlyFieldConfig) {
    const accessConstraints = field.form.get("accessConstraints").value;
    const snackMessage = [];
    // Check if item with key "7" exists, remove it if present
    const hasPersonRelatedEntry = accessConstraints.findIndex(
      (item: { key: string }) => item.key === "7",
    );
    if (hasPersonRelatedEntry !== -1) {
      accessConstraints.splice(hasPersonRelatedEntry, 1);
      this.snack.open(
        "Den Zugriffsbeschränkungen wurde der Eintrag 'aufgrund der Vertraulichkeit personenbezogener Daten' entfernt",
      );
      field.form.get("accessConstraints").setValue(accessConstraints);
    }
  }

  private handlePersonRelatedChoice(field: FormlyFieldConfig) {
    const accessConstraints = field.form.get("accessConstraints").value;
    const snackMessage = [];
    // Check if item with key "7" exists, add it if not present
    const hasPersonRelatedEntry = accessConstraints.some(
      (item: { key: string }) => item.key === "7",
    );
    if (!hasPersonRelatedEntry) {
      accessConstraints.push({ key: "7" });
      snackMessage.push(
        "der Eintrag 'aufgrund der Vertraulichkeit personenbezogener Daten' hinzugefügt",
      );
    }

    // Remove item with key "1" if present
    const noConstraints = accessConstraints.findIndex(
      (item: { key: string }) => item.key === "1",
    );
    if (noConstraints !== -1) {
      accessConstraints.splice(noConstraints, 1);
      snackMessage.push(
        "der Eintrag 'Es gelten keine Zugriffsbeschränkungen' entfernt",
      );
    }

    // Set the updated value back to the form
    field.form.get("accessConstraints").setValue(accessConstraints);
    if (snackMessage.length > 0) {
      this.snack.open(
        "Den Zugriffsbeschränkungen wurde " + snackMessage.join(" und "),
        null,
        { duration: 8000 },
      );
    }
  }

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

  private findLastWithItem(
    list: any[],
    fieldKey: string,
    item: { key: string; value: string },
  ): number {
    for (let i = list.length - 1; i >= 0; i--) {
      if (item?.key && item.key === list[i][fieldKey]?.key) return i + 1;
      else if (item?.value && item.value === list[i][fieldKey]?.value)
        return i + 1;
    }
    return undefined;
  }
}
