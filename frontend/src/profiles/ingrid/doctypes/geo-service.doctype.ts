import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";
import { UploadService } from "../../../app/shared/upload/upload.service";

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
          required: true,
          options: this.getCodelistForSelect(5200, "serviceCategories"),
          codelistId: 5200,
        }),
        this.addGroup(null, null, [
          this.addGroupSimple(
            null,
            [
              this.addSelectInline("serviceType", "Art des Dienstes", {
                required: true,
                options: this.getCodelistForSelect(5100, "serviceType"),
                codelistId: 5100,
              }),
              this.addCheckboxInline(
                "isAtomDownload",
                "Als ATOM-Download Dienst bereitstellen",
                {
                  className: "optional",
                  expressions: {
                    hide: "formState.mainModel.serviceType?.key !== '3'",
                  },
                }
              ),
            ],
            { className: "flex-1" }
          ),

          this.addRepeatListInline("serviceVersion", "Version des Dienstes", {
            options: this.getCodelistForSelect(5152, "serviceVersion"),
            codelistId: 5152,
            fieldGroupClassName: "flex-1",
            hasInlineContextHelp: true,
            wrappers: ["inline-help"],
            className: "optional",
          }),
        ]),
        this.addTable("operations", "Operationen", {
          supportUpload: false,
          columns: [],
        }),
        this.addTable("scale", "Erstellungsmaßstab", {
          supportUpload: false,
          columns: [],
          className: "optional",
        }),
        this.addGroup(
          null,
          null,
          [
            this.addTextAreaInline(
              "systemEnvironment",
              "Systemumgebung",
              this.id,
              {
                hasInlineContextHelp: true,
                wrappers: ["form-field", "inline-help"],
              }
            ),
            this.addTextAreaInline("history", "Historie", this.id, {
              hasInlineContextHelp: true,
              wrappers: ["form-field", "inline-help"],
            }),
          ],
          { className: "optional" }
        ),
        this.addTextArea("explanation", "Erläuterungen", this.id, {
          className: "optional flex-1",
        }),
        this.addGroup(
          null,
          "Dargestellte Daten",
          [
            {
              key: "coupledResources",
              type: "couplingService",
              className: "optional flex-1",
              props: {
                label: "Dargestellte Daten",
                required: true,
              },
              expressions: {
                "props.required":
                  "formState.mainModel.couplingType?.key === 'tight'",
              },
            },
            this.addSelectInline("couplingType", "Kopplungstyp", {
              options: <SelectOptionUi[]>[
                { label: "loose", value: "loose" },
                { label: "mixed", value: "mixed" },
                { label: "tight", value: "tight" },
              ],
            }),
          ],
          { contextHelpId: "shownData" }
        ),
        this.addCheckbox("hasAccessConstraints", "Zugang geschützt", {
          className: "optional",
        }),
      ]),

      this.addSpatialSection({ regionKey: true }),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ conformity: true }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    uploadService: UploadService
  ) {
    super(codelistService, codelistQuery, uploadService);
  }
}
