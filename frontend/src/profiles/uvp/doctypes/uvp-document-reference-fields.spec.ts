/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
import { of } from "rxjs";
import { UVP_NEGATIVE_DECISION_DOCS_FIELD } from "./negative-preliminary-assessment.doctype";
import { UvpShared } from "./uvp-shared";

describe("UVP document table definitions", () => {
  it("keeps processing-step and negative-decision tables explicit", () => {
    const tableFields: string[] = [];
    const emptyField = () => ({});
    const context: any = {
      columnsForDocumentTable: [],
      forPublish: true,
      uvpNumberCodelistId: "9000",
      addTable: (key: string) => {
        tableFields.push(key);
        return { key };
      },
      addSection: (_label: string, fieldGroup: unknown[]) => ({ fieldGroup }),
      addDateRange: emptyField,
      addToggle: emptyField,
      addDatepicker: emptyField,
      addCheckbox: emptyField,
      addScopingPublishConditionCheckbox:
        UvpShared.prototype.addScopingPublishConditionCheckbox,
      addPointOfContact: emptyField,
      addTextArea: emptyField,
      addSpatial: emptyField,
      addRepeatList: emptyField,
      getCodelistForSelect: () => of([]),
      sortUVPNumber: (list: unknown[]) => list,
    };

    UvpShared.prototype.addScopeOfInvestigation.call(context);
    UvpShared.prototype.addPublicDisclosure.call(context);
    UvpShared.prototype.addPublicHearing.call(context);
    UvpShared.prototype.addDecisionOfAdmission.call(context);
    tableFields.push(UVP_NEGATIVE_DECISION_DOCS_FIELD);

    expect(tableFields.sort()).toEqual(
      [
        "announcementDocs",
        "applicationDocs",
        "reportsRecommendationDocs",
        "furtherDocs",
        "considerationDocs",
        "scopingDateDocs",
        "scopingGeneralDocs",
        "approvalDocs",
        "decisionDocs",
        "uvpNegativeDecisionDocs",
      ].sort(),
    );
    expect(UVP_NEGATIVE_DECISION_DOCS_FIELD).toBe("uvpNegativeDecisionDocs");
  });
});
