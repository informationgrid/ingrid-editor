import {Injectable} from '@angular/core';
import {ToastOptions, ToastyService} from 'ng2-toasty';

@Injectable()
export class ToastService {

    constructor(private toastyService: ToastyService) {}

    show(message: string) {
      // Or create the instance of ToastOptions
      let toastOptions: ToastOptions = {
        title: message,
        // msg: '...',
        showClose: false,
        timeout: 2000,
      };

      // Add see all possible types in one shot
      this.toastyService.info(toastOptions);
    }
}