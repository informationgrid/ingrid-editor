import { Catalog } from "../../+catalog/services/catalog.model";

export interface MessageFormatBackend {
  _id?: string;
  _validUntil?: string;
  catalog?: Catalog;
  message: Message;
}

export interface Message {
  text: string;
}
