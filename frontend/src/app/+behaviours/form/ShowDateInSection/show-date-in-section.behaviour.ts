import {BaseBehaviour} from '../../base.behaviour';
import {Behaviour} from '../../behaviours';
import {Inject} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {FormGroup} from '@angular/forms';
import {EventManager} from '@angular/platform-browser';

/**
 *
 */
export class ShowDateInSectionBehaviour extends BaseBehaviour implements Behaviour {
  id = 'showDateInSection';
  title = 'Datum in Rubrik anzeigen';
  description = 'Zeige das Datum einer UVP-Rubrik im Kopfbereich an.';
  defaultActive = true;
  forProfile = 'UVP';

  constructor(@Inject(DocumentService) private storageService: DocumentService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    this.addSubscriber(
      this.storageService.afterLoadAndSet$.subscribe( () => {
        setTimeout( () => {
          let taskEl = ShowDateInSectionBehaviour._getAllDateFields();
          for (let i = 0; i < taskEl.length; i++) {
            ShowDateInSectionBehaviour._updateDOM(taskEl[i]);
          }
        }, 0);
      })
    );

    let taskEl = ShowDateInSectionBehaviour._getAllDateFields();
    for (let i = 0; i < taskEl.length; i++) {
      this.addListener(
        eventManager.addEventListener(taskEl[i], 'change', () => {
          console.log('Date has changed');
          ShowDateInSectionBehaviour._updateDOM(taskEl[i]);
        })
      );
    }
  }

  static _getAllDateFields() {
    return <NodeListOf<HTMLInputElement>> document.querySelectorAll('input[type=date]');
  }

  static _updateDOM(dateField: HTMLInputElement) {
    let title = ShowDateInSectionBehaviour._findTitleElementFrom(dateField);
    if (title.children.length > 0) title.children[0].remove();
    let dateElement = document.createElement('span');
    dateElement.textContent = ' (' + dateField.value + ')';

    title.appendChild(dateElement);
  }

  static _findTitleElementFrom(field: HTMLElement): HTMLElement {
    let parent = field.parentElement;
    while (parent && !parent.classList.contains('card')) {
      parent = parent.parentElement;
    }
    if (parent) {
      return <HTMLElement>parent.querySelector('.title');
    }
    return parent;
  }
}
