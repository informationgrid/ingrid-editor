import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {DocumentAbstract} from '../../store/document/document.model';
import {TreeNode} from '../../store/tree/tree-node.model';
import {DocumentUtils} from '../../services/document.utils';

@Component({
  selector: 'ige-document-icon',
  templateUrl: './document-icon.component.html',
  styleUrls: ['./document-icon.component.scss']
})
export class DocumentIconComponent implements OnInit {
  @Input() doc: any;

  @HostBinding('className') componentClass: string;

  ngOnInit(): void {
  }

  getStateClass(doc: DocumentAbstract | TreeNode) {
    const state = (<DocumentAbstract>doc)._state || (<TreeNode>doc).state;
    const type = (<DocumentAbstract>doc)._type || (<TreeNode>doc).type;

    return DocumentUtils.getStateClass(state, type);
  }
}
