import { RepeatListComponent } from "./repeat-list.component";
import { createHostFactory, SpectatorHost } from "@ngneat/spectator";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";
import { FormlyFieldConfig, FormlyForm, FormlyModule } from "@ngx-formly/core";
import { fakeAsync, tick } from "@angular/core/testing";
import { RepeatDetailListComponent } from "../repeat-detail-list/repeat-detail-list.component";
import { IgeFormlyModule } from "../../ige-formly.module";
import { MatIconTestingModule } from "@angular/material/icon/testing";

describe("RepeatListComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    declarations: [RepeatDetailListComponent, AddButtonComponent],
    imports: [
      IgeFormlyModule,
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
    let input = ".mat-autocomplete-trigger";

    let elements = spectator.queryAll(listItemSelector);
    expect(elements.length).toBe(0);
    spectator.typeInElement("test-simple", input);
    spectator.dispatchKeyboardEvent(input, "keydown", "Enter");
    elements = spectator.queryAll(listItemSelector);
    expect(elements.length).toBe(1);
    tick(300);
  }));

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
