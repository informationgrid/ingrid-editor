import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "./form-toolbar.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormToolbarComponent } from "./form-toolbar.component";
import { Subject } from "rxjs";
import { MatTabsModule } from "@angular/material/tabs";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTooltipModule } from "@angular/material/tooltip";

let spectator: Spectator<FormToolbarComponent>;
const buttonSubject = new Subject<Array<ToolbarItem | Separator>>();

const createHost = createComponentFactory({
  component: FormToolbarComponent,
  imports: [
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  providers: [
    mockProvider(FormToolbarService, {
      toolbar$: buttonSubject,
    }),
  ],
  detectChanges: false,
});

describe("Form-Toolbar", () => {
  beforeEach(() => {
    spectator = createHost();
  });

  it("should not show any toolbar items after initialization", () => {
    // trigger data binding to update the view
    spectator.detectChanges();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll("button");

    // confirm the element's content
    expect(buttons.length).toBe(0);
  });

  it("should add a toolbar item through the service", () => {
    const item: ToolbarItem = {
      id: "btnToolbarTest",
      tooltip: "TEST_TOOLBAR_ITEM",
      matIconVariable: "remove",
      pos: 1,
      eventId: "TEST_EVENT",
    };
    buttonSubject.next([item]);
    spectator.detectChanges();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll("button");

    // confirm the element's content
    expect(buttons.length).toBe(1);
  });

  it("should add a publish button through the service", () => {
    const item: ToolbarItem = {
      id: "btnPublish",
      tooltip: "TEST_TOOLBAR_ITEM",
      matIconVariable: "remove",
      pos: 100,
      eventId: "TEST_EVENT",
      isPrimary: true,
      label: "Veröffentlichen",
      align: "right",
    };
    buttonSubject.next([item]);

    spectator.detectChanges();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll("button");

    // confirm the element's content (publish button consists of two buttons!)
    expect(buttons.length).toBe(2);
  });
});
