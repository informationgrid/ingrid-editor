/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { ConfigService } from "../../services/config/config.service";
import { ContextHelpService } from "../../services/context-help/context-help.service";

@Component({
  selector: "ige-one-column-wrapper",
  templateUrl: "./one-column-wrapper.component.html",
  styleUrls: ["./one-column-wrapper.component.scss"],
})
export class OneColumnWrapperComponent
  extends FieldWrapper
  implements AfterViewInit
{
  @ViewChild("fieldComponent", { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;

  private profile: string;
  private fieldId: string;

  constructor(
    public configService: ConfigService,
    public contextHelpService: ContextHelpService,
  ) {
    super();
  }

  ngAfterViewInit() {
    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    this.fieldId = <string>this.field.key;
  }

  showContextHelp(infoElement: HTMLElement) {
    this.contextHelpService.showContextHelp(
      this.profile,
      this.formState.mainModel?._type,
      this.field.props.contextHelpId || this.fieldId,
      this.props.externalLabel,
      infoElement,
    );
  }
}
