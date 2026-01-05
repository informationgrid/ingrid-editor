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
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator/vitest";
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
import { DocumentService } from "../../../services/document/document.service";
import { provideMatomoTesting } from "ngx-matomo-client/testing";
import { provideZonelessChangeDetection, signal } from "@angular/core";

let spectator: Spectator<FormToolbarComponent>;
const buttonSignal = signal<Array<ToolbarItem | Separator>>([]);
const documentOperationFinishedSubject = new Subject<boolean>();

const createHost = createComponentFactory({
  component: FormToolbarComponent,
  imports: [
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  providers: [
    provideZonelessChangeDetection(),
    mockProvider(FormToolbarService, {
      toolbar$: buttonSignal,
    }),
    mockProvider(DocumentService, {
      documentOperationFinished$: documentOperationFinishedSubject,
    }),
    provideMatomoTesting(),
  ],
  detectChanges: false,
});

describe("Form-Toolbar", () => {
  beforeEach(() => {
    buttonSignal.set([]);
    spectator = createHost();
  });

  it("should not show any toolbar items after initialization", async () => {
    // trigger data binding to update the view
    await spectator.fixture.whenStable();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll("button");

    // confirm the element's content
    expect(buttons.length).toBe(0);
  });

  it("should add a toolbar item through the service", async () => {
    const item: ToolbarItem = {
      type: "button",
      id: "btnToolbarTest",
      tooltip: "TEST_TOOLBAR_ITEM",
      matIconVariable: "remove",
      pos: 1,
      eventId: "TEST_EVENT",
      active: false,
    };
    buttonSignal.set([item]);
    await spectator.fixture.whenStable();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll("button");

    // confirm the element's content
    expect(buttons.length).toBe(1);
  });

  it("should add a publish button through the service", async () => {
    const item: ToolbarItem = {
      type: "button",
      id: "btnPublish",
      tooltip: "TEST_TOOLBAR_ITEM",
      matIconVariable: "remove",
      pos: 100,
      eventId: "TEST_EVENT",
      isPrimary: true,
      label: "Veröffentlichen",
      align: "right",
      active: false,
    };
    buttonSignal.set([item]);

    await spectator.fixture.whenStable();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll("button");

    // confirm the element's content (publish button consists of two buttons!)
    expect(buttons.length).toBe(2);
  });
});
