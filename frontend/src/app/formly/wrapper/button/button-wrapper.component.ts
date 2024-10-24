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
import { Component } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "ige-button",
  templateUrl: "./button-wrapper.component.html",
  styleUrls: ["./button-wrapper.component.scss"],
  standalone: true,
  imports: [MatButton],
})
export class ButtonWrapperComponent extends FieldWrapper {
  onClick($event: any) {
    if (this.props.buttonConfig.onClick) {
      this.props.buttonConfig.onClick(this.to, this, $event);
    }
  }
}
