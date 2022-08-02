import { FormToolbarService } from "./form-shared/toolbar/form-toolbar.service";
import { first } from "rxjs/operators";
import { DocumentService } from "../services/document/document.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { UntypedFormGroup } from "@angular/forms";

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
    form: UntypedFormGroup,
    documentService: DocumentService,
    dialog: MatDialog,
    isAddress: boolean
  ): Promise<boolean> {
    const formHasChanged = form?.dirty;
    if (formHasChanged) {
      console.log("Dirty fields:", this.getDirtyState(form));

      const value = form.value;
      const decision = await this.showDecisionDialog(dialog);
      if (decision === "save") {
        await documentService.save(value, false, isAddress).toPromise();
      } else if (decision === "discard") {
        form.reset();
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

  private static getDirtyState(form: UntypedFormGroup): Object {
    return Object.keys(form.controls).reduce<Object>(
      (dirtyState, controlKey) => {
        const control = form.controls[controlKey];

        if (!control.dirty) {
          return dirtyState;
        }

        if (control instanceof UntypedFormGroup) {
          return {
            ...dirtyState,
            [controlKey]: FormUtils.getDirtyState(control),
          };
        }

        return {
          ...dirtyState,
          [controlKey]: control.value,
        };
      },
      {}
    );
  }
}
