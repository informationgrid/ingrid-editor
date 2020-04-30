import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {ConfigService} from '../services/config/config.service';

@Directive({
  selector: '[featureFlag]'
})
export class FeatureFlagDirective {
  @Input() featureFlag: string | string[];

  constructor(
    private vcr: ViewContainerRef,
    private tpl: TemplateRef<any>,
    private configService: ConfigService
  ) {
  }

  ngOnInit() {
    if (this.configService.hasFlags(this.featureFlag)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }

}
