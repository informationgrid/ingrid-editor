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
import { Injectable } from "@angular/core";
import { GeoDatasetDoctypeBaw } from "./geo-dataset.doctype";

@Injectable({
  providedIn: "root",
})
export class MeasurementDoctypeBaw extends GeoDatasetDoctypeBaw {
  id = "BawMeasurement";

  label = "Messdaten";

  iconClass = "Projekt";

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    this.common.addSharedGeoDatasetFields(this, fieldConfig);
    fieldConfig.push(
      this.addSection("Messdaten", [
        this.common.getTimestepFieldConfig(),
        this.getMeasuringMethodFieldConfig(),
        this.getSpatialityFieldConfig(),
        this.getMeasuringDepthFieldConfig(),
        this.getFrequencyFieldConfig(),
        this.getAverageWaterLevelFieldConfig(),
        this.getZeroLevelFieldConfig(),
        this.getDrainFieldConfig(),
        this.getGaugeFieldConfig(),
        this.getTargetParametersFieldConfig(),
      ]),
      this.getDataQualitySectionFieldConfig(),
    );
    return fieldConfig;
  };

  getMeasuringMethodFieldConfig() {
    return this.addRepeatList("measuringMethod", "Messverfahren", {
      required: true,
      options: this.getCodelistForSelect("3950011", "null"),
    });
  }

  getSpatialityFieldConfig() {
    return this.addSelect("spatiality", "Räumlichkeit", {
      options: this.getCodelistForSelect("3950012", "null"),
    });
  }

  getMeasuringDepthFieldConfig() {
    return this.addGroup("measuringDepth", "Messtiefe", [
      this.addInputInline("value", "Messtiefe", {
        type: "number",
      }),
      this.common.getUnitOfMeasurementFieldConfig(this),
      this.common.getVerticalCoordinateReferenceSystemFieldConfig(this),
    ]);
  }

  getAverageWaterLevelFieldConfig() {
    return this.addRepeat(
      "averageWaterLevel",
      "Gemittelter Wasserstand, auf den sich die Messwerte beziehen",
      {
        fields: [
          this.addInputInline("value", "Wasserstand", {
            required: true,
            type: "number",
          }),
          this.common.getUnitOfMeasurementFieldConfig(this),
        ],
      },
    );
  }

  getZeroLevelFieldConfig() {
    return this.addRepeat("zeroLevel", "Pegelnullpunkt", {
      fields: [
        this.addInputInline("value", "Pegelnullpunkt", {
          required: true,
          type: "number",
        }),
        this.common.getUnitOfMeasurementFieldConfig(this),
        this.common.getVerticalCoordinateReferenceSystemFieldConfig(this),
        this.addInputInline("description", "Beschreibung"),
      ],
    });
  }

  getGaugeFieldConfig() {
    return this.addRepeat("gauge", "Messgerät", {
      fields: [
        this.addInputInline("name", "Gerätename", { required: true }),
        this.addInputInline("id", "Geräte-ID"),
        this.addInputInline("model", "Gerätemodell"),
        this.addInputInline("description", "Beschreibung"),
      ],
    });
  }

  getTargetParametersFieldConfig() {
    return this.addRepeat("targetParameters", "Zielparameter", {
      fields: [
        this.addSelectInline("name", "Name", {
          required: true,
          options: this.getCodelistForSelect("3950021", "null"),
        }),
        this.addSelectInline("type", "Art", {
          required: true,
          options: this.getCodelistForSelect("3950014", "null"),
        }),
        this.common.getUnitOfMeasurementFieldConfig(this),
        this.addInputInline("formula", "Formel/Funktion"),
      ],
    });
  }

  getDataQualitySectionFieldConfig() {
    return this.addSection("Datenqualität(MessdatenBAW)", [
      this.addInput("posAccuracy", "Lagegenauigkeit", {
        type: "number",
        suffix: { text: "m" },
        className: "right-align",
        wrappers: ["panel", "form-field", "addons"],
      }),
      this.addTextArea(
        "dataQualityDescription",
        "Beschreibung der Datenqualität",
        {
          wrappers: ["panel", "form-field"],
        },
      ),
    ]);
  }

  getDrainFieldConfig() {
    return this.addGroup("drain", "Abfluss", [
      this.addInputInline("value", "Q min", {
        type: "number",
        suffix: {
          text: "m³/s",
        },
        className: "right-align",
        wrappers: ["form-field", "addons"],
      }),
      this.addInputInline("value", "Q max", {
        type: "number",
        suffix: {
          text: "m³/s",
        },
        className: "right-align",
        wrappers: ["form-field", "addons"],
      }),
    ]);
  }

  getFrequencyFieldConfig(): FormlyFieldConfig {
    return this.addInput("frequency", "Frequenz der Messung", {
      fieldLabel: "Frequenz der Messung",
      type: "number",
      suffix: {
        text: "s",
      },
      className: "single-field width-25 right-align",
      wrappers: ["panel", "form-field", "addons"],
    });
  }
}
