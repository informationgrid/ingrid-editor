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
import { SelectOptionUi } from "../../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { inject, Injectable } from "@angular/core";
import { IngridShared } from "./ingrid-shared";
import { distinctUntilKeyChanged, filter, tap } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../app/dialogs/confirm/confirm-dialog.component";
import { TreeQuery } from "../../../app/store/tree/tree.query";

@Injectable({
  providedIn: "root",
})
export class GeoServiceDoctype extends IngridShared {
  id = "InGridGeoService";

  label = "Geodatendienst";

  iconClass = "Geodatendienst";

  hasOptionalFields = true;

  showAdVCompatible = true;
  showAdVProductGroup = true;
  showLayernamesForCoupledResources = false;
  showUpdateGetCapabilities = true;

  geoServiceOptions = {
    required: {
      operations: true,
      classification: true,
    },
  };

  isGeoService = true;

  tree = inject(TreeQuery);

  constructor() {
    super();
    this.options.required.spatialSystems = true;
    this.options.required.useConstraints = true;
  }

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

  documentFields = () => {
    const fields = <FormlyFieldConfig[]>[
      this.showUpdateGetCapabilities
        ? {
            type: "updateGetCapabilities",
            wrappers: ["panel"],
            props: {
              externalLabel: "GetCapabilities",
            },
          }
        : null,
      this.addGeneralSection({
        inspireRelevant: true,
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
            required: this.geoServiceOptions.required.classification,
            options: this.getCodelistForSelect("5200", "classification"),
            codelistId: "5200",
          }),
          this.addGroup(null, null, [
            this.addGroupSimple(
              null,
              [
                this.addSelectInline("type", "Art des Dienstes", {
                  required: true,
                  showSearch: true,
                  options: this.getCodelistForSelect("5100", "type"),
                  codelistId: "5100",
                  hasInlineContextHelp: true,
                  contextHelpId: "serviceType",
                  wrappers: ["inline-help", "form-field"],
                  hooks: {
                    onInit: (field: FormlyFieldConfig) =>
                      this.handleServiceTypeChange(field),
                  },
                }),
                this.addRepeatListInline("version", "Version des Dienstes", {
                  options: this.getServiceVersionOptions,
                  // codelistId: "5152",
                  showSearch: true,
                  fieldGroupClassName: "flex-1",
                  hasInlineContextHelp: true,
                  contextHelpId: "serviceVersion",
                  wrappers: ["inline-help"],
                  className: "optional flex-1",
                }),
                this.addCheckboxInline(
                  "isAtomDownload",
                  "Als ATOM-Download Dienst bereitstellen",
                  {
                    className: "optional",
                    click: (field: FormlyFieldConfig) =>
                      this.showAtomFeedInfo(field),
                    expressions: {
                      hide: "formState.mainModel?.service?.type?.key !== '3'",
                    },
                  },
                ),
              ],
              { className: "flex-1" },
            ),
          ]),
          this.addRepeat("operations", "Operationen", {
            required: this.geoServiceOptions.required.operations,
            fields: [
              this.addAutoCompleteInline("name", "Name", {
                required: true,
                options: this.getServiceOperationNameOptions,
              }),
              this.addInputInline("description", "Beschreibung"),
              this.addInputInline("methodCall", "Zugriffs-URL", {
                required: true,
                validators: {
                  validation: ["url"],
                },
              }),
            ],
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
                  showLayernames:
                    this.showLayernamesForCoupledResources === true,
                  change: (field) => {
                    // run delayed to use the updated value
                    setTimeout(() =>
                      this.handleCoupledDatasetsChange(field, field.model),
                    );
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
                expressions: {
                  hide: "!formState.mainModel?.service?.coupledResources?.length",
                },
              }),
            ],
            {
              contextHelpId: "shownData",
              expressions: {
                "props.required":
                  "formState.mainModel?.service?.couplingType?.key === 'tight'",
                className: "field.props.required ? '' : 'optional'",
              },
            },
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
                },
              ),
              this.addTextAreaInline(
                "implementationHistory",
                "Historie",
                this.id,
                {
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                },
              ),
            ],
            { className: "optional" },
          ),
          this.addTextArea("explanation", "Erläuterungen", this.id, {
            className: "optional flex-1",
          }),
          this.addCheckbox("hasAccessConstraints", "Zugang geschützt", {
            className: "optional",
          }),
        ]),
      ]),

      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ conformity: true }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
    ].filter(Boolean);

    return this.manipulateDocumentFields(fields);
  };

  private handleCoupledDatasetsChange(field: FormlyFieldConfig, value: any[]) {
    const couplingTypeCtrl = field.form.root.get("service.couplingType");
    if (couplingTypeCtrl === null || couplingTypeCtrl.value?.key === "mixed")
      return;

    couplingTypeCtrl.setValue({
      key: value.length > 0 ? "tight" : "loose",
    });
  }

  private handleServiceTypeChange(field: FormlyFieldConfig) {
    return field.formControl.valueChanges.pipe(
      filter((value) => value != null),
      distinctUntilKeyChanged("key"),
      tap((value) => this.updateServiceVersionField(value)),
      tap((value) => this.updateOperationNameField(value)),
    );
  }

  private updateServiceVersionField(value) {
    const codelistId = this.mapServiceTypeToVersionCodelist[value.key];
    if (codelistId === undefined) {
      this.getServiceVersionOptions.next([]);
    } else {
      this.getCodelistForSelect(codelistId, "version").subscribe((value) => {
        this.getServiceVersionOptions.next(value);
        this.updateServiceVersionInPrintField(value);
      });
    }
    // TODO: remove all codelist values from version field?
  }

  private updateOperationNameField(value) {
    const codelistId =
      this.mapServiceTypeToOperationNameCodelist[value.key] ?? "5110";
    this.getCodelistForSelect(codelistId, "version").subscribe((value) => {
      this.getServiceOperationNameOptions.next(value);
      this.updateOperationNameInPrintField(value);
    });
  }

  private updateOperationNameInPrintField(value: SelectOptionUi[]) {
    const operationsField = this.cleanFields
      .find((item) => item?.fieldGroup?.[0]?.key === "service")
      ?.fieldGroup[0].fieldGroup?.find(
        (item) => item.key === "operations",
        // @ts-ignore
      ).fieldArray?.fieldGroup[0]?.props;
    operationsField.options = value;
  }

  private updateServiceVersionInPrintField(value: SelectOptionUi[]) {
    const versionProps = this.cleanFields.find(
      (item) => item?.fieldGroup?.[0]?.key === "service",
    )?.fieldGroup[0].fieldGroup[1].fieldGroup[0].fieldGroup[1].props;

    versionProps.options = value;
  }

  private showAtomFeedInfo(field: FormlyFieldConfig) {
    if (!field.model.isAtomDownload) return;

    const cookieId = "HIDE_ATOM_FEED_INFO";

    if (this.cookieService.getCookie(cookieId) === "true") return;

    const message =
      "Bitte stellen Sie sicher, dass in den extern verkoppelten dargestellten Daten ein Downloadlink vorhanden ist.";
    this.dialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogData>{
        title: "Hinweis",
        message: message,
        cookieId: cookieId,
        hideCancelButton: true,
      },
    });
  }
}
