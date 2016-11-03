import {Behaviour} from "../../services/behaviour/behaviours";
import {EventManager} from "@angular/platform-browser";
import {FormGroup} from "@angular/forms";
import {BaseBehaviour} from "../base.behaviour";
import {StorageService} from "../../services/storage/storage.service";
import {Inject} from "@angular/core";
/**
 *
 */
export class ShowDateInSectionBehaviour extends BaseBehaviour implements Behaviour {
  id = 'showDateInSection';
  title = 'Datum in Rubrik anzeigen';
  description = 'Zeige das Datum einer UVP-Rubrik im Kopfbereich an.';
  defaultActive = true;
  forProfile = 'UVP';

  constructor(@Inject(StorageService) private storageService: StorageService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    this.addSubscriber(
      this.storageService.afterLoadAndSet$.subscribe( () => {
        setTimeout( () =>
        {
          let taskEl = this._getAllDateFields();
          for (let i = 0; i < taskEl.length; i++) {
            this._updateDOM(taskEl[i]);
          }
        }, 0);
      })
    );

    let taskEl = this._getAllDateFields();
    for (let i = 0; i < taskEl.length; i++) {
      this.addListener(
        eventManager.addEventListener(taskEl[i], 'change', () => {
          console.log('Date has changed');
          this._updateDOM(taskEl[i]);
        })
      );
    }
  }

  _getAllDateFields() {
    return <NodeListOf<HTMLInputElement>> document.querySelectorAll('input[type=date]');
  }

  _updateDOM(dateField: HTMLInputElement) {
    let title = this._findTitleElementFrom(dateField);
    if (title.children.length > 0) title.children[0].remove();
    let dateElement = document.createElement('span');
    dateElement.textContent = ' (' + dateField.value + ')';

    title.appendChild(dateElement);
  }

  _findTitleElementFrom(field: HTMLElement): HTMLElement {
    let parent = field.parentElement;
    while (parent && !parent.classList.contains('panel')) {
      parent = parent.parentElement;
    }
    if (parent) {
      return <HTMLElement>parent.querySelector('.title');
    }
    return parent;
  }
}
