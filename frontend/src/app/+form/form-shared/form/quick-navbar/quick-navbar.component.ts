/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, Input } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { IgeDocument } from "../../../../models/ige-document";
import { SessionQuery } from "../../../../store/session.query";
import { SessionStore } from "../../../../store/session.store";

@UntilDestroy()
@Component({
  selector: "ige-quick-navbar",
  templateUrl: "./quick-navbar.component.html",
  styleUrls: ["./quick-navbar.component.scss"],
})
export class QuickNavbarComponent {
  @Input() sections: string[] = [];
  @Input() hasOptionalFields = false;

  @Input() numberOfErrors: number = 0;

  @Input() model: IgeDocument;

  optionalButtonState = this.session.select(
    (state) => state.ui.toggleFieldsButtonShowAll,
  );

  addTitleToTooltip = (tooltip: string): string =>
    tooltip + ": " + this.model.title;

  constructor(
    private session: SessionQuery,
    private sessionStore: SessionStore,
  ) {}

  updateToggleButtonState(checked: boolean) {
    this.sessionStore.update((state) => {
      return {
        ui: {
          ...state.ui,
          toggleFieldsButtonShowAll: checked,
        },
      };
    });
  }
}
