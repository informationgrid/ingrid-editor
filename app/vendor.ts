// Polyfills
import 'es6-shim';
import 'es6-promise';
import 'es7-reflect-metadata';
import 'zone.js/dist/zone';

if ('production' === process.env.ENV) {
  // Production

} else {
  // Development
  Error['stackTraceLimit'] = Infinity;
  require('zone.js/dist/long-stack-trace-zone');
}

// RxJS
// to include every operator uncomment
// require('rxjs/Rx');
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
require('rxjs/add/operator/do');
require('rxjs/add/operator/mergeMap');

// For vendors for example jQuery, Lodash, angular2-jwt just import them anywhere in your app
// Also see custom-typings.d.ts as you also need to do `typings install x` where `x` is your module
import "@angular/platform-browser";
import "@angular/router";
import "@angular/core";
