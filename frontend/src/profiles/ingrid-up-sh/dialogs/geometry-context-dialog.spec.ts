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
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormlyModule } from "@ngx-formly/core";
import { GeometryContextDialogComponent } from "./geometry-context-dialog.component";
import { UntilDestroy } from "@ngneat/until-destroy";
import { getTranslocoModule } from "../../../app/transloco-testing.module";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { OneColumnWrapperComponent } from "../../../app/formly/wrapper/one-column-wrapper.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RepeatComponent } from "../../../app/formly/types/repeat/repeat.component";
import { ConfigService } from "../../../app/services/config/config.service";
import { BehaviorSubject } from "rxjs";
import { MatSelectHarness } from "@angular/material/select/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule } from "@angular/common";
import { SelectTypeComponent } from "../../../app/formly/types/select-type/select-type.component";
import { MatInputHarness } from "@angular/material/input/testing";
import { HarnessLoader } from "@angular/cdk/testing";

describe("GeometryContextDialogComponent", () => {
  let spectator: Spectator<GeometryContextDialogComponent>;
  let select: MatSelectHarness;
  let inputs: MatInputHarness[];
  let loader: HarnessLoader;
  const createComponent = createComponentFactory({
    component: GeometryContextDialogComponent,
    providers: [
      {
        provide: MatDialogRef,
        useValue: {},
      },
      { provide: MAT_DIALOG_DATA, useValue: { model: {} } },
      {
        provide: ConfigService,
        useValue: {
          $userInfo: new BehaviorSubject({ currentCatalog: { type: "test" } }),
          getConfiguration: () => {
            return {};
          },
        },
      },
    ],
    imports: [
      FormlyMaterialModule,
      FormlyModule.forRoot({
        types: [
          { name: "repeat", component: RepeatComponent },
          { name: "ige-select", component: SelectTypeComponent },
        ],
        wrappers: [{ name: "panel", component: OneColumnWrapperComponent }],
      }),
      getTranslocoModule(),
      HttpClientTestingModule,
      CommonModule,
    ],
    detectChanges: false,
  });

  beforeEach(async () => {
    UntilDestroy()(GeometryContextDialogComponent);
    spectator = createComponent();
    spectator.detectChanges();
    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    select = await loader.getHarness(MatSelectHarness);
    inputs = await loader.getAllHarnesses(MatInputHarness);
  });

  it("should fill a new item of type 'nominal'", async () => {
    await enterCommonData();
    await expectNumInputsForType(select, "nominal", 4);
    console.log(spectator.component.form.value);
    expect(spectator.component.form.value).toEqual(
      expectedFormValue("nominal"),
    );
  });

  it("should fill a new item of type 'ordinal'", async () => {
    await enterCommonData();

    await expectNumInputsForType(select, "ordinal", 6);
    await setInputValue(4, "3");
    await setInputValue(5, "5");

    expect(spectator.component.form.value).toEqual({
      ...expectedFormValue("ordinal"),
      min: 3,
      max: 5,
    });
  });

  it("should fill a new item of type 'scalar'", async () => {
    await enterCommonData();

    await expectNumInputsForType(select, "skalar", 7);
    await setInputValue(4, "3");
    await setInputValue(5, "5");
    await setInputValue(6, "test-unit");

    expect(spectator.component.form.value).toEqual({
      ...expectedFormValue("scalar"),
      min: 3,
      max: 5,
      unit: "test-unit",
    });
  });

  it("should fill a new item of type 'other'", async () => {
    await enterCommonData();

    await expectNumInputsForType(select, "sonstiges", 4);

    expect(spectator.component.form.value).toEqual({
      ...expectedFormValue("other"),
    });
  });

  async function expectNumInputsForType(
    select: MatSelectHarness,
    type: string,
    expectedInputs: number,
  ) {
    await select.open();
    await select.clickOptions({ text: type });
    spectator.detectChanges();
    inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(expectedInputs);
  }

  async function enterCommonData() {
    await setInputValue(0, "geo-type");
    await setInputValue(1, "name");
    await setInputValue(2, "data-type");
    await setInputValue(3, "description");
  }

  async function setInputValue(index: number, value: string) {
    await inputs[index].setValue(value);
    await inputs[index].blur();
  }

  function expectedFormValue(type: string) {
    return {
      geometryType: "geo-type",
      name: "name",
      dataType: "data-type",
      description: "description",
      attributes: [],
      featureType: { key: type },
    };
  }
});
