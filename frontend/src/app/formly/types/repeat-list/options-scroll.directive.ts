/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import {
  DestroyRef,
  Directive,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { tap } from "rxjs/operators";
import { MatAutocomplete } from "@angular/material/autocomplete";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface IAutoCompleteScrollEvent {
  autoComplete: MatAutocomplete;
  scrollEvent: Event;
}

@Directive({
  selector: "mat-autocomplete[optionsScroll]",
})
export class OptionsScrollDirective {
  @Input() thresholdPercent = 0.95;
  @Output("optionsScroll") scroll =
    new EventEmitter<IAutoCompleteScrollEvent>();
  private panelElement?: HTMLElement;
  private openedPanelTimeout?: ReturnType<typeof setTimeout>;
  private readonly boundOnScroll = this.onScroll.bind(this);

  constructor(
    public autoComplete: MatAutocomplete,
    destroyRef: DestroyRef,
  ) {
    destroyRef.onDestroy(() => {
      clearTimeout(this.openedPanelTimeout);
      this.removeScrollEventListener();
    });

    this.autoComplete.opened
      .pipe(
        tap(() => {
          // Note: When autocomplete raises opened, panel is not yet created (by Overlay)
          // Note: The panel will be available on next tick
          // Note: The panel wil NOT open if there are no options to display
          this.openedPanelTimeout = setTimeout(() => {
            // Note: remove listner just for safety, in case the close event is skipped.
            this.removeScrollEventListener();
            this.panelElement = this.autoComplete.panel?.nativeElement;
            this.panelElement?.addEventListener("scroll", this.boundOnScroll);
          });
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.autoComplete.closed
      .pipe(
        tap(() => this.removeScrollEventListener()),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private removeScrollEventListener() {
    this.panelElement?.removeEventListener("scroll", this.boundOnScroll);
    this.panelElement = undefined;
  }

  onScroll(event: Event) {
    if (this.thresholdPercent === undefined) {
      this.scroll.next({ autoComplete: this.autoComplete, scrollEvent: event });
    } else {
      const threshold =
        (this.thresholdPercent *
          100 *
          (<HTMLInputElement>event.target).scrollHeight) /
        100;
      const current =
        (<HTMLInputElement>event.target).scrollTop +
        (<HTMLInputElement>event.target).clientHeight;

      if (current > threshold) {
        this.scroll.next({
          autoComplete: this.autoComplete,
          scrollEvent: event,
        });
      }
    }
  }
}
