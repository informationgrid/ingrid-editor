/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import {
  MetadataOption,
  MetadataOptionItems,
} from "../../../app/formly/types/metadata-type/metadata-type.component";

@Injectable({
  providedIn: "root",
})
export class LaboratoryDataDoctypeBaw extends GeoDatasetDoctypeBaw {
  id = "BawLaboratoryData";

  label = "Labordaten";

  iconClass = "labordaten";

  metadataOptions() {
    return [
      <MetadataOption>{
        value: false,
        label: "Zulassung",
        typeOptions: [
          <MetadataOptionItems>{
            multiple: false,
            items: [
              {
                label: "Zulassungsprüfung",
                key: "isApprovalProcedure",
                value: true,
                contextHelpKey: "isOpenData",
              },
            ],
          },
        ],
      },
      ...super.metadataOptions(),
    ];
  }

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    this.common.addSharedGeoDatasetFields(this, fieldConfig);

    fieldConfig.push(
      this.addSection("Labordaten", [
        this.addRepeatList("dataCollectionReason", "Anlass der Datenerhebung", {
          required: true,
          options: [
            { label: "Kontrollprüfung", value: "Kontrollprüfung" },
            { label: "Bauwerksuntersuchung", value: "Bauwerksuntersuchung" },
            { label: "Forschungsvorhaben", value: "Forschungsvorhaben" },
            { label: "Zulassungsprüfung", value: "Zulassungsprüfung" },
          ],
        }),
        this.addRepeatList("sampleOrigin", "Probenherkunft", {
          required: true,
          options: [
            { label: "Bauwerk", value: "Bauwerk" },
            { label: "Baustelle", value: "Baustelle" },
            { label: "Labor", value: "Labor" },
            { label: "Lieferant/Hersteller", value: "Lieferant/Hersteller" },
            { label: "Externe (z.B. Uni xy)", value: "Externe (z.B. Uni xy)" },
          ],
        }),
        this.addRepeatList("testedMaterial", "Geprüftes Material", {
          required: true,
          options: [
            { label: "Beton", value: "Beton" },
            { label: "Gesteinskörnung", value: "Gesteinskörnung" },
            { label: "Zement", value: "Zement" },
            { label: "Schlauchwehr", value: "Schlauchwehr" },
            { label: "Geotextil", value: "Geotextil" },
            { label: "Wasserbausteine", value: "Wasserbausteine" },
            { label: "Wasser", value: "Wasser" },
            { label: "Beschichtung", value: "Beschichtung" },
            { label: "Korrosionsprodukte", value: "Korrosionsprodukte" },
            { label: "Stahl", value: "Stahl" },
            { label: "Elastomer", value: "Elastomer" },
          ],
        }),
        this.addRepeatList(
          "usedTestMethods",
          "Verwendete Mess- und Prüfverfahren",
          {
            required: true,
            options: [
              {
                label: "Festbetoneigenschaften (i.R.v. Bestandsuntersuchungen)",
                value: "Festbetoneigenschaften (i.R.v. Bestandsuntersuchungen)",
              },
              { label: "Betondruckfestigkeit", value: "Betondruckfestigkeit" },
              { label: "Spaltzugsfestigkeit", value: "Spaltzugsfestigkeit" },
              { label: "Sieblinie", value: "Sieblinie" },
              { label: "Kornform", value: "Kornform" },
              { label: "Knickversuch", value: "Knickversuch" },
              { label: "Dauerstand", value: "Dauerstand" },
              { label: "Zugfestigkeit", value: "Zugfestigkeit" },
              { label: "Durchschlagprüfung", value: "Durchschlagprüfung" },
              {
                label:
                  "Grundprüfung Im1 (KWW, Kondensation, Flüssigkeit, Abrieb LZA)",
                value:
                  "Grundprüfung Im1 (KWW, Kondensation, Flüssigkeit, Abrieb LZA)",
              },
              {
                label:
                  "Grundprüfung Im2/3 (Flüssigkeit, Salzsprühnebel, Abrieb, LZA)",
                value:
                  "Grundprüfung Im2/3 (Flüssigkeit, Salzsprühnebel, Abrieb, LZA)",
              },
              {
                label: "Verlängerungsprüfung Im1 (KWW, Abrieb)",
                value: "Verlängerungsprüfung Im1 (KWW, Abrieb)",
              },
              {
                label: "Verlängerungsprüfung Im2/3 (Salzsprühnebel, Abrieb)",
                value: "Verlängerungsprüfung Im2/3 (Salzsprühnebel, Abrieb)",
              },
              {
                label:
                  "Bestimmung des Widerstandes gegen kathodische Enthaftung",
                value:
                  "Bestimmung des Widerstandes gegen kathodische Enthaftung",
              },
              {
                label: "Zyklische Alterungsprüfung",
                value: "Zyklische Alterungsprüfung",
              },
              {
                label: "Bestimmung des Abriebwiderstandes ohne Wasserlagerung",
                value: "Bestimmung des Abriebwiderstandes ohne Wasserlagerung",
              },
              {
                label: "VOC-Gehalt (Gravimetrisch)",
                value: "VOC-Gehalt (Gravimetrisch)",
              },
              {
                label: "Gaschromatographie (GC)",
                value: "Gaschromatographie (GC)",
              },
              {
                label: "Infrarotspektroskopie (FTIR)",
                value: "Infrarotspektroskopie (FTIR)",
              },
              { label: "Elementanalyse", value: "Elementanalyse" },
              {
                label: "Simultane Thermische Analyse (STA)",
                value: "Simultane Thermische Analyse (STA)",
              },
              { label: "Mikroskopie", value: "Mikroskopie" },
              { label: "Metallographie", value: "Metallographie" },
              {
                label: "Korrosionswahrscheinlichkeit nach DIN 50929-3",
                value: "Korrosionswahrscheinlichkeit nach DIN 50929-3",
              },
            ],
          },
        ),
        this.addRepeatList("usedInstruments", "Verwendete Messgeräte"),
        this.addInput("underlyingStandard", "Zugrundeliegende Norm", {
          wrappers: ["panel", "form-field"],
        }),
        this.addDatepicker("standardIssueDate", "Ausgabedatum der Norm"),

        this.addSubSection(
          "approvalProcedure",
          "Zulassungsprüfung",
          [
            this.addInput("testNumber", "Prüfnummer", {
              wrappers: ["panel", "form-field"],
            }),
            this.addTextArea("systemSetup", "Aufbau des Systems", {
              className: "width-100",
              wrappers: ["panel", "form-field"],
            }),
            this.addSelect(
              "datasetVisibility",
              "Sichtbarkeit des Datensatzes",
              {
                required: true,
                options: [
                  { label: "Öffentlich", value: "Öffentlich" },
                  { label: "Beschränkt", value: "Beschränkt" },
                ],
              },
            ),
          ],
          {
            hideExpression: (field: FormlyFieldConfig) =>
              !field.options.formState.mainModel?.properties
                ?.isApprovalProcedure,
          },
        ),
      ]),
    );

    return fieldConfig;
  };
}
