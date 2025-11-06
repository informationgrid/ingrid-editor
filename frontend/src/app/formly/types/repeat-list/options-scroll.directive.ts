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
import {
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { MatAutocomplete } from "@angular/material/autocomplete";

export interface IAutoCompleteScrollEvent {
  autoComplete: MatAutocomplete;
  scrollEvent: Event;
}

@Directive({
  selector: "mat-autocomplete[optionsScroll]",
})
export class OptionsScrollDirective implements OnDestroy {
  @Input() thresholdPercent = 0.95;
  @Output("optionsScroll") scroll =
    new EventEmitter<IAutoCompleteScrollEvent>();
  _onDestroy = new Subject();

  constructor(public autoComplete: MatAutocomplete) {
    this.autoComplete.opened
      .pipe(
        tap(() => {
          // Note: When autocomplete raises opened, panel is not yet created (by Overlay)
          // Note: The panel will be available on next tick
          // Note: The panel wil NOT open if there are no options to display
          setTimeout(() => {
            // Note: remove listner just for safety, in case the close event is skipped.
            this.removeScrollEventListener();
            this.autoComplete.panel.nativeElement.addEventListener(
              "scroll",
              this.onScroll.bind(this),
            );
          });
        }),
        takeUntil(this._onDestroy),
      )
      .subscribe();

    this.autoComplete.closed
      .pipe(
        tap(() => this.removeScrollEventListener()),
        takeUntil(this._onDestroy),
      )
      .subscribe();
  }

  private removeScrollEventListener() {
    this.autoComplete.panel.nativeElement.removeEventListener(
      "scroll",
      this.onScroll,
    );
  }

  ngOnDestroy() {
    // this._onDestroy.next();
    this._onDestroy.complete();

    this.removeScrollEventListener();
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
