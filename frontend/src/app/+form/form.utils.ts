import { FormToolbarService } from "./form-shared/toolbar/form-toolbar.service";
import { first } from "rxjs/operators";
import { DocumentService } from "../services/document/document.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { FormGroup } from "@angular/forms";

export class FormUtils {
  static addHotkeys(
    event: KeyboardEvent,
    service: FormToolbarService,
    readonly: boolean
  ) {
    if (event.ctrlKey && event.key === "s") {
      // CTRL + S (Save)
      console.log("SAVE");
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      if (!readonly) {
        service.sendEvent("SAVE");
      }
    }
  }

  static async handleDirtyForm(
    formControl: FormGroup,
    documentService: DocumentService,
    dialog: MatDialog,
    isAddress: boolean
  ): Promise<boolean> {
    const type = isAddress ? "address" : "document";
    const formHasChanged = formControl?.dirty;
    if (formHasChanged) {
      const form = formControl.value;
      const decision = await this.showDecisionDialog(dialog);
      if (decision === "save") {
        await documentService.save(form, false, isAddress);
      } else if (decision === "discard") {
        formControl.reset();
      } else {
        //decision is 'Abbrechen'
        return false;
      }
    }
    return true;
  }

  private static showDecisionDialog(
    dialog: MatDialog
  ): Promise<undefined | string> {
    return dialog
      .open(ConfirmDialogComponent, {
        disableClose: true,
        hasBackdrop: true,
        data: (<ConfirmDialogData>{
          title: "Änderungen speichern?",
          message:
            "Es wurden Änderungen am aktuellen Dokument vorgenommen.\nMöchten Sie die Änderungen speichern?",
          buttons: [
            { id: "cancel", text: "Abbrechen" },
            { id: "discard", text: "Verwerfen", alignRight: true },
            {
              id: "save",
              text: "Speichern",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
      })
      .afterClosed()
      .pipe(first())
      .toPromise();
  }
}
