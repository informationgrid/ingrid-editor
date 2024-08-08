/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { FormToolbarService } from "./form-shared/toolbar/form-toolbar.service";
import { first } from "rxjs/operators";
import { DocumentService } from "../services/document/document.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { UntypedFormGroup } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { FormStateService } from "./form-state.service";

export class FormUtils {
  static timestamp: number = 0;

  static addHotkeys(
    event: KeyboardEvent,
    service: FormToolbarService,
    readonly: boolean,
  ) {
    // CTRL + ALT + S (save current document)
    if (event.ctrlKey && event.altKey && event.key === "s") {
      console.log("SAVE");
      event.stopImmediatePropagation();
      event.stopPropagation();
      let dif = event.timeStamp - FormUtils.timestamp;
      if (!readonly && !event.repeat && dif > 500) {
        service.sendEvent("SAVE");
        FormUtils.timestamp = event.timeStamp;
      }
    }

    // CTRL + ALT + V (trigger publish menu)
    if (event.ctrlKey && event.altKey && event.key === "v") {
      console.log("PUBLISH_MENU");
      event.stopImmediatePropagation();
      event.stopPropagation();
      service.openItemMenu("btnPublishMore");
    }
  }

  static async handleDirtyForm(
    formStateService: FormStateService,
    documentService: DocumentService,
    dialog: MatDialog,
    isAddress: boolean,
  ): Promise<boolean> {
    const form = formStateService.getForm();
    const metadata = formStateService.metadata();
    const formHasChanged = form?.dirty;
    if (formHasChanged) {
      console.log("Dirty fields:", this.getDirtyState(form));

      const value = form.value;
      const decision = await this.showDecisionDialog(dialog);
      if (decision === "save") {
        await firstValueFrom(
          documentService.save({
            id: metadata.wrapperId,
            version: metadata.version,
            data: value,
            isNewDoc: false,
            isAddress: isAddress,
          }),
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
    dialog: MatDialog,
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
        .pipe(first()),
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
      {},
    );
  }
}
