/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { UploadService } from "../../../app/shared/upload/upload.service";
import { SelectOptionUi } from "../../../app/services/codelist/codelist.service";
import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";
import { inject } from "@angular/core";
import { REGEX_URL } from "../../../app/formly/input.validators";

export class UvpShared extends BaseDoctype {
  protected uvpNumberCodelistId: number;

  private uploadService = inject(UploadService);
  private behaviourService = inject(BehaviourService);

  isInitialized(): Promise<void> {
    this.setUvpCodelistId();
    return Promise.resolve();
  }

  dateTooBigValidator = {
    dateToBig: {
      expression: (field) => {
        if (field.value === null) return true;
        const value = field.value?.toISOString
          ? field.value.toISOString()
          : field.value;
        return value <= new Date().toISOString();
      },
      message: () => "Das Datum darf nicht in der Zukunft liegen",
    },
  };

  protected columnsForDocumentTable = [
    {
      key: "title",
      type: "input",
      label: "Titel",
      width: "300px",
      props: {
        label: "Titel",
        appearance: "outline",
        required: true,
      },
    },
    {
      key: "downloadURL",
      type: "upload",
      label: "Link",
      wrappers: ["form-field", "inline-help"],
      props: {
        label: "Link",
        appearance: "outline",
        required: true,
        onClick: (docUuid, uri, $event) => {
          this.uploadService.downloadFile(docUuid, uri, $event);
        },
        formatter: (link: any) => {
          if (link.asLink) {
            return `<a  href="${link.uri}" target="_blank" class="no-text-transform icon-in-table">
                         <img  width="20"  height="20" src="assets/icons/external_link.svg"  alt="link"> ${link.uri}  </a> `;
          } else {
            return `<span class="clickable-text icon-in-table">  <img  width="20"  height="20" src="assets/icons/download.svg"  alt="link"> ${link.uri}</span>`;
          }
        },
      },
      validators: {
        url: {
          expression: (field) => {
            const regExp = new RegExp(REGEX_URL);
            return field.value?.asLink
              ? regExp.test(field.value?.uri?.trim())
              : true;
          },
          message: () =>
            this.transloco.translate("form.validationMessages.url"),
        },
      },
      expressions: {
        "props.label": (field) =>
          field.formControl.value?.asLink ? "URL (Link)" : "Dateiname (Upload)",
      },
    },
    {
      key: "validUntil",
      type: "datepicker",
      label: "Gültig bis",
      width: "100px",
      props: {
        label: "Gültig bis",
        appearance: "outline",
        formatter: (item: any) => {
          return item ? new Date(item).toLocaleDateString() : "";
        },
      },
    },
  ];

  addPublicDisclosure() {
    return {
      name: "publicDisclosure",
      expressions: { hide: 'model?.type !== "publicDisclosure"' },
      props: {
        label: "Öffentliche Auslegung",
      },
      fieldGroup: [
        this.addSection("Öffentliche Auslegung", [
          { key: "type" },
          this.addDateRange("disclosureDate", "Zeitraum der Auslegung", {
            required: true,
            wrappers: ["panel"],
          }),
          this.addTable("announcementDocs", "Auslegungsinformationen", {
            required: true,
            columns: this.columnsForDocumentTable,
            batchValidUntil: "validUntil",
          }),
          this.addPublishConditionCheckbox("announcementDocs"),
          this.addTable("applicationDocs", "UVP Bericht/Antragsunterlagen", {
            required: true,
            columns: this.columnsForDocumentTable,
            batchValidUntil: "validUntil",
          }),
          this.addPublishConditionCheckbox("applicationDocs"),
          this.addTable(
            "reportsRecommendationDocs",
            "Berichte und Empfehlungen",
            {
              required: false,
              columns: this.columnsForDocumentTable,
              batchValidUntil: "validUntil",
            },
          ),
          this.addPublishConditionCheckbox("reportsRecommendationDocs"),
          this.addTable("furtherDocs", "Weitere Unterlagen", {
            required: false,
            columns: this.columnsForDocumentTable,
            batchValidUntil: "validUntil",
          }),
          this.addPublishConditionCheckbox("furtherDocs"),
        ]),
      ],
    };
  }

  addPublishConditionCheckbox(id: string) {
    return this.addCheckbox(id + "PublishDuringDisclosure", null, {
      fieldLabel: "Erst mit Beginn des Auslegungszeitraumes veröffentlichen",
      className: "space-bottom-field negative-space-top-field",
      expressions: {
        hide: `!model || !model["${id}"] || model["${id}"].length === 0`,
      },
    });
  }

  addPublicHearing() {
    return {
      name: "publicHearing",
      expressions: { hide: 'model?.type !== "publicHearing"' },
      props: {
        label: "Erörterungstermin",
      },
      fieldGroup: [
        this.addSection("Erörterungstermin", [
          { key: "type" },
          this.addDateRange("publicHearingDate", "Zeitraum der Erörterung", {
            required: true,
            wrappers: ["panel"],
          }),
          this.addTable(
            "considerationDocs",
            "Informationen zum Erörterungstermin",
            {
              required: true,
              columns: this.columnsForDocumentTable,
              batchValidUntil: "validUntil",
            },
          ),
        ]),
      ],
    };
  }

  addDecisionOfAdmission() {
    return {
      name: "decisionOfAdmission",
      expressions: { hide: 'model?.type !== "decisionOfAdmission"' },
      props: {
        label: "Entscheidung über die Zulassung",
      },
      fieldGroup: [
        this.addSection("Entscheidung über die Zulassung", [
          { key: "type" },
          this.addDatepicker("decisionDate", "Datum der Entscheidung", {
            required: true,
            datepickerOptions: {
              max: new Date(),
            },
            validators: { ...this.dateTooBigValidator },
          }),
          this.addTable("approvalDocs", "Auslegungsinformationen", {
            required: true,
            columns: this.columnsForDocumentTable,
            batchValidUntil: "validUntil",
          }),
          this.addTable("decisionDocs", "Entscheidung", {
            required: true,
            columns: this.columnsForDocumentTable,
            batchValidUntil: "validUntil",
          }),
        ]),
      ],
    };
  }

  documentFields(): FormlyFieldConfig[] {
    return [];
  }

  addPointOfContact() {
    return this.addAddressCard(
      "pointOfContact",
      "Kontaktdaten der verfahrensführenden Behörde",
      {
        required: true,
        allowedTypes: ["7"],
        max: 1,
        validators: {
          needPublisher: {
            expression: (ctrl) =>
              ctrl.value
                ? ctrl.value.some((row) => row.type.key === "7")
                : false,
            message: "Es muss ein Ansprechpartner als Adresse angegeben sein",
          },
          publisherPublished: {
            expression: (ctrl) =>
              ctrl.value
                ? ctrl.value.every((row) => row.ref._state === "P")
                : false,
            message: "Alle Adressen müssen veröffentlicht sein",
          },
          maxPublisher: {
            expression: (ctrl) => ctrl.value?.length === 1,
            message: "Es darf maximal nur ein Kontakt angegeben sein",
          },
        },
      },
    );
  }

  /**
   * Sort the strings the following way:
   *   - compare everything before the first "-" as a string
   *   - split the following text by "." and interpret values as numbers
   *   - if value contains a number and a string then also compare the string
   * Example: UVPB-1.6a.b.cc
   */
  protected sortUVPNumber(list: SelectOptionUi[]) {
    // the amazing sort function
    return list.sort((a, b) => {
      const partA = a.label.split("-");
      const partB = b.label.split("-");

      // check first alphanumeric part
      if (partA[0] === partB[0]) {
        const partANumber = partA[1].split(".");
        const partBNumber = partB[1].split(".");

        // check second numeric part
        for (let i = 0; i < partANumber.length; i++) {
          if (partANumber[i] !== partBNumber[i]) {
            let intANumber = -1;
            let intBNumber = -1;
            // check if we can parse the string to a number (e.g. '6a', '4', but not 'a')
            if (Number.isNaN(Number(partANumber[i]))) {
              intANumber = parseInt(partANumber[i]);
            } else {
              intANumber = +partANumber[i];
            }
            if (Number.isNaN(Number(partBNumber[i]))) {
              intBNumber = parseInt(partBNumber[i]);
            } else {
              intBNumber = +partBNumber[i];
            }

            // if it's still is not a number then compare as string (e.g. 'aa')
            if (isNaN(intANumber) && isNaN(intBNumber)) {
              return partANumber[i] < partBNumber[i] ? -1 : 1;
            } else if (isNaN(intANumber)) {
              return 1;
            } else if (isNaN(intBNumber)) {
              return -1;
            }

            // if a number is same then we expect a string inside at least one number
            // otherwise the condition above would have taken care already
            if (intANumber === intBNumber && intANumber !== -1) {
              const s1 = this.getStringFromNumText(intANumber, partANumber[i]);
              const s2 = this.getStringFromNumText(intBNumber, partBNumber[i]);

              // sort strings
              if (s1 === s2) return 0;
              else {
                return s1 < s2 ? -1 : 1;
              }
            } else {
              return intANumber < intBNumber ? -1 : 1;
            }
          } else if (i === partANumber.length - 1) {
            if (partANumber.length < partBNumber.length) {
              return -1;
            }
          }
        }
      } else {
        return partA[0] < partB[0] ? -1 : 1;
      }
    });
  }

  receiptDateValidator() {
    return {
      expression: (ctrl, other) => {
        const model = other.form.root.value;
        let receiptDate = this.convertToIsoDate(model.receiptDate);
        let lowestDisclosureDate = model.processingSteps
          ?.filter((step) => step.type === "publicDisclosure")
          .map((step) => this.convertToIsoDate(step.disclosureDate?.start))
          .sort((a, b) => (a < b && a !== null ? -1 : 1))[0];

        if (!lowestDisclosureDate) return true;

        return receiptDate < lowestDisclosureDate;
      },
      message: "Das Datum muss vor dem Beginn der ersten Auslegung sein.",
      errorPath: "receiptDate",
    };
  }

  setUvpCodelistId() {
    this.uvpNumberCodelistId =
      this.behaviourService.getBehaviour("plugin.uvp.eia-number")?.data
        ?.uvpCodelist ?? 9000;
  }

  private convertToIsoDate(date: Date | string) {
    if (typeof date !== "string") {
      return date?.toISOString();
    }
    return date;
  }

  // get the string from a text without the number part (e.g. (6,'6a') => 'a')
  private getStringFromNumText(number, text) {
    let str = text;
    if (number && number !== -1) {
      const len = (number + "").length;
      if (len !== text.length) {
        str = text.substr(len);
      }
    }
    return str;
  }
}
