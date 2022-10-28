import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";

@Injectable({
  providedIn: "root",
})
export class GeoServiceDoctype extends IngridShared {
  id = "InGridGeoService";

  label = "Geodatendienst";

  iconClass = "Geodatendienst";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection({ inspireRelevant: true, openData: true }),
      this.addKeywordsSection({ priorityDataset: true, spatialScope: true }),

      this.addSection("Fachbezug", [
        this.addRepeatList("serviceCategories", "Klassifikation des Dienstes", {
          asSelect: true,
          options: this.getCodelistForSelect(5200, "serviceCategories"),
          codelistId: 5200,
        }),
        this.addGroup(null, null, [
          this.addSelectInline("serviceType", "Art des Dienstes", {
            options: this.getCodelistForSelect(5100, "serviceType"),
            codelistId: 5100,
          }),
          this.addRepeatListInline("serviceVersion", "Version des Dienstes", {
            options: this.getCodelistForSelect(5152, "serviceVersion"),
            codelistId: 5152,
          }),
        ]),
        this.addTable("operations", "Operationen", {
          supportUpload: false,
          columns: [],
        }),
        this.addTable("scale", "Erstellungsmaßstab", {
          supportUpload: false,
          columns: [],
        }),
        this.addGroup(null, null, [
          this.addTextAreaInline(
            "systemEnvironment",
            "Systemumgebung",
            this.id
          ),
          this.addTextAreaInline("history", "Historie", this.id),
        ]),
        this.addTextArea("explanation", "Erläuterungen", this.id),
        this.addGroup(null, "Dargestellte Daten", [
          this.addRepeatListInline("coupledResources", "Dargestellte Daten"),
          this.addSelectInline("couplingType", "Kopplungstyp", {
            options: <SelectOptionUi[]>[
              { label: "loose", value: "loose" },
              { label: "mixed", value: "mixed" },
              { label: "tight", value: "tight" },
            ],
          }),
        ]),
        this.addCheckbox("hasAccessConstraints", "Zugang geschützt"),
      ]),

      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ conformity: true }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }
}
