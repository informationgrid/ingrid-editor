import { Plugin } from '../plugin';

export class WorkflowPlugin implements Plugin {
  id = 'plugin.workflow';

  register() {
    // disable publish plugin / buttons

    // add button for send to QA (non-QA)
    // add button for publish (QA)
    // add button for reject (QA)

    // introduce new roles for QA and non-QA

    // add action for buttons

    // display state in tree/document
  }

}