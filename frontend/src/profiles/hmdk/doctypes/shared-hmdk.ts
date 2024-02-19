/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { FormControl } from "@angular/forms";
import { IngridShared } from "../../ingrid/doctypes/ingrid-shared";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../app/dialogs/confirm/confirm-dialog.component";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class SharedHmdk {
  private tagsService = inject(TagsService);

  constructor(private doc: IngridShared) {}

  manipulateDocumentFields = (
    fieldConfig: FormlyFieldConfig[],
    typeGroupPostion = 0,
  ) => {
    // add "Veröffentlichung gemäß HmbTG" in to "Typ" Checkboxes
    const topGroup = fieldConfig[typeGroupPostion].fieldGroup;
    const typeGroup = topGroup[0].fieldGroup;
    typeGroup.push(this.getPublicationHmbTGFieldConfig());

    // add "Informationsgegenstand" right after typeGroup
    topGroup.splice(1, 0, this.getInformationHmbTGFieldConfig());

    // at least one "Herausgeber" is required when Dataset is OpenData
    const pointOfContact = topGroup
      .find((field) => field.props.label === "Allgemeines")
      .fieldGroup.find((field) => field.props.externalLabel === "Adressen");
    pointOfContact.validators = {
      ...pointOfContact.validators,
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
      !(field.model.isOpenData || field.model.publicationHmbTG) ||
      (ctrl.value
        ? ctrl.value.some((address) => address.type?.key === "10")
        : false),
    message: "Es muss mindestens einen 'Herausgeber' geben.",
  };

  downloadLinkWhenHmbtg = {
    expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
      !field.model.publicationHmbTG ||
      ctrl.value?.some((row) => row.type?.key === "9990"), // Datendownload
    message:
      "Bei aktivierter 'Veröffentlichung gemäß HmbgTG'-Checkbox muss mindestens ein Link vom Typ 'Datendownload' angegeben sein",
  };

  private getPublicationHmbTGFieldConfig(): FormlyFieldConfig {
    return this.doc.addCheckboxInline(
      "publicationHmbTG",
      "Veröffentlichung gemäß HmbTG",
      {
        className: "flex-1",
        click: (field: FormlyFieldConfig) =>
          this.handlePublicationHmbTGClick(field),
      },
    );
  }

  private getInformationHmbTGFieldConfig() {
    return this.doc.addRepeatList(
      "informationHmbTG",
      "Informationsgegenstand",
      {
        asSelect: true,
        expressions: {
          hide: (field: FormlyFieldConfig) =>
            field.model.publicationHmbTG !== true &&
            field.model.isOpenData !== true,
          "props.disabled":
            "(field.model.publicationHmbTG !== true && field.model.isOpenData === true) || formState.disabled",
          "props.required": "field.model.publicationHmbTG === true",
        },
        options: this.doc.getCodelistForSelect(
          "informationsgegenstand",
          "informationHmbTG",
          false,
        ),
      },
    );
  }

  private handlePublicationHmbTGClick(field: FormlyFieldConfig) {
    const checked = field.formControl.value;
    if (checked) {
      this.handleActivateHmbTG(field);
    } else {
      this.handleDeactivateHmbTG(field);
    }
  }

  private handleActivateHmbTG(field: FormlyFieldConfig) {
    const cookieId = "HIDE_HMBTG_INFO";

    function executeAction(that) {
      // if inspire set access constraint "keine" else empty
      field.model.resource.accessConstraints =
        field.model.isInspireIdentified === true ? [{ key: "1" }] : [];

      // set Anwendungseinschränkungen to "Datenlizenz Deutschland Namensnennung"
      field.model.resource.useConstraints = [
        {
          title: { key: "1" },
          source: "Freie und Hansestadt Hamburg, zuständige Behörde",
        },
      ];
      field.options.formState.updateModel();

      that.tagsService
        .updatePublicationType(field.model._id, "internet", false)
        .subscribe();
    }

    if (this.doc.cookieService.getCookie(cookieId) === "true") {
      executeAction(this);
      return;
    }

    const HMBTG_INFO_TEXT_ACTIVATE =
      "Mit Aktivierung der Checkbox 'Veröffentlichung gemäß HmbTG' wird diese Metadatenbeschreibung und die dazugehörigen Ressourcen automatisch im Hamburger Transparenzportal veröffentlicht und dort 10 Jahre lang aufbewahrt. Soll die Metadatenbeschreibung dennoch nach HmbTG veröffentlicht werden?";
    const selectOpenData =
      "Wird diese Auswahl gewählt, so werden alle Zugriffsbeschränkungen entfernt. Möchten Sie fortfahren?";
    this.doc.dialog
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
          this.doc.dialog
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

  private handleDeactivateHmbTG(field: FormlyFieldConfig) {
    function executeAction() {
      // remove all categories
      field.model.openDataCategories = [];
      // remove all "Informationsgegenstände" (set to "ohne Veröffentlichungspflicht" if open data)
      field.model.informationHmbTG = field.model.isOpenData
        ? [
            {
              key: "hmbtg_20_ohne_veroeffentlichungspflicht",
            },
          ]
        : [];
      field.options.formState.updateModel();
    }

    // show warning if data is already published
    if (field.model._state === "PW" || field.model._state === "P") {
      const HMBTG_INFO_TEXT_MODIFY =
        "Dieser Datensatz ist bereits nach dem HmbTG im Transparenzportal veröffentlicht und bleibt auch nach Entfernen des Häkchens bei der Checkbox 'Veröffentlichung gemäß HmbTG' bis zum Ablauf der 10 Jahre im Transparenzportal veröffentlicht.";
      this.doc.dialog
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
      field.model.publicationHmbTG = true;
      field.model.resource.useConstraints = [
        {
          title: { key: "1" },
          source: "Freie und Hansestadt Hamburg, zuständige Behörde",
        },
      ];

      // if inspire set access constraint "keine"
      if (field.model.isInspireIdentified)
        field.model.resource.accessConstraints = [{ key: "1" }];

      this.tagsService
        .updatePublicationType(field.model._id, "internet", false)
        .subscribe();
    }, previous);
  }

  hmdkHandleDeactivateOpenData(
    field: FormlyFieldConfig,
    previous: Observable<boolean>,
  ) {
    return this.wrap(() => {
      // remove "keine" from access constraints
      field.model.resource.accessConstraints =
        field.model.resource.accessConstraints.filter(
          (entry) => entry.key !== 1,
        );

      // remove license set when open data was clicked
      field.model.resource.useConstraints = [];

      // remove all categories
      field.model.openDataCategories = [];
    }, previous);
  }

  hmdkHandleActivateInspireIdentified(
    field: FormlyFieldConfig,
    previous: Observable<boolean>,
  ) {
    return this.wrap(() => {
      // if openData is set access constraint "keine"
      if (field.model.isOpenData)
        field.model.resource.accessConstraints = [{ key: "1" }];
    }, previous);
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
