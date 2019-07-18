import {storiesOf} from '@storybook/angular';
import {FormGroup} from '@angular/forms';
import {formlyModuleMetadata, formlyTemplate} from '../index.stories';
import {McloudFormly} from '../../app/formly/profiles/mcloud.formly';

const profile = new McloudFormly();

storiesOf('Profile', module).add('mCLOUD', () => ({
  moduleMetadata: formlyModuleMetadata,
  template: formlyTemplate,
  props: {
    model: {},
    form: new FormGroup({}),
    fields: profile.fields
  }
}));
