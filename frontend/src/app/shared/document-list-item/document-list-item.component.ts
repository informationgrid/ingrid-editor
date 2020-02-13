import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DocumentAbstract} from '../../store/document/document.model';
import {Observable} from 'rxjs';
import {TreeNode} from '../../store/tree/tree-node.model';

@Component({
  selector: 'ige-document-list-item',
  templateUrl: './document-list-item.component.html',
  styleUrls: ['./document-list-item.component.scss']
})
export class DocumentListItemComponent implements OnInit {

  @Input() docs: Observable<DocumentAbstract[]>;
  @Input() doc: DocumentAbstract | TreeNode;
  @Input() denseMode = false;
  @Input() hideDate = true;
  @Output() select = new EventEmitter<DocumentAbstract>();

  constructor() { }

  ngOnInit(): void {
  }

}
