import { RepeatListComponent } from "./repeat-list.component";
import { createHostFactory, SpectatorHost } from "@ngneat/spectator";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";
import { FormlyFieldConfig, FormlyForm, FormlyModule } from "@ngx-formly/core";
import { fakeAsync, tick } from "@angular/core/testing";
import { RepeatDetailListComponent } from "../repeat-detail-list/repeat-detail-list.component";
import { IgeFormlyModule } from "../../ige-formly.module";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { of } from "rxjs";
import { Codelist } from "../../../store/codelist/codelist.model";
import { SelectOptionUi } from "../../../services/codelist/codelist.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";

describe("RepeatListComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    declarations: [RepeatDetailListComponent, AddButtonComponent],
    imports: [
      IgeFormlyModule,
      MatIconTestingModule,
      HttpClientTestingModule,
      MatSnackBarModule,
      FormsModule,
      MatAutocompleteModule,
      MatSelectModule,
      ReactiveFormsModule,
      MatIconTestingModule,
      FormlyModule.forRoot({
        types: [
          {
            name: "repeatList",
            component: RepeatListComponent,
          },
        ],
      }),
    ],
  });

  describe("Simple", () => {
    beforeEach(() => {
      spectator = createHost(`<formly-form [fields]="config"></formly-form>`, {
        hostProps: {
          config: [
            {
              key: "repeatListSimple",
              type: "repeatList",
              defaultValue: [],
              props: {},
            },
          ] as FormlyFieldConfig[],
        },
      });
    });

    it("should create", () => {
      expect(spectator).toBeTruthy();
    });

    it("should add a simple value", fakeAsync(() => {
      spectator.detectChanges();
      let listItemSelector = ".list-item";
      let input = "input";

      let elements = spectator.queryAll(listItemSelector);
      expect(elements.length).toBe(0);
      spectator.typeInElement("test-simple", input);
      spectator.dispatchKeyboardEvent(input, "keydown", "Enter");
      elements = spectator.queryAll(listItemSelector);
      expect(elements.length).toBe(1);
      tick(300);
    }));
  });

  describe("Codelist", () => {
    beforeEach(() => {
      spectator = createHost(`<formly-form [fields]="config"></formly-form>`, {
        hostProps: {
          config: [
            {
              key: "repeatListCodelist",
              type: "repeatList",
              defaultValue: [],
              props: {
                options: of(<SelectOptionUi[]>[
                  { label: "Eins", value: "1" },
                  { label: "Zwei", value: "2" },
                  { label: "Drei", value: "3" },
                ]),
                codelistId: 123,
              },
            },
          ] as FormlyFieldConfig[],
        },
      });
    });

    fit("should add a codelist value", fakeAsync(() => {
      spectator.detectChanges();
      let listItemSelector = ".list-item";
      let input = "input";

      let elements = spectator.queryAll(listItemSelector);
      expect(elements.length).toBe(0);
      // spectator.typeInElement("test-simple", input);

      // arrange
      // const validateButton: HTMLButtonElement = spectator.query(VALIDATE_BUTTON_SELECTOR);
      // const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      // const radioButton: MatRadioButtonHarness = await loader.getHarness(MatRadioButtonHarness);
      // act
      // await radioButton.check();

      spectator.click(input);
      tick(500);
      spectator.click(".mat-mdc-option:nth-child(1)");
      spectator.click(".mat-mdc-option:nth-child(1)");
      // expect(spectator.queryAll(".mat-mdc-autocomplete-panel").length).toBe(1);
      // spectator.keyboard.pressKey("Ein", input);
      spectator.detectChanges();
      // spectator.typeInElement("Ein", input);
      // spectator.dispatchKeyboardEvent(input, "keydown", "a");
      // spectator.keyboard.pressKey("ArrowDown", input);
      // const keyboardEvent = createKeyboardEvent("keyup", "ArrowDown");
      // spectator.evendispatchKeyboardEvent(input, )
      // expect(spectator.queryAll(".mat-mdc-option-active").length).toBe(1);
      // spectator.dispatchKeyboardEvent(input, "keydown", "Enter");
      // spectator.keyboard.pressKey("arrowdown", input);
      spectator.keyboard.pressEnter(".mat-mdc-option");
      tick(500);
      elements = spectator.queryAll(listItemSelector);
      expect(elements.length).toBe(1);
      tick(300);
    }));
  });

  xit("should remove a simple value", () => {
    expect(spectator).toBeTruthy();
  });

  xit("should show a codelist and select an item", () => {
    /*spectator.component.to.options = of([
      {label: 'a', value: 'a'},
      {label: 'b', value: 'b'},
      {label: 'c', value: 'c'}
    ]);*/

    spectator.detectChanges();

    // spectator.query()
  });
});
