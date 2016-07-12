import { bootstrap }                            from '@angular/platform-browser-dynamic';
import { disableDeprecatedForms, provideForms } from '@angular/forms';

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles.css";

import { AppComponent } from './app.component';

bootstrap(AppComponent, [
  disableDeprecatedForms(),
  provideForms()
])
.catch((err: any) => console.error(err));

