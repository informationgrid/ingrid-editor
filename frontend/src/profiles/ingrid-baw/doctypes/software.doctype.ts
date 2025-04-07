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
import { FormlyFieldConfig } from "@ngx-formly/core";
import { inject, Injectable } from "@angular/core";
import { CommonFieldsBaw } from "./common-fields";
import { InformationSystemDoctype } from "../../ingrid/doctypes/information-system.doctype";
import { TextAreaOptions } from "../../form-field-helper";

@Injectable({
  providedIn: "root",
})
export class SoftwareDoctypeBaw extends InformationSystemDoctype {
  common = inject(CommonFieldsBaw);

  label = "Software";

  constructor() {
    super();
    this.showInspireRelevant = false;
    this.showAdVCompatible = false;
    this.showAdVProductGroup = false;
    this.options.hide = {
      ...this.options.hide,
      ...{
        openData: true,
        distribution: true,
        resourceGroup: true,
        digitalTransferOptions: true,
        orderInfo: true,
        temporalStatus: true,
        maintenanceInformation: true,
        legalBasicsDescriptions: true,
      },
    };
    this.options.dynamicRequired.events = undefined;
  }

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    this.common.addSharedFields(this, fieldConfig, {
      verticalCoordinateReferenceSystem: true,
      verticalExtent: true,
    });

    // Allgemeines
    const pointOfContactPosition = this.findFieldElementWithId(
      fieldConfig,
      "pointOfContact",
    );
    this.addAfter(
      pointOfContactPosition,
      ...[
        this.getEinsatzzweckFieldConfig(),
        ...this.getNutzerkreisFieldConfig(),
        ...this.getProduktiverEinsatzFieldConfig(),
      ],
    );

    // Fachbezug
    const serviceUrlsPosition = this.findFieldElementWithId(
      fieldConfig,
      "serviceUrls",
    );

    this.addAfter(
      serviceUrlsPosition,
      ...[
        ...this.getErganzungsmodulFieldConfig(),
        ...this.getBetriebssystemFieldConfig(),
        this.getProgrammierspracheFieldConfig(),
        this.getEntwicklungsumgebungFieldConfig(),
        this.getBibliothekenFieldConfig(),
        ...this.getInstallationFieldConfig(),
        this.getInstallationWithFieldConfig(),
      ],
    );
    // remove "Weitere Informationen"
    const moreInfo = this.findParentFieldElementWithId(
      fieldConfig,
      "systemEnvironment",
    );
    moreInfo.fieldConfig.splice(moreInfo.index, 1);

    // Raumbezug
    const spatialSystems = this.findFieldElementWithId(
      fieldConfig,
      "spatialSystems",
    );
    spatialSystems.fieldConfig.splice(spatialSystems.index, 1);

    // Zeitbezug
    const resourceTimeSpan = this.findParentFieldElementWithId(
      fieldConfig,
      "resourceDateType",
    );
    resourceTimeSpan.fieldConfig.splice(resourceTimeSpan.index, 1);

    // Verfügbarkeit
    const useLimitationPosition = this.findFieldElementWithId(
      fieldConfig,
      "useLimitation",
    );

    this.addAfter(
      useLimitationPosition,
      ...[
        ...this.getQuellenrechteFieldConfig(),
        ...this.getNutzungsrechteFieldConfig(),
      ],
    );
    const useConstraintsField = this.findFieldElementWithId(
      fieldConfig,
      "useConstraints",
    );
    useConstraintsField.fieldConfig[
      useConstraintsField.index
    ].expressions.className = undefined;

    // this.addAfter(serviceUrlsPosition, this.getErstellungsvertragFieldConfig());
    // this.addAfter(serviceUrlsPosition, this.getSupportvertragFieldConfig());
    // this.addAfter(serviceUrlsPosition,);
    //
    // // Verfügbarkeit
    // addQuellenrechte(newFieldsToDirtyCheck, additionalFields);
    // addNutzungsrechte(newFieldsToDirtyCheck, additionalFields);

    return fieldConfig;
  };

  getEinsatzzweckFieldConfig(): FormlyFieldConfig {
    return this.addTextArea("purpose", "Einsatzzweck", this.id);
  }

  getNutzerkreisFieldConfig(): FormlyFieldConfig[] {
    return [
      this.addGroup("userGroup", "Nutzerkreis", [
        this.addCheckboxInline("baw", "BAW"),
        this.addCheckboxInline("wsv", "WSV"),
        this.addCheckboxInline("extern", "Extern"),
      ]),
      this.getNotesFieldGroupConfig("userGroup"),
    ];
  }

  getProduktiverEinsatzFieldConfig(): FormlyFieldConfig[] {
    return [
      this.addGroup("productiveUse", "Produktiver Einsatz", [
        this.addCheckboxInline("wsv", "WSV-Auftrag"),
        this.addCheckboxInline("baw", "FuE"),
        this.addCheckboxInline("other", "Andere"),
      ]),
      this.getNotesFieldGroupConfig("productiveUse"),
    ];
  }

  getNotesFieldGroupConfig(
    elementIdPrefix: string,
    options?: TextAreaOptions,
  ): FormlyFieldConfig {
    return this.addInlineTextAreaGroup(
      `${elementIdPrefix}Notes`,
      "Ergänzungen und Erläuterungen",
      elementIdPrefix,
      options,
    );
  }

  getErganzungsmodulFieldConfig(): FormlyFieldConfig[] {
    return [
      this.addRadioboxes(
        "hasSupplementaryModule",
        "Ergänzungsmodul zu Marktsoftware",
        {
          required: true,
          options: [
            {
              value: "Ja",
              id: true,
            },
            {
              value: "Nein",
              id: false,
            },
          ],
        },
      ),
      this.addInlineTextAreaGroup(
        "nameOfSoftware",
        "Name der Marktsoftware",
        "supplementaryModule",
        {
          expressions: {
            "props.required": (field: FormlyFieldConfig) =>
              field.options.formState.mainModel?.hasSupplementaryModule ===
              true,
          },
        },
      ),
    ];
  }

  getBetriebssystemFieldConfig(): FormlyFieldConfig[] {
    return [
      this.addGroup("operatingSystem", "Betriebssystem", [
        this.addCheckboxInline("windows", "Windows"),
        this.addCheckboxInline("linux", "Linux"),
      ]),
      this.getNotesFieldGroupConfig("operatingSystem"),
    ];
  }

  getProgrammierspracheFieldConfig(): FormlyFieldConfig {
    return this.addRepeatList("programmingLanguage", "Programmiersprache(n)", {
      required: true,
      options: this.getCodelistForSelect("3950030", "null"),
    });
  }
  getEntwicklungsumgebungFieldConfig(): FormlyFieldConfig {
    return this.addRepeatList(
      "developmentEnvironment",
      "Entwicklungsumgebung",
      {
        options: this.getCodelistForSelect("3950031", "null"),
      },
    );
  }
  getBibliothekenFieldConfig(): FormlyFieldConfig {
    return this.addTextArea("libraries", "Bibliothek", this.id);
  }

  hasServerInstallation = (field: FormlyFieldConfig) =>
    field.options.formState.mainModel?.installation?.server === true;

  hasHlrInstallation = (field: FormlyFieldConfig) =>
    field.options.formState.mainModel?.installation?.hlr === true;

  hasSourceRights = (field: FormlyFieldConfig) =>
    field.options.formState.mainModel?.resource?.hasSourceRights === true;

  hasUsageRights = (field: FormlyFieldConfig) =>
    field.options.formState.mainModel?.resource?.hasUsageRights === true;

  getInstallationFieldConfig(): FormlyFieldConfig[] {
    return [
      this.addGroup("installation", "Installationsort", [
        this.addCheckboxInline("local", "Lokal"),
        this.addCheckboxInline("hlr", "HLR"),
        this.addCheckboxInline("server", "Server"),
      ]),
      this.addRepeatList("hlrNames", "Name des HLR", {
        options: this.getCodelistForSelect("3950033", "null"),
        expressions: {
          hide: (field: FormlyFieldConfig) => !this.hasHlrInstallation(field),
          "props.required": (field: FormlyFieldConfig) =>
            this.hasHlrInstallation(field),
        },
      }),
      this.addRepeatList("serverNames", "Servername", {
        expressions: {
          hide: (field: FormlyFieldConfig) =>
            !this.hasServerInstallation(field),
          "props.required": (field: FormlyFieldConfig) =>
            this.hasServerInstallation(field),
        },
      }),
    ];
  }

  getInstallationWithFieldConfig(): FormlyFieldConfig {
    return this.addSelect("installationWith", "Installation über", {
      required: true,
      options: this.getCodelistForSelect("3950032", "null"),
    });
  }

  getQuellenrechteFieldConfig(): FormlyFieldConfig[] {
    return [
      this.addRadioboxes("hasSourceRights", "BAW-Rechte an Quellen", {
        required: true,
        options: [
          {
            value: "Ja",
            id: true,
          },
          {
            value: "Nein",
            id: false,
          },
        ],
      }),
      this.getNotesFieldGroupConfig("sourceRights", {
        expressions: {
          "props.required": (field: FormlyFieldConfig) =>
            this.hasSourceRights(field),
        },
      }),
    ];
  }

  getNutzungsrechteFieldConfig(): FormlyFieldConfig[] {
    return [
      this.addRadioboxes(
        "hasUsageRights",
        "Rechte bei Nutzung der SW durch Dritte",
        {
          required: true,
          options: [
            {
              value: "Ja",
              id: true,
            },
            {
              value: "Nein",
              id: false,
            },
          ],
        },
      ),
      this.getNotesFieldGroupConfig("hasUsageRights", {
        expressions: {
          "props.required": (field: FormlyFieldConfig) =>
            this.hasUsageRights(field),
        },
      }),
    ];
  }

  addInlineTextAreaGroup(
    id,
    label,
    elementIdPrefix,
    options: TextAreaOptions = {},
  ): FormlyFieldConfig {
    return this.addGroup(null, null, [
      this.addTextAreaInline(id, label, elementIdPrefix, options),
    ]);
  }
}
