import {IgeDocument} from "../../models/ige-document";
import {DocumentAbstract} from "../../store/document/document.model";

export class DocumentUtils {

  static createDocumentAbstract(doc: IgeDocument, state: string): DocumentAbstract {

    return {
      _hasChildren: false,
      _parent: doc._parent,
      _profile: doc._profile,
      icon: "",
      id: doc._id,
      title: doc.title,
      //_id: doc._id,
      _state: state
    };

  }
}
