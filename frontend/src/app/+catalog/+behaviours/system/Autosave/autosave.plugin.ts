import { Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { UntilDestroy } from "@ngneat/until-destroy";
import { FormStateService } from "../../../../+form/form-state.service";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { SessionQuery } from "../../../../store/session.query";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";

@UntilDestroy()
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
    private session: SessionQuery
  ) {
    super();
  }

  register() {
    this.timeout$ = this.session.select("sessionTimeoutIn");
    const sessionDuration = this.session.getValue().sessionTimeoutDuration;

    this.timeout$
      .pipe(
        filter(() => this.formStateService.getForm()?.dirty),
        filter((time) => sessionDuration - time > this.tenMinutes)
      )
      .subscribe((time) => this.docEvents.sendEvent({ type: "SAVE" }));
  }

  unregister() {
    super.unregister();
  }
}
