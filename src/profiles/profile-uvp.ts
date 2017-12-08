import { StorageService } from '../app/services/storage/storage.service';

export class ProfileUvp {
  id = 'uvp';

  fields = [];

  behaviours = [];

  constructor(storageService: StorageService) {

  }

  applyValidations(form) {
    console.log('UVP Form validation !?', form);
  };

}
