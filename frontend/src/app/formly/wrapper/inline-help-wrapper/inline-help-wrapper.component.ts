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
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { ContextHelpService } from "../../../services/context-help/context-help.service";
import { ConfigService } from "../../../services/config/config.service";
import { FormStateService } from "../../../+form/form-state.service";
import { NgTemplateOutlet } from "@angular/common";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { FieldToAriaLabelPipe } from "../../../directives/fieldToAiraLabel.pipe";

@Component({
    selector: "ige-inline-help-wrapper",
    templateUrl: "./inline-help-wrapper.component.html",
    styleUrls: ["./inline-help-wrapper.component.scss"],
    standalone: true,
    imports: [
        NgTemplateOutlet,
        MatIconButton,
        MatTooltip,
        MatIcon,
        FieldToAriaLabelPipe,
    ],
})
export class InlineHelpWrapperComponent
  extends FieldWrapper
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild("matSuffix", { static: true }) matSuffix!: TemplateRef<any>;

  private profile: string;
  private fieldId: string;

  constructor(
    public configService: ConfigService,
    public contextHelpService: ContextHelpService,
    private formStateService: FormStateService,
  ) {
    super();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    this.fieldId = <string>this.field.key;

    if (this.matSuffix && !this.props.isSuffixUnsupported) {
      this.props._matSuffix = this.props.suffix;
      this.props.suffix = this.matSuffix;
    }
  }

  ngOnDestroy(): void {
    // we need to reset suffix to prevent infinite recursion
    this.props.suffix = null;
  }

  showContextHelp(evt: MouseEvent) {
    if (!this.props.hasInlineContextHelp) {
      return;
    }

    evt.stopImmediatePropagation();

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;
    const title =
      this.props.fieldLabel ?? this.props.label ?? this.props.externalLabel;
    this.contextHelpService.showContextHelp(
      this.profile,
      this.formStateService.metadata()?.docType,
      this.field.props.contextHelpId || this.fieldId,
      title,
      infoElement,
    );
  }
}
