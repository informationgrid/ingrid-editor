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
import { tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { CookieService } from "../../../app/services/cookie.service";

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
                hasInlineContextHelp: true,
                wrappers: ["form-field", "inline-help"],
              }),
              this.addCheckboxInline(
                "isAtomDownload",
                "Als ATOM-Download Dienst bereitstellen",
                {
                  className: "optional",
                  expressions: {
                    hide: "formState.mainModel?.serviceType?.key !== '3'",
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
            className: "optional flex-1",
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
            <FormlyFieldConfig>{
              key: "coupledResources",
              type: "couplingService",
              className: "optional flex-1",
              props: {
                label: "Dargestellte Daten",
                required: true,
                /*change: (field) => {
                  field.model.couplingType = { key: "tight" };
                  field.options.formState.updateModel();
                },*/
              },
              expressions: {
                "props.required":
                  "formState.mainModel?.couplingType?.key === 'tight'",
              },
              hooks: {
                onInit: (field) =>
                  field.formControl.valueChanges.pipe(
                    tap((value) =>
                      this.handleCoupledDatasetsChange(field, value)
                    )
                  ),
              },
            },
            this.addSelectInline("couplingType", "Kopplungstyp", {
              options: <SelectOptionUi[]>[
                { label: "loose", value: "loose" },
                { label: "mixed", value: "mixed" },
                { label: "tight", value: "tight" },
              ],
              hasInlineContextHelp: true,
              wrappers: ["form-field", "inline-help"],
            }),
          ],
          { contextHelpId: "shownData" }
        ),
        this.addCheckbox("hasAccessConstraints", "Zugang geschützt", {
          className: "optional",
          wrappers: ["panel", "form-field"],
        }),
      ]),

      this.addSpatialSection({ regionKey: true }),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ conformity: true }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
    ];

  private handleCoupledDatasetsChange(field: FormlyFieldConfig, value) {
    if (field.parent.model.couplingType?.key === "mixed") return;

    field.parent.model.couplingType = {
      key: value.length > 0 ? "tight" : "loose",
    };
    // update model to reflect changes
    // TODO: maybe use formOptions.detectChanges(field)?
    field.options.formState.updateModel();
  }

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    uploadService: UploadService,
    dialog: MatDialog,
    cookieService: CookieService
  ) {
    super(codelistService, codelistQuery, uploadService, dialog, cookieService);
  }
}
