/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { inject, signal, WritableSignal } from "@angular/core";
import { map, Subject, takeUntil, tap } from "rxjs";
import { UpdatableMatSnackBar } from "./updatable-snackbar";
import { RxStompService } from "../../../rx-stomp.service";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";

export abstract class SnackBarMessageService {
  private currentSnackBarRef: MatSnackBarRef<UpdatableMatSnackBar>;

  protected status: WritableSignal<any> = signal(null);
  public message: WritableSignal<string> = signal("Waiting");

  private snackBar = inject(MatSnackBar);
  private rxStompService = inject(RxStompService);
  private destroy$: Subject<void> = null;

  startListening(): void {
    // if it's already listening, do nothing
    if (this.destroy$ && !this.destroy$.closed) {
      return;
    }
    this.destroy$ = new Subject<void>();
    this.rxStompService
      .watch(this.getWatchPath())
      .pipe(
        tap((msg) => console.log("new message received", msg)),
        map((msg) => JSON.parse(msg.body)),
        tap((data) => {
          // TODO: data should have status of all files to be copied
          this.status.set(data);
          this.updateMessage(data);
          if (!this.currentSnackBarRef) {
            this.openSnackBar();
          } else if (this.isDone()) {
            this.destroy$.next();
            this.destroy$.complete();
            this.destroy$.unsubscribe();
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        complete: () => {
          setTimeout(
            () => this.currentSnackBarRef?.dismiss(),
            this.getExitDelay(),
          );
        },
      });
  }

  private openSnackBar() {
    this.currentSnackBarRef = this.snackBar.openFromComponent(
      UpdatableMatSnackBar,
      { duration: 0, data: this },
    );
    // clear the reference and reset the state when manually dismissed
    this.currentSnackBarRef.afterDismissed().subscribe(() => {
      // only cleanup when there is not another copy-job running
      if (this.destroy$.closed) {
        this.currentSnackBarRef = null;
        this.status.set(null);
      }
    });
  }

  protected abstract updateMessage(data: any): void;

  protected abstract isDone(): boolean;

  protected getExitDelay(): number {
    return 2000;
  }

  protected abstract getWatchPath(): string;
}
