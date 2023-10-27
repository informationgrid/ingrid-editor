import { Component, EventEmitter, Input, Output } from "@angular/core";
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
  originalTooltip: string = "";

  constructor(
    private session: SessionQuery,
    private sessionStore: SessionStore,
  ) {}

  onDataReceived(data: string) {
    this.originalTooltip = data;
  }

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
