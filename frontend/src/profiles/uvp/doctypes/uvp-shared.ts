import { FormGroup } from "@angular/forms";
import { ConfigService } from "../../../app/services/config/config.service";
import { UploadService } from "../../../app/shared/upload/upload.service";
import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";
import { map } from "rxjs/operators";

export class UvpShared extends BaseDoctype {
  protected uvpNumberCodelistId: number;

  constructor(
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    private configService: ConfigService,
    private uploadService: UploadService,
    private behaviourService?: BehaviourService
  ) {
    super(codelistService, codelistQuery);
  }

  isInitialized(): Promise<void> {
    return this.behaviourService ? this.setUvpCodelistId() : Promise.resolve();
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
      templateOptions: {
        label: "Titel",
        appearance: "outline",
      },
    },
    {
      key: "downloadURL",
      type: "upload",
      label: "Link",
      templateOptions: {
        label: "Link",
        appearance: "outline",
        required: true,
        onClick: (docUuid, uri, $event) => {
          this.uploadService.downloadFile(docUuid, uri, $event);
        },
        formatter: (link: any, form: FormGroup) => {
          if (link.asLink) {
            return `<a href="${link.value}" target="_blank" class="no-text-transform">${link.value}</a>`;
          } else {
            return `<span class="clickable-text">${link.uri}</span>`;
          }
        },
      },
    },
    {
      key: "validUntil",
      type: "datepicker",
      label: "Gültig bis",
      width: "100px",
      templateOptions: {
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
      hideExpression: 'model.type !== "publicDisclosure"',
      templateOptions: {
        label: "Öffentliche Auslegung",
      },
      fieldGroup: [
        this.addSection("Öffentliche Auslegung", [
          { key: "type" },
          this.addDateRange("disclosureDate", "Zeitraum der Auslegung", {
            required: true,
            wrappers: ["panel", "form-field"],
          }),
          this.addTable("announcementDocs", "Auslegungsinformationen", {
            required: true,
            columns: this.columnsForDocumentTable,
          }),
          this.addPublishConditionCheckbox("announcementDocs"),
          this.addTable("applicationDocs", "UVP Bericht/Antragsunterlagen", {
            required: true,
            columns: this.columnsForDocumentTable,
          }),
          this.addPublishConditionCheckbox("applicationDocs"),
          this.addTable(
            "reportsRecommendationDocs",
            "Berichte und Empfehlungen",
            {
              required: false,
              columns: this.columnsForDocumentTable,
            }
          ),
          this.addPublishConditionCheckbox("reportsRecommendationDocs"),
          this.addTable("furtherDocs", "Weitere Unterlagen", {
            required: false,
            columns: this.columnsForDocumentTable,
          }),
          this.addPublishConditionCheckbox("furtherDocs"),
        ]),
      ],
    };
  }

  addPublishConditionCheckbox(id: string) {
    return this.addCheckbox(id + "PublishDuringDisclosure", null, {
      fieldLabel: "Erst mit Beginn des Auslegungszeitraumes veröffentlichen",
      hideExpression: (model) => !model[id] || model[id].length === 0,
    });
  }

  addPublicHearing() {
    return {
      name: "publicHearing",
      hideExpression: 'model.type !== "publicHearing"',
      templateOptions: {
        label: "Erörterungstermin",
      },
      fieldGroup: [
        this.addSection("Erörterungstermin", [
          { key: "type" },
          this.addDateRange("publicHearingDate", "Zeitraum der Erörterung", {
            required: true,
            wrappers: ["panel", "form-field"],
          }),
          this.addTable(
            "considerationDocs",
            "Informationen zum Erörterungstermin",
            {
              required: true,
              columns: this.columnsForDocumentTable,
            }
          ),
        ]),
      ],
    };
  }

  addDecisionOfAdmission() {
    return {
      name: "decisionOfAdmission",
      hideExpression: 'model.type !== "decisionOfAdmission"',
      templateOptions: {
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
          }),
          this.addTable("decisionDocs", "Entscheidung", {
            required: true,
            columns: this.columnsForDocumentTable,
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
        },
      }
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
    return this.behaviourService
      .getBehaviour("plugin.uvp.uvp-number")
      .pipe(map((behaviour) => behaviour?.data?.uvpCodelist ?? 9000))
      .toPromise()
      .then((id) => (this.uvpNumberCodelistId = id));
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
