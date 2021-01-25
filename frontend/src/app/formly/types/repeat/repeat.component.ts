import {Component, OnInit} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';

@Component({
  selector: 'ige-repeat',
  templateUrl: './repeat.component.html',
  styleUrls: ['./repeat.component.scss']
})
export class RepeatComponent extends FieldArrayType implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {

    /**
     * Show minimal required repeatables.
     * Attention: using the below method leads to "ExpressionChangedAfterItHasBeenCheckedError" problems
     * or strange behaviour when removing an address and loading others afterwards (removed address overwrites form)
     */

    /*
        const minLength = this.to.minLength || 0;
        if (minLength > 0) {
          console.log('initial');
          this.handleMinimumLength(this.formControl.value, minLength);
          this.formControl.valueChanges
            .pipe(untilDestroyed(this))
            .subscribe(value => {
              console.log('value change');
              this.handleMinimumLength(value, minLength);
            });
        }
    */
  }

  private handleMinimumLength(value: any[], minLength: number) {

    console.log(`handleMinimumLength: value: ${value.length}, minLenght: ${minLength}`);

    // only add one repeatable since change detection of formControl adds another repeatable
    // as long as the minimal required one is not reached
    // TODO: remove timeout without getting ExpressionHasChangedException
    // setTimeout(() => {
    for (let i = value.length; i < minLength; i++) {
      this.add(null, {}, {markAsDirty: false});
    }
    // }, 0);

  }
}
