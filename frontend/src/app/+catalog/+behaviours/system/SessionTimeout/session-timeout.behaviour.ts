import {Injectable} from '@angular/core';
import {Plugin} from '../../plugin';
import {SessionStore} from '../../../../store/session.store';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutBehaviour extends Plugin {
  id = 'plugin.session.timeout';
  name = 'Session Timeout Dauer';
  group = 'Allgemein'
  defaultActive = false;

  description = 'Angabe der Dauer bis es zu einem Session Timeout kommt. Die tatsächliche' +
    ' Dauer ist innerhalb von KeyCloak definiert und muss mit dem IGE-NG synchronisiert werden';

  constructor(private session: SessionStore) {
    super();

    this.fields.push({
      key: 'duration',
      type: 'input',
      templateOptions: {
        type: 'number',
        label: 'Timeout in Sekunden',
        placeholder: '1800',
        appearance: 'outline',
        min: 60,
        required: true
      }
    });
  }

  register() {
    console.log('Register Session Timeout');
    super.register();

    this.update();
  }

  update() {

    this.session.update({
      sessionTimeoutDuration: this.data ? this.data.duration : 1800
    });

  }

  unregister() {
    super.unregister();

    this.session.update({
      sessionTimeoutDuration: null
    });
  }
}
