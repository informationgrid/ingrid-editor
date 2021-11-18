import { Transfer } from "@flowjs/ngx-flow";

export class TransfersWithErrorInfo {
  errors: any;
  transfer: Transfer;

  constructor(errors: any, transfer: Transfer) {
    this.errors = errors;
    this.transfer = transfer;
  }
}
