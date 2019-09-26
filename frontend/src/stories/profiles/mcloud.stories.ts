import {storiesOf} from '@storybook/angular';
import {FormGroup} from '@angular/forms';
import {formlyModuleMetadata, formlyTemplate} from '../index.stories';
import {McloudFormly} from '../../app/formly/profiles/mcloud.formly';
import {CodelistService} from '../../app/services/codelist/codelist.service';


// const profile = new McloudFormly(null, new CodelistService(null, null));

storiesOf('Profile', module)/*.add('mCLOUD', () => ({
  moduleMetadata: formlyModuleMetadata,
  template: formlyTemplate,
  props: {
    model: {},
    form: new FormGroup({}),
    fields: profile.fields
  }
}))*/;
