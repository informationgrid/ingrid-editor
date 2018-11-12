import { TextboxField } from '../../app/+form/controls/index';
import { Rubric } from '../../app/+form/controls/rubric';
import { CodelistService } from '../../app/services/codelist/codelist.service';
import { Injectable } from '@angular/core';
import { IsoBaseProfile } from './iso-base.profile';
import { Container } from '../../app/+form/controls/container';
import { DocumentService } from '../../app/services/document/document.service';

export class IsoLiteratureProfile extends IsoBaseProfile {

  id = 'ISOLiterature';

  label = 'ISO-Literatur';

  constructor(storageService: DocumentService, codelistService: CodelistService) {
    super(storageService, codelistService);

    this.fields.push(...[

      new Rubric({
        label: 'Literatur',
        order: 5,
        key: 'literature',
        children: [
          new TextboxField({
            key: 'author',
            label: 'Autor/Verfasser',
            help: 'Hier wird der Titel für das Dokument eingetragen'
          }),
          new TextboxField({
            key: 'publisher',
            label: 'Herausgeber',
            help: 'Hier wird der Titel für das Dokument eingetragen'
          }),
          new TextboxField({
            key: 'publishedIn',
            label: 'Erschienen in',
            help: 'Hier wird der Titel für das Dokument eingetragen',
            domClass: 'half'
          }),
          new TextboxField({
            key: 'publishLocation',
            label: 'Erscheinungsort',
            help: 'Hier wird der Titel für das Dokument eingetragen',
            domClass: 'half'
          }),

          new Container({
            domClass: 'half',
            children: [
              new TextboxField({
                key: 'publishedInIssue',
                label: 'Band/Heft',
                help: 'Hier wird der Titel für das Dokument eingetragen',
                domClass: 'third'
              }),
              new TextboxField({
                key: 'publishedPages',
                label: 'Band/Heft',
                help: 'Hier wird der Titel für das Dokument eingetragen',
                domClass: 'third'
              }),
              new TextboxField({
                key: 'publishedYear',
                label: 'Erscheinungsjahr',
                help: 'Hier wird der Titel für das Dokument eingetragen',
                domClass: 'third'
              }),
              new TextboxField({
                key: 'publishedIsbn',
                label: 'ISBN-Nr.',
                help: 'Hier wird der Titel für das Dokument eingetragen'
              })
            ]
          }),

          new TextboxField({
            key: 'publishedHouse',
            label: 'Verlag',
            help: 'Hier wird der Titel für das Dokument eingetragen',
            domClass: 'half'
          }),
          new TextboxField({
            key: 'documentType',
            label: 'DokumentenTyp',
            help: 'Hier wird der Titel für das Dokument eingetragen'
          }),
          new TextboxField({
            key: 'bibData',
            label: 'Weitere bibliographische Angaben',
            help: 'Hier wird der Titel für das Dokument eingetragen'
          }),
          new TextboxField({
            key: 'explanation',
            label: 'Erläuterungen',
            help: 'Hier wird der Titel für das Dokument eingetragen'
          })
        ]
      })

    ]);
  }

  getTitle(doc: any): string {
    return doc.title;
  }

  getTitleFields(): string[] {
    return ['title'];
  }

}
