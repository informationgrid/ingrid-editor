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
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from "@angular/core";

@Directive({
  selector: "[long-press]",
  standalone: true,
})
export class LongPressDirective {
  @Output() longPress = new EventEmitter();
  @Output() shortClick = new EventEmitter();

  private longPressTimeout: any;
  private longPressHandled: boolean;

  constructor(private el: ElementRef) {}

  @HostListener("mousedown", ["$event"])
  @HostListener("touchstart", ["$event"])
  onMouseDown(event: Event) {
    this.longPressHandled = false;
    this.longPressTimeout = setTimeout(() => {
      this.longPress.emit(event);
      this.longPressHandled = true;
    }, 500);
    return;
  }

  @HostListener("mouseup")
  @HostListener("touchend")
  onMouseUp(event: Event) {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      if (!this.longPressHandled) this.shortClick.emit(event);
    }
  }
}
