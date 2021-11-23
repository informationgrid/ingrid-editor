import { Transfer } from "@flowjs/ngx-flow";
import { UploadError } from "./upload.service";

export class TransfersWithErrorInfo {
  error: UploadError;
  transfer: Transfer;

  constructor(error: any, transfer: Transfer) {
    this.error = error;
    this.transfer = transfer;
  }
}
