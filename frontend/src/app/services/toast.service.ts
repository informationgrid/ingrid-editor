import { Injectable } from "@angular/core";

@Injectable()
export class ToastService {
  // constructor(private messageService: MessageService) {
  // }

  show(message: string) {}

  /*

  show(message: string) {

    this.messageService.add({severity: 'success', summary: 'Service Message', detail: 'Via MessageService'});

    // Or create the instance of ToastOptions
    const toastOptions: ToastOptions = {
      title: message,
      // msg: '...',
      showClose: false,
      timeout: 2000,
    };

    // Add see all possible types in one shot
    // this.toastyService.info(toastOptions);
  }*/
}
