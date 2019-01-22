export class FormUtils {
  addHotkeys(event: KeyboardEvent, component) {
    if (event.ctrlKey && event.keyCode === 83) { // CTRL + S (Save)
      console.log( 'SAVE' );
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      if (component.form) {
        component.save();
      }
    }
  }
}
