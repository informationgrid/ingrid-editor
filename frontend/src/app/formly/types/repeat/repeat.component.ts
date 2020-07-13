import {Component, OnInit} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-repeat',
  templateUrl: './repeat.component.html',
  styleUrls: ['./repeat.component.scss']
})
export class RepeatComponent extends FieldArrayType implements OnInit {

  ngOnInit(): void {

    const minLength = this.to.minLength || 0;
    if (minLength > 0) {
      this.handleMinimumLength(this.formControl.value, minLength);
      this.formControl.valueChanges
        .pipe(untilDestroyed(this))
        .subscribe(value => this.handleMinimumLength(value, minLength));
    }

  }

  private handleMinimumLength(value: any[], minLength: number) {

    // only add one repeatable since change detection of formControl adds another repeatable
    // as long as the minimal required one is not reached
    // TODO: remove timeout without getting ExpressionHasChangedException
    setTimeout(() => {
      if (value.length < minLength) {
        this.add(null, {}, {markAsDirty: false});
      }
    }, 0);

  }
}
