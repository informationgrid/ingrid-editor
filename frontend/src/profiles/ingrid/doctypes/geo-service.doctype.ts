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
import { distinctUntilKeyChanged, filter, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { CookieService } from "../../../app/services/cookie.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GeoServiceDoctype extends IngridShared {
  id = "InGridGeoService";

  label = "Geodatendienst";

  iconClass = "Geodatendienst";

  hasOptionalFields = true;

  private mapServiceTypeToVersionCodelist = {
    "1": 5151,
    "2": 5152,
    "3": 5153,
    "4": 5154,
  };

  private mapServiceTypeToOperationNameCodelist = {
    "1": 5105,
    "2": 5110,
    "3": 5120,
    "4": 5130,
  };

  getServiceVersionOptions = new BehaviorSubject<SelectOptionUi[]>([]);
  getServiceOperationNameOptions = new BehaviorSubject<SelectOptionUi[]>([]);

  documentFields = () =>
    <FormlyFieldConfig[]>[
      {
        type: "updateGetCapabilities",
        wrappers: ["panel"],
        props: {
          externalLabel: "GetCapabilities-Aktualisierung",
        },
      },
      this.addGeneralSection({
        inspireRelevant: true,
        advCompatible: true,
        openData: true,
      }),
      this.addKeywordsSection({
        priorityDataset: true,
        spatialScope: true,
        inspireTopics: true,
      }),

      this.addSection("Fachbezug", [
        this.addGroupSimple("service", [
          this.addRepeatList("classification", "Klassifikation des Dienstes", {
            asSelect: true,
            showSearch: true,
            required: true,
            options: this.getCodelistForSelect(5200, "classification"),
            codelistId: 5200,
          }),
          this.addGroup(null, null, [
            this.addGroupSimple(
              null,
              [
                this.addSelectInline("type", "Art des Dienstes", {
                  required: true,
                  showSearch: true,
                  options: this.getCodelistForSelect(5100, "type"),
                  codelistId: 5100,
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                  hooks: {
                    onInit: (field) => this.handleServiceTypeChange(field),
                  },
                }),
                this.addCheckboxInline(
                  "isAtomDownload",
                  "Als ATOM-Download Dienst bereitstellen",
                  {
                    className: "optional",
                    expressions: {
                      hide: "formState.mainModel?.service?.serviceType?.key !== '3'",
                    },
                  }
                ),
              ],
              { className: "flex-1" }
            ),

            this.addRepeatListInline("version", "Version des Dienstes", {
              options: this.getServiceVersionOptions,
              // codelistId: 5152,
              showSearch: true,
              fieldGroupClassName: "flex-1",
              hasInlineContextHelp: true,
              wrappers: ["inline-help"],
              className: "optional flex-1",
            }),
          ]),
          this.addRepeat("operations", "Operationen", {
            fields: [
              this.addAutoCompleteInline("name", "Name", {
                required: true,
                options: this.getServiceOperationNameOptions,
              }),
              this.addInputInline("description", "Beschreibung"),
              this.addInputInline("methodCall", "Zugriffs-URL", {
                required: true,
              }),
            ],
            validators: {
              getCapabilityForWMS: {
                expression: (ctrl, field) => {
                  const model = field.options.formState.mainModel;
                  return (
                    !model ||
                    model._type !== "InGridGeoService" ||
                    model.service.type?.key !== "2" ||
                    field.model.some((item) => item?.name?.key === "1")
                  );
                },
                message:
                  "Für Darstellungsdienste muss eine GetCapabilities-Operation angegeben sein",
              },
            },
          }),
          this.addGroup(
            null,
            "Dargestellte Daten",
            [
              <FormlyFieldConfig>{
                key: "coupledResources",
                type: "couplingService",
                className: "flex-1",
                props: {
                  label: "Dargestellte Daten",
                  change: (field) => {
                    this.handleCoupledDatasetsChange(field, field.model);
                  },
                },
                expressions: {
                  "props.required":
                    "formState.mainModel?.service?.couplingType?.key === 'tight'",
                  className: "field.props.required ? '' : 'optional'",
                },
              },
              this.addSelectInline("couplingType", "Kopplungstyp", {
                showSearch: true,
                defaultValue: { key: "loose" },
                options: <SelectOptionUi[]>[
                  { label: "loose", value: "loose" },
                  { label: "mixed", value: "mixed" },
                  { label: "tight", value: "tight" },
                ],
                hasInlineContextHelp: true,
                wrappers: ["inline-help", "form-field"],
              }),
            ],
            {
              contextHelpId: "shownData",
              expressions: {
                "props.required":
                  "formState.mainModel?.service?.couplingType?.key === 'tight'",
                className: "field.props.required ? '' : 'optional'",
              },
            }
          ),
          this.addResolutionFields(),
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
                  wrappers: ["inline-help", "form-field"],
                }
              ),
              this.addTextAreaInline(
                "implementationHistory",
                "Historie",
                this.id,
                {
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }
              ),
            ],
            { className: "optional" }
          ),
          this.addTextArea("explanation", "Erläuterungen", this.id, {
            className: "optional flex-1",
          }),
          this.addCheckbox("hasAccessConstraints", "Zugang geschützt", {
            className: "optional",
          }),
        ]),
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
    cookieService: CookieService,
    snack: MatSnackBar
  ) {
    super(
      codelistService,
      codelistQuery,
      uploadService,
      dialog,
      cookieService,
      snack
    );
  }

  private handleServiceTypeChange(field) {
    return field.formControl.valueChanges.pipe(
      filter((value) => value != null),
      distinctUntilKeyChanged("key"),
      tap((value) => this.updateServiceVersionField(value)),
      tap((value) => this.updateOperationNameField(value))
    );
  }

  private updateServiceVersionField(value) {
    const codelistId = this.mapServiceTypeToVersionCodelist[value.key];
    if (codelistId === undefined) {
      this.getServiceVersionOptions.next([]);
    } else {
      this.getCodelistForSelect(codelistId, "version").subscribe((value) =>
        this.getServiceVersionOptions.next(value)
      );
    }
    // TODO: remove all codelist values from version field?
  }

  private updateOperationNameField(value) {
    const codelistId =
      this.mapServiceTypeToOperationNameCodelist[value.key] ?? "5110";
    this.getCodelistForSelect(codelistId, "version").subscribe((value) =>
      this.getServiceOperationNameOptions.next(value)
    );
  }
}
