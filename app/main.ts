import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import '../node_modules/leaflet/dist/leaflet.css';
import '../styles.css';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {IgeModule} from './app.module';

// Ahead of Time compile
// platformBrowser().bootstrapModuleFactory( IgeModuleNgFactory );

// JIT compile long form
platformBrowserDynamic().bootstrapModule( IgeModule );
