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
import { inject, Injectable } from "@angular/core";
import { BehaviourService } from "../behavior/behaviour.service";
import { ConfigService } from "../config/config.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AiAssistantGuard {
  private behaviourService = inject(BehaviourService);

  constructor(private router: Router) {}

  canActivate(): boolean {
    const isActivated = this.behaviourService
      .getBehaviour("plugin.show.ai-assistant")
      .isActive();

    if (!isActivated) {
      // Redirect to home page.
      this.router.navigate([ConfigService.catalogId]);
    }

    return isActivated;
  }
}
