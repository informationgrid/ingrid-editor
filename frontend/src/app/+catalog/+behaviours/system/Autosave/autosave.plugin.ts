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
import { inject, Injectable } from "@angular/core";
import { FormStateService } from "../../../../+form/form-state.service";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { SessionQuery } from "../../../../store/session.query";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class AutosavePlugin extends Plugin {
  id = "plugin.autosave";
  name = "Automatisches Speichern";
  description =
    "Erfolgt nach 10min keine weitere Eingabe, wird der Datensatz automatisch gespeichert, insofern Änderungen vorliegen.";
  // group = "Toolbar";
  defaultActive = false;
  hide = false;
  private timeout$: Observable<number>;

  private tenMinutes = 10 * 60;

  constructor(
    private formStateService: FormStateService,
    private docEvents: DocEventsService,
    private session: SessionQuery,
    private snackBar: MatSnackBar,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  register() {
    this.timeout$ = this.session.select("sessionTimeoutIn");
    const sessionDuration = this.session.getValue().sessionTimeoutDuration;

    this.timeout$
      .pipe(
        filter(() => this.formStateService.getForm()?.dirty),
        filter((time) => sessionDuration - time > this.tenMinutes),
      )
      .subscribe(() => {
        this.snackBar.open(
          "Der Datensatz wurde automatisch gespeichert.",
          "Schließen",
          { duration: undefined },
        );
        this.docEvents.sendEvent({ type: "SAVE" });
      });
  }

  unregister() {
    super.unregister();
  }
}
