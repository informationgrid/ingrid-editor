import { FormToolbarService } from "./form-shared/toolbar/form-toolbar.service";
import { first } from "rxjs/operators";
import { DocumentService } from "../services/document/document.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { FormGroup, UntypedFormGroup } from "@angular/forms";
import { firstValueFrom } from "rxjs";

export class FormUtils {
  static timestamp: number = 0;

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
      let dif = event.timeStamp - FormUtils.timestamp;
      if (!readonly && !event.repeat && dif > 500) {
        service.sendEvent({ type: "SAVE" });
        FormUtils.timestamp = event.timeStamp;
      }
    }
  }

  static async handleDirtyForm(
    form: FormGroup,
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
        await firstValueFrom(
          documentService.save({
            data: value,
            isNewDoc: false,
            isAddress: isAddress,
          })
        );
      } else if (decision === "discard") {
        form.reset(undefined, { emitEvent: false });
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
    return firstValueFrom(
      dialog
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
    );
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
