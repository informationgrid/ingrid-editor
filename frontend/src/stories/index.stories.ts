import {storiesOf} from '@storybook/angular';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';

import {Welcome, Button} from '@storybook/angular/demo';
import {DateboxComponent} from '../app/form-fields/datebox/datebox.component';
import {MatDatepickerModule} from '@angular/material';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormFieldsModule} from '../app/form-fields/form-fields.module';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

storiesOf('Welcome', module).add('to Storybook', () => ({
  component: Welcome,
  props: {}
}));

storiesOf('Button', module)
  .add('with text', () => ({
    component: Button,
    props: {
      text: 'Hello Button'
    }
  }))
  .add(
    'with some emoji',
    () => ({
      component: Button,
      props: {
        text: '😀 😎 👍 💯'
      }
    }),
    {notes: 'My notes on a button with emojis'}
  )
  .add(
    'with some emoji and action',
    () => ({
      component: Button,
      props: {
        text: '😀 😎 👍 💯',
        onClick: action('This was clicked OMG')
      }
    }),
    {notes: 'My notes on a button with emojis'}
  );

storiesOf('Another Button', module).add('button with link to another story', () => ({
  component: Button,
  props: {
    text: 'Go to Welcome Story',
    onClick: linkTo('Welcome')
  }
}));
storiesOf('Datebox', module).add('simple', () => ({
  component: DateboxComponent,
  moduleMetadata: {
    imports: [
      CommonModule,
      FormsModule,
      BrowserAnimationsModule,
      ReactiveFormsModule,
      FormFieldsModule
    ]
  },
  template: '<div [formGroup]="form"><ige-datebox [formControlName]="key"></ige-datebox></div>',
  props: {
    /*text: 'Go to Welcome Story',
    onClick: linkTo('Welcome'),*/
    key: 'birthday',
    form: new FormGroup({
      birthday: new FormControl(1562620600475)
    })

  }
}));
