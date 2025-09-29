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
import { effect, inject, signal, Type, WritableSignal } from "@angular/core";
import { untilDestroyed } from "@ngneat/until-destroy";
import { map, tap } from "rxjs";
import { UpdatableMatSnackBar } from "./updatable-snackbar";
import { RxStompService } from "../../../rx-stomp.service";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";

export abstract class SnackBarMessageService {
  private currentSnackBarRef: MatSnackBarRef<UpdatableMatSnackBar>;

  protected status: WritableSignal<any> = signal(null);
  public message: WritableSignal<string> = signal("Waiting");

  private snackBar = inject(MatSnackBar);
  private rxStompService = inject(RxStompService);

  constructor() {
    this.setupSnackBarEffect();
  }

  startListening(): void {
    this.rxStompService
      .watch(this.getWatchPath())
      .pipe(
        untilDestroyed(this),
        map((msg) => JSON.parse(msg.body)),
        tap((data) => {
          this.status.set(data);
          this.updateMessage(data);
        }),
      )
      .subscribe();
  }

  private setupSnackBarEffect(): void {
    effect(() => {
      if (this.status()) {
        if (!this.currentSnackBarRef) {
          this.openSnackBar();
        } else if (this.isDone()) {
          setTimeout(
            () => this.currentSnackBarRef?.dismiss(),
            this.getExitDelay(),
          );
        }
      }
    });
  }

  private openSnackBar() {
    this.currentSnackBarRef = this.snackBar.openFromComponent(
      UpdatableMatSnackBar,
      { duration: 0, data: this.getImplementingClass() },
    );
    // clear the reference and reset the state when manually dismissed
    this.currentSnackBarRef.afterDismissed().subscribe(() => {
      this.currentSnackBarRef = null;
      this.status.set(null);
    });
  }

  protected abstract updateMessage(data): void;

  protected abstract isDone(): boolean;

  protected getExitDelay(): number {
    return 2000;
  }

  protected abstract getWatchPath(): string;

  protected abstract getImplementingClass(): Type<SnackBarMessageService>;
}
