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
  AfterViewInit,
  Component,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";

@Component({
  selector: "ige-addons",
  templateUrl: "./addons-wrapper.component.html",
  styleUrls: ["./addons-wrapper.component.scss"],
})
export class AddonsWrapperComponent
  extends FieldWrapper
  implements AfterViewInit, OnDestroy
{
  @ViewChild("matPrefix", { static: true }) matPrefix!: TemplateRef<any>;
  @ViewChild("matSuffix", { static: true }) matSuffix!: TemplateRef<any>;

  ngAfterViewInit() {
    if (this.matPrefix) {
      if (this.props?.addonLeft?.icon != undefined) {
        this.props.prefix = this.matSuffix;
      } else {
        this.props.textPrefix = this.matPrefix;
      }
    }

    if (this.matSuffix) {
      this.props._matSuffix = this.props.suffix;
      if (this.props?.addonRight?.icon != undefined) {
        this.props.suffix = this.matSuffix;
      } else {
        this.props.textSuffix = this.matSuffix;
      }
    }
  }

  ngOnDestroy(): void {
    // we need to reset suffix to prevent infinite recursion
    this.props.suffix = null;
  }

  addonRightClick($event: any) {
    if (this.props.addonRight.onClick) {
      this.props.addonRight.onClick(this.props, this, $event);
    }
  }

  addonLeftClick($event: any) {
    if (this.props.addonLeft.onClick) {
      this.props.addonLeft.onClick(this.props, this, $event);
    }
  }
}
