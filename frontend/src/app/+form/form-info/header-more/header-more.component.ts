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
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";
import { ProfileQuery } from "../../../store/profile/profile.query";
import { ConfigService } from "../../../services/config/config.service";
import { ContextHelpService } from "../../../services/context-help/context-help.service";
import { FormStateService } from "../../form-state.service";
import { TranslocoDirective } from "@ngneat/transloco";
import { MatTooltip } from "@angular/material/tooltip";
import { FormLabelComponent } from "../../../formly/wrapper/form-label/form-label.component";
import { AsyncPipe, DatePipe } from "@angular/common";
import { FullNamePipe } from "../../../directives/full-name.pipe";

@Component({
  selector: "ige-header-more",
  templateUrl: "./header-more.component.html",
  styleUrls: ["./header-more.component.scss"],
  animations: [
    trigger("slideDown", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("300ms", style({ height: 134, opacity: 1 })),
      ]),
      transition(":leave", [
        style({ height: 134, opacity: 1 }),
        animate("300ms", style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoDirective,
    MatTooltip,
    FormLabelComponent,
    AsyncPipe,
    DatePipe,
    FullNamePipe,
  ],
})
export class HeaderMoreComponent implements OnInit {
  @Input() showMore = false;
  hideFields: any;
  migrated: boolean;

  private contextHelpService = inject(ContextHelpService);
  private profileQuery = inject(ProfileQuery);
  private configService = inject(ConfigService);
  private formStateService = inject(FormStateService);

  metadata = this.formStateService.metadata;

  ngOnInit() {
    this.hideFields =
      this.profileQuery
        .getValue()
        .ui.hideFormHeaderInfos?.reduce((acc, val) => {
          acc[val] = true;
          return acc;
        }, {}) ?? {};

    const catCreateDate =
      this.configService.$userInfo.getValue().currentCatalog.created;
    // compare the creation dates of document and catalog
    this.migrated = new Date(this.metadata().created) < new Date(catCreateDate);
  }

  showHelp() {
    this.contextHelpService.showContextHelp(
      "all",
      "all",
      "modifiedMetadata",
      "Metadaten-Datum",
      null,
    );
  }
}
