import { Injectable } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { MatDialog } from "@angular/material/dialog";
import { FormToolbarService } from "../../../app/+form/form-shared/toolbar/form-toolbar.service";
import { ConfigService } from "../../../app/services/config/config.service";
import { DocEventsService } from "../../../app/services/event/doc-events.service";
import { FormStateService } from "../../../app/+form/form-state.service";
import { GetCapabilitiesDialogComponent } from "./get-capabilities-dialog/get-capabilities-dialog.component";
import { ProfileService } from "../../../app/services/profile.service";

@UntilDestroy()
@Injectable({
  providedIn: "root",
})
export class GetCapabilitiesAssistantPlugin extends Plugin {
  id = "plugin.getCapabilitiesAssistant";
  name = "GetCapabilities-Assistent Plugin";
  description =
    "Ermöglicht das Anlegen von Datensätzen über ein getCapabities-Dokument";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  hideInAddress = true;

  eventGetCapabilitiesAssistant = "GET_CAPABILITIES_ASSISTANT";

  private isAdmin = this.config.isAdmin();

  constructor(
    private config: ConfigService,
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private formStateService: FormStateService,
    private dialog: MatDialog,
    private profileService: ProfileService
  ) {
    super();
    // this.isActive = true;
  }

  register() {
    // only register for InGrid-Profile
    if (this.profileService.getProfileId() !== "ingrid") return;

    super.register();

    // add button to toolbar for publish action
    this.formToolbarService.addButton({
      id: "toolBtnGetCapabilties",
      tooltip: "GetCapabilities Assistent",
      matIconVariable: "auto_fix_normal",
      eventId: this.eventGetCapabilitiesAssistant,
      pos: 11,
      active: true,
    });

    // add event handler for revert
    const toolbarEventSubscription = this.docEvents
      .onEvent(this.eventGetCapabilitiesAssistant)
      .subscribe(() => this.showDialog());

    if (!this.isAdmin) {
      const buttonEnabled = this.config.hasPermission(
        this.forAddress ? "can_create_address" : "can_create_dataset"
      );
      this.formToolbarService.setButtonState(
        "toolBtnGetCapabilties",
        buttonEnabled
      );
    }

    this.subscriptions.push(toolbarEventSubscription);
  }

  showDialog() {
    this.dialog.open(GetCapabilitiesDialogComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 500,
      disableClose: false,
      hasBackdrop: true,
    });
  }

  unregister() {
    if (this.profileService.getProfileId() !== "ingrid") return;

    super.unregister();

    this.formToolbarService.removeButton("toolBtnGetCapabilties");
  }
}
