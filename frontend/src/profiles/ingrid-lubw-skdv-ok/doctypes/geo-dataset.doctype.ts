import { Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";

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
      this.addInput(
        "protectDataAccessControl",
        "Sperrung und Löschung in Hinblick auf den Schutz personenbezogener Daten",
        {
          wrappers: ["panel", "form-field"],
        },
      ),
    ]);

    const positionFachbezug = this.findFieldElementWithId(
      fieldConfig,
      "featureTypes",
    );
    this.addAfter(
      positionFachbezug,
      this.addSelect("environmentDescription", "Produktionsumgebung", {
        codelistId: "30001",
        options: this.getCodelistForSelect("30001", "environmentDescription"),
      }),
    );
    return fieldConfig;
  };
}
