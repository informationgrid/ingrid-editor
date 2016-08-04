import { Plugin } from '../plugin';

export class PublishPlugin implements Plugin {
  id = 'plugin.publish';

  register() {
    // add button to toolbar for publish action

    // add action for button
    // -> add field to document tagging publish state

    // how to display document that it is published or not?
    // -> tree, symbol in formular, which works in all kinds of formulars
    // -> or make view flexible which can be overridden

    // add hook to attach to when action is triggered
  }

  presentInDoc() { }

  presentInTree() { }

}