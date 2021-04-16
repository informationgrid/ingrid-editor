import {Injectable} from '@angular/core';
import {Plugin} from '../../plugin';
import {FormToolbarService} from '../../../../+form/form-shared/toolbar/form-toolbar.service';
import {SessionStore} from '../../../../store/session.store';

@Injectable()
export class ShowJsonBehaviour extends Plugin {

  id = 'plugin.show.json';
  name = 'Anzeige JSON Formular';
  group = 'Toolbar';
  description = 'Ein neuer Button ermöglicht die Anzeige des JSON-Dokuments neben dem Formular.';
  defaultActive = false;
  private eventShowJsonId = 'SHOW_JSON';


  constructor(private formToolbarService: FormToolbarService,
              private sessionStore: SessionStore) {
    super();
  }

  register() {

    console.log('Register Show Json behaviour');
    super.register();

    this.formToolbarService.addButton({id: 'toolBtnShowJsonSeparator', pos: 999, isSeparator: true});
    this.formToolbarService.addButton({
      id: 'toolBtnShowJson',
      tooltip: 'JSON anzeigen',
      matIconVariable: 'bug_report',
      eventId: this.eventShowJsonId,
      pos: 1000,
      active: true
    });

    // add event handler for revert
    const toolbarEventSubscription = this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === this.eventShowJsonId) {
        this.toggleJSONView();
      }
    });

    this.subscriptions.push(toolbarEventSubscription);
  }

  private toggleJSONView() {
    this.sessionStore.update(state => ({
      ui: {
        ...state.ui,
        showJSONView: !state.ui.showJSONView
      }
    }));
  }


  unregister() {
    super.unregister();

    this.formToolbarService.removeButton('toolBtnShowJsonSeparator');
    this.formToolbarService.removeButton('toolBtnShowJson');
  }
}
