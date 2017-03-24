import {BaseBehaviour} from "../../base.behaviour";
import {Behaviour} from "../../behaviours";
import {Inject} from "@angular/core";
import {StorageService} from "../../../services/storage/storage.service";
import {FormToolbarService} from "../../../+form/toolbar/form-toolbar.service";
import {FormGroup} from "@angular/forms";
import {EventManager} from "@angular/platform-browser";
/**
 * OpenDataBehaviour
 */
export class CopyCutPasteBehaviour extends BaseBehaviour implements Behaviour {
  id = 'copyCutPaste';
  title = 'Copy - Cut - Paste';
  description = 'This behaviour contains the functionality to copy, cut and paste documents.';
  defaultActive = true;
  forProfile = 'UVP';

  constructor(
    @Inject(StorageService) private storageService: StorageService,
    @Inject(FormToolbarService) private toolbarService: FormToolbarService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    this.addSubscriber(
      this.storageService.afterLoadAndSet$.subscribe((data: any) => {

      })
    );
  }
}
