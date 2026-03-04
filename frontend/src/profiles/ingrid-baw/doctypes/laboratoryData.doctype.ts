/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { GeoDatasetDoctypeBaw } from "./geo-dataset.doctype";
import {
  MetadataOption,
  MetadataOptionItems,
} from "../../../app/formly/types/metadata-type/metadata-type.component";
import { IngridShared } from "../../ingrid/doctypes/ingrid-shared";

@Injectable({
  providedIn: "root",
})
export class LaboratoryDataDoctypeBaw extends GeoDatasetDoctypeBaw {
  id = "BawLaboratoryData";

  label = "Labordaten";

  iconClass = "labordaten";

  showInspireRelevant = false;
  showInspireConform = false;
  showDataQualitySection = false;

  metadataOptions() {
    return [
      <MetadataOption>{
        value: false,
        label: "Zulassung",
        typeOptions: [
          <MetadataOptionItems>{
            multiple: false,
            items: [
              {
                label: "Zulassungsprüfung",
                key: "isApprovalProcedure",
                value: true,
                //contextHelpKey: "isApprovalProcedure",
              },
            ],
          },
        ],
      },
      ...super.metadataOptions(),
    ];
  }

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    this.common.addSharedGeoDatasetFields(this, fieldConfig);

    // remove keywords (Baugrunddynamik)
    const subsoilKeywordsPos = IngridShared.findFieldElementWithId(
      fieldConfig,
      "subsoilKeywords",
    );
    if (subsoilKeywordsPos) {
      subsoilKeywordsPos.fieldConfig.splice(subsoilKeywordsPos.index, 1);
    }

    // remove sections (Fachbezug, Raumbezug, Zeitbezug)
    const sectionsToRemove = ["Fachbezug", "Raumbezug", "Zeitbezug"];
    sectionsToRemove.forEach((label) => {
      const section = this.findSectionWithLabel(fieldConfig, label);
      if (section) {
        const index = fieldConfig.indexOf(section);
        if (index !== -1) {
          fieldConfig.splice(index, 1);
        }
      }
    });

    // remove Erstellungsmaßstab (resolution)
    const resolutionPos = IngridShared.findFieldElementWithId(
      fieldConfig,
      "resolution",
    );
    if (resolutionPos) {
      resolutionPos.fieldConfig.splice(resolutionPos.index, 1);
    }

    // add spatialRepresentationType to general section (since Fachbezug was removed)
    const generalSection = this.findSectionWithLabel(fieldConfig, "Allgemein");
    if (generalSection) {
      generalSection.fieldGroup.push(
        this.addRepeatList(
          "spatialRepresentationType",
          "Digitale Repräsentation",
          {
            asSelect: true,
            showSearch: true,
            options: this.getCodelistForSelect(
              "526",
              "spatialRepresentationType",
            ),
            codelistId: "526",
            className: "optional",
          },
        ),
      );
    }

    fieldConfig.push(
      this.addSection("Labordaten", [
        this.addRepeatList("dataCollectionReason", "Anlass der Datenerhebung", {
          required: true,
          options: this.getCodelistForSelect(
            "BAW_laboratoryCollectionReason",
            "null",
          ),
        }),
        this.addRepeatList("sampleOrigin", "Probenherkunft", {
          required: true,
          options: this.getCodelistForSelect(
            "BAW_laboratorySampleOrigin",
            "null",
          ),
        }),
        this.addRepeatList("testedMaterial", "Geprüftes Material", {
          required: true,
          options: this.getCodelistForSelect(
            "BAW_laboratoryTestedMaterial",
            "null",
          ),
        }),
        this.addRepeat(
          "testProcedures",
          "Mess- und Prüfverfahren / Gerät / Norm",
          {
            fields: [
              this.addSelectInline("testMethod", "Mess- und Prüfverfahren", {
                required: true,
                className: "flex-3",
                options: this.getCodelistForSelect(
                  "BAW_laboratoryTestMethod",
                  "null",
                ),
              }),
              this.addInputInline("instrument", "Messgerät", {
                className: "flex-2",
              }),
              this.addInputInline("standard", "Norm", {
                className: "flex-2",
              }),
              this.addDatepickerInline(
                "standardIssueDate",
                "Ausgabedatum der Norm",
                {
                  className: "flex-1",
                },
              ),
            ],
          },
        ),

        this.addSubSection(
          "approvalProcedure",
          "Zulassungsprüfung",
          [
            this.addInput("testNumber", "Prüfnummer", {
              wrappers: ["panel", "form-field"],
            }),
            this.addTextArea("systemSetup", "Aufbau des Systems", {
              className: "width-100",
              wrappers: ["panel", "form-field"],
            }),
            this.addSelect(
              "datasetVisibility",
              "Sichtbarkeit des Datensatzes",
              {
                required: true,
                options: this.getCodelistForSelect(
                  "BAW_laboratoryDatasetVisibility",
                  "null",
                ),
              },
            ),
          ],
          {
            hideExpression: (field: FormlyFieldConfig) =>
              !field.options.formState.mainModel?.properties
                ?.isApprovalProcedure,
          },
        ),
      ]),
    );

    return fieldConfig;
  };
}
