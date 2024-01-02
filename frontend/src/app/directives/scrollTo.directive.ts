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
import { Directive, ElementRef, Input, Renderer2 } from "@angular/core";

@Directive({ selector: "[scrollTo]" })
export class ScrollToDirective {
  @Input() scrollTo: boolean;

  constructor(
    private el: ElementRef,
    renderer: Renderer2,
  ) {}

  // TODO: find better way since too many watchers are active, try to put directive only on needed elements without parameter here
  protected ngOnChanges() {
    if (this.scrollTo === true) {
      this.el.nativeElement.scrollIntoView();
    }
  }
}
