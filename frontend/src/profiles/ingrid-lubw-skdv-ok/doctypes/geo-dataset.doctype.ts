import { inject, Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ObjectAttributesDialogComponent } from "../dialogs/object-attributes-dialog/object-attributes-dialog.component";
import { GeometriesDialogComponent } from "../dialogs/geometries-dialog/geometries-dialog.component";
import { BatchEditObjectAttributesComponent } from "../dialogs/batch-edit-object-attributes/batch-edit-object-attributes.component";
import { FormControl } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeLubwSkdvOk extends GeoDatasetDoctype {
  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
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
    this.addAfter(
      positionAccessConstraints,
      this.addInput(
        "protectDataAccessControl",
        "Sperrung und Löschung in Hinblick auf den Schutz personenbezogener Daten",
        {
          wrappers: ["panel", "form-field"],
        },
      ),
    );

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
            },
          },
        ],
      }),
      this.addTable("geometries", "Geometrie", {
        supportUpload: false,
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
              formatter: (item: any) => this.formatCodelistValue("30005", item),
            },
          },
          {
            key: "scale",
            label: "Maßstab",
          },
          {
            key: "category",
            label: "Kategorie",
            props: {
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
          {
            key: "decisions",
            label: "Objektartscharfe Entscheidungen",
          },
          {
            key: "responsible",
            label: "Verantwortung der Änderung",
          },
        ],
      }),
    ]);
    return fieldConfig;
  };
}
