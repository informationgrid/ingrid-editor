/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
import { inject, Injectable } from "@angular/core";
import { TagsService } from "../../../app/+catalog/+behaviours/system/tags/tags.service";
import { FormArray, FormControl } from "@angular/forms";
import { IngridShared } from "../../ingrid/doctypes/ingrid-shared";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../app/dialogs/confirm/confirm-dialog.component";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { FormStateService } from "../../../app/+form/form-state.service";
import { MetadataOptionItem } from "../../../app/formly/types/metadata-type/metadata-type.component";
import { FormFieldHelper } from "../../form-field-helper";

@Injectable({ providedIn: "root" })
export class SharedHmdk {
  private tagsService = inject(TagsService);
  private formStateService = inject(FormStateService);

  metadataOptions = (doc: IngridShared) => {
    return <MetadataOptionItem>{
      label: "Veröffentlichung gemäß HmbTG",
      key: "publicationHmbTG",
      value: true,
      onClick: (field) => this.handlePublicationHmbTGClick(doc, field),
    };
  };

  manipulateDocumentFields = (
    doc: IngridShared,
    fieldConfig: FormlyFieldConfig[],
  ) => {
    // at least one "Herausgeber" is required when Dataset is OpenData
    const pointOfContact = IngridShared.findFieldElementWithId(
      fieldConfig,
      "pointOfContact",
    );

    IngridShared.addAfter(
      pointOfContact,
      this.getInformationHmbTGFieldConfig(doc),
    );

    pointOfContact.fieldConfig[pointOfContact.index].validators = {
      ...pointOfContact.fieldConfig[pointOfContact.index].validators,
      atLeastOnePublisher: this.atLeastOnePublisher,
    };

    // at least one "Datendownload" is required when HmbTG is activated
    const references = fieldConfig
      .find((field) => field.props.label === "Verweise")
      .fieldGroup.find((field) => field.key === "references");
    references.validators = {
      ...references.validators,
      downloadLinkWhenHmbtg: this.downloadLinkWhenHmbtg,
    };

    return fieldConfig;
  };

  atLeastOnePublisher = {
    expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
      // equals "Herausgeber"
      !(
        field.model.properties?.isOpenData ||
        field.model.properties?.publicationHmbTG
      ) ||
      (ctrl.value
        ? ctrl.value.some((address: any) => address.type?.key === "10")
        : false),
    message: "Es muss mindestens einen 'Herausgeber' geben.",
  };

  downloadLinkWhenHmbtg = {
    expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
      !field.model.properties?.publicationHmbTG ||
      ctrl.value?.some((row: any) => row.type?.key === "9990"), // Datendownload
    message:
      "Bei aktivierter 'Veröffentlichung gemäß HmbgTG'-Checkbox muss mindestens ein Link vom Typ 'Datendownload' angegeben sein",
  };

  private getInformationHmbTGFieldConfig(doc: IngridShared) {
    return doc.addRepeatList("informationHmbTG", "Informationsgegenstand", {
      asSelect: true,
      expressions: {
        hide: (field: FormlyFieldConfig) =>
          field.model.properties?.publicationHmbTG !== true &&
          field.model.properties?.isOpenData !== true,
        "props.disabled": (field: FormlyFieldConfig) =>
          (field.model.properties?.publicationHmbTG !== true &&
            field.model.properties?.isOpenData === true) ||
          field.options.formState.disabled,
        "props.required": (field: FormlyFieldConfig) =>
          field.model.properties?.publicationHmbTG === true,
      },
      options: doc.getCodelistForSelect(
        "informationsgegenstand",
        "informationHmbTG",
        "value",
      ),
    });
  }

  private handlePublicationHmbTGClick(
    doc: IngridShared,
    field: FormlyFieldConfig,
  ) {
    const checked = field.formControl.value?.publicationHmbTG;
    if (checked) {
      this.handleActivateHmbTG(doc, field);
    } else {
      this.handleDeactivateHmbTG(doc, field);
    }
  }

  private handleActivateHmbTG(doc: IngridShared, field: FormlyFieldConfig) {
    const cookieId = "HIDE_HMBTG_INFO";
    const id = this.formStateService.metadata().wrapperId;

    function executeAction(that: SharedHmdk) {
      // if inspire set access constraint "keine" else empty
      field.form
        .get("resource.accessConstraints")
        ?.setValue(
          field.model.properties?.isInspireIdentified ? [{ key: "1" }] : [],
        );

      // set Anwendungseinschränkungen to "Datenlizenz Deutschland Namensnennung"
      if (field.model.resource) {
        field.model.resource.useConstraints = [
          {
            title: { key: "1" },
            source: "Freie und Hansestadt Hamburg, zuständige Behörde",
          },
        ];
      }
      // we need to set the model here and update it, since new form controls need to be created
      // by ngx-formly, because we update a repeat-component!
      field.options.formState.updateModel();

      that.tagsService.addTags(id, ["internet"], false).subscribe();
    }

    if (doc.cookieService.getCookie(cookieId) === "true") {
      executeAction(this);
      return;
    }

    const HMBTG_INFO_TEXT_ACTIVATE =
      "Mit Aktivierung der Checkbox 'Veröffentlichung gemäß HmbTG' wird diese Metadatenbeschreibung und die dazugehörigen Ressourcen automatisch im Hamburger Transparenzportal veröffentlicht und dort 10 Jahre lang aufbewahrt. Soll die Metadatenbeschreibung dennoch nach HmbTG veröffentlicht werden?";
    const selectOpenData =
      "Wird diese Auswahl gewählt, so werden alle Zugriffsbeschränkungen entfernt. Möchten Sie fortfahren?";
    doc.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: HMBTG_INFO_TEXT_ACTIVATE,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .subscribe((decision) => {
        if (decision === "ok") {
          doc.dialog
            .open(ConfirmDialogComponent, {
              data: <ConfirmDialogData>{
                title: "Hinweis",
                message: selectOpenData,
                cookieId: cookieId,
              },
            })
            .afterClosed()
            .subscribe((decision) => {
              if (decision === "ok") {
                executeAction(this);
              } else {
                field.formControl.setValue(false);
              }
            });
        } else {
          field.formControl.setValue(false);
        }
      });
  }

  private handleDeactivateHmbTG(doc: IngridShared, field: FormlyFieldConfig) {
    function executeAction() {
      // remove all categories
      field.form.get("openDataCategories")?.setValue([]);
      // remove all "Informationsgegenstände" (set to "ohne Veröffentlichungspflicht" if open data)
      field.form.get("informationHmbTG")?.setValue(
        field.model.properties?.isOpenData
          ? [
              {
                key: "hmbtg_20_ohne_veroeffentlichungspflicht",
              },
            ]
          : [],
      );
    }

    // show warning if data is already published
    const metadata = this.formStateService.metadata();
    if (metadata.state === "PW" || metadata.state === "P") {
      const HMBTG_INFO_TEXT_MODIFY =
        "Dieser Datensatz ist bereits nach dem HmbTG im Transparenzportal veröffentlicht und bleibt auch nach Entfernen des Häkchens bei der Checkbox 'Veröffentlichung gemäß HmbTG' bis zum Ablauf der 10 Jahre im Transparenzportal veröffentlicht.";
      doc.dialog
        .open(ConfirmDialogComponent, {
          data: <ConfirmDialogData>{
            title: "Hinweis",
            message: HMBTG_INFO_TEXT_MODIFY,
          },
        })
        .afterClosed()
        .subscribe((decision) => {
          if (decision === "ok") {
            executeAction();
          } else {
            field.formControl.setValue(true);
          }
        });
    } else {
      executeAction();
    }
  }

  hmdkHandleActivateOpenData(
    field: FormlyFieldConfig,
    previous: Observable<boolean>,
  ) {
    return this.wrap(() => {
      field.formControl.setValue({
        ...field.formControl.value,
        publicationHmbTG: true,
      });
      if (field.model.resource !== undefined) {
        field.model.resource.useConstraints = [
          {
            title: { key: "1" },
            source: "Freie und Hansestadt Hamburg, zuständige Behörde",
          },
        ];
        // we need to set the model here and update it, since new form controls need to be created
        // by ngx-formly, because we update a repeat-component!
        // delay execution so that setValue-calls to form are executed
        setTimeout(() => field.options.formState.updateModel());
      }

      // if inspire set access constraint "keine"
      if (field.model.properties?.isInspireIdentified)
        field.form.get("resource.accessConstraints")?.setValue([{ key: "1" }]);

      this.tagsService
        .addTags(
          this.formStateService.metadata().wrapperId,
          ["internet"],
          false,
        )
        .subscribe();
    }, previous);
  }

  hmdkHandleDeactivateOpenData(field: FormlyFieldConfig) {
    // remove "keine" from access constraints
    const accessConstraintsCtrl = field.form.get("resource.accessConstraints");
    accessConstraintsCtrl?.setValue(
      accessConstraintsCtrl.value.filter((entry: any) => entry.key !== "1"),
    );

    // remove license set when open data was clicked
    const useConstraintsCtrl = field.form.get(
      "resource.useConstraints",
    ) as FormArray;
    useConstraintsCtrl?.clear();

    // remove all categories
    field.form.get("openDataCategories")?.setValue([]);
    field.formControl.setValue({ ...field.formControl.value, isHvd: false });
    return of(true);
  }

  hmdkHandleActivateInspireIdentified(field: FormlyFieldConfig) {
    // if openData or publicationHmbTG is set access constraint "Es gelten keine Zugriffsbeschränkungen"
    if (
      field.model.resource &&
      (field.model.properties?.isOpenData ||
        field.model.properties?.publicationHmbTG)
    )
      field.form.get("resource.accessConstraints")?.setValue([{ key: "1" }]);
  }

  wrap(executeFunction: () => void, previous: Observable<boolean>) {
    return previous.pipe(
      map((execute) => {
        if (execute) {
          executeFunction();
        }
        return execute;
      }),
    );
  }
}
