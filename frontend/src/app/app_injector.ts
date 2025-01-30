import { Injector } from '@angular/core';

export class AppInjector {
  private static injector: Injector;

  static setInjector(injector: Injector) {
    this.injector = injector;
  }

  static getInjector(): Injector {
    if (!this.injector) {
      throw new Error('Injector has not been set!');
    }
    return this.injector;
  }
}