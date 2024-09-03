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
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { ConfigService } from "../services/config/config.service";

@Directive({
  selector: "[featureFlag]",
  standalone: true,
})
export class FeatureFlagDirective implements OnInit {
  @Input() featureFlag: string | string[];

  constructor(
    private vcr: ViewContainerRef,
    private tpl: TemplateRef<any>,
    private configService: ConfigService,
  ) {}

  ngOnInit() {
    if (this.configService.hasFlags(this.featureFlag)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
