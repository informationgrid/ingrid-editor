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
