import { Component, Input } from "@angular/core";
import { of } from "rxjs";
import { ContextHelpService } from "../services/context-help/context-help.service";
import { ConfigService } from "../services/config/config.service";

@Component({
  selector: "ige-help-context-button",
  template: `
    <button
      mat-icon-button
      class="hint"
      aria-haspopup="dialog"
      (click)="showHelpDialog()"
      matTooltip="Eingabehilfe"
    >
      <mat-icon class="material-icons-outlined" svgIcon="info-24px"></mat-icon>
    </button>
  `,
})
export class HelpContextButtonComponent {
  @Input() fieldId: string;
  @Input() description: string;
  @Input() label: string;
  @Input() docType: string;

  constructor(
    private contextHelpService: ContextHelpService,
    private configService: ConfigService,
  ) {}

  showHelpDialog() {
    if (this.description) {
      this.contextHelpService.showContextHelpPopup(
        this.label,
        of(this.description),
      );
    } else {
      let profile = this.configService.$userInfo.getValue().currentCatalog.type;
      this.contextHelpService.showContextHelp(
        profile,
        this.docType,
        this.fieldId,
        this.label,
        null,
      );
    }
  }
}
