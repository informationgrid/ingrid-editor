/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { FormMenuService } from "../app/+form/form-menu.service";
import { TranslocoService } from "@jsverse/transloco";
import { ConfigService } from "../app/services/config/config.service";
import { BehaviourService } from "../app/services/behavior/behaviour.service";
import { GeoDatasetDoctypeLubwSkdvOk } from "./ingrid-lubw/doctypes/geo-dataset.doctype";
import { FormControl } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistStore } from "../app/store/codelist/codelist.store";

@Component({
  template: "",
  standalone: true,
})
class InGridLUBWComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeLubwSkdvOk);
  behaviourService = inject(BehaviourService);
  configService = inject(ConfigService);
  formMenuService = inject(FormMenuService);
  translocoService = inject(TranslocoService);
  protected codelistStore = inject(CodelistStore);

  constructor() {
    super();
    this.isoView.isoExportFormat = "ingridISOLUBW";
    const isAuthor = this.configService.$userInfo.value.role === "author";
    this.modifyFormFieldConfiguration(isAuthor);

    if (isAuthor) {
      this.geoService.showUpdateGetCapabilities = false;
      this.disablePlugins([
        "plugin.newDoc",
        "plugin.folder",
        "plugin.copy.cut.paste",
        "plugin.deleteDocs",
        "plugin.tags",
        "plugin.getCapWizard",
      ]);
      this.formMenuService.addExcludedMenuItems("publish", [
        "PUBLISH",
        "VALIDATE",
        "UNPUBLISH",
        "REVERT",
      ]);
      this.translocoService.setTranslation(
        {
          publish: {
            confirmMessage:
              "Mit der Bestätigung dieser Meldung wird der Metadatensatz gespeichert und im Web-Auftritt der RIPS-Metadaten veröffentlicht. Eine automatische Benachrichtigung wird an RIPS-Metadaten@lubw.bwl.de gesendet.",
          },
        },
        "de",
        { merge: true },
      );
      this.replaceHelpLink();
    }
  }

  private modifyFormFieldConfiguration(isAuthor: boolean) {
    [
      this.specialisedTask,
      this.geoDataset,
      this.publication,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      const manipulateDocumentFieldsBase = docType.manipulateDocumentFields;
      docType.manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
        manipulateDocumentFieldsBase(fieldConfig);
        const contacts = docType.findFieldElementWithId(
          fieldConfig,
          "pointOfContact",
        );
        contacts.field.validators = {
          threeAddressTypesNeeded: {
            expression: (ctrl: FormControl) => {
              const requiredTypes = ["12", "7", "5"];
              return requiredTypes.every((requiredType) =>
                ctrl.value
                  ? ctrl.value.some(
                      (address: any) => address.type?.key === requiredType,
                    )
                  : false,
              );
            },
            message: () => {
              const addressTypes = this.getAddressTypesByKeys(["12", "7", "5"]);
              return `Es müssen insgesamt drei Adressen angegeben werden: '${addressTypes[0]}', '${addressTypes[1]}' und '${addressTypes[2]}'.`;
            },
          },
        };

        const keywordsField = docType.findFieldElementWithId(
          fieldConfig,
          "keywords",
        );
        const analyzeField = keywordsField.fieldConfig.splice(
          keywordsField.index + 1,
        );
        docType.addBefore(keywordsField, analyzeField[0]);

        if (isAuthor) {
          const freeKeywords = docType.findFieldElementWithId(
            fieldConfig,
            "free",
          );
          freeKeywords.field.props.hideInputField = true;
        }

        return fieldConfig;
      };
    });
  }

  private getAddressTypesByKeys(keys: string[]) {
    return keys.map((key) => {
      return this.codelistStore.getCodelistEntryValueByKey(
        "505",
        key,
        ConfigService.catalogId,
      );
    });
  }

  private disablePlugins(pluginIds: string[]) {
    pluginIds.forEach((id) => {
      this.behaviourService.getBehaviour(id).isActive.set(false);
    });
  }

  private replaceHelpLink() {
    // update external help for authors
    this.formMenuService.removeMenuItem("settings", "help");
    this.formMenuService.addMenuItem("settings", {
      title: "Hilfe",
      name: "help",
      link: "https://wissensplattform-umwelt.bwl.de/hilfsmittel_und_hinweise",
    });
  }
}

@NgModule({
  imports: [InGridLUBWComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridLUBWComponent;
  }
}
