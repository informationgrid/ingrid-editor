import { CheckboxField, RadioField, TextareaField, TextboxField } from '../../../+form/controls/index';
import { OpenTableField } from '../../../+form/controls/field-opentable';
import { Profile } from '../profile';
import { Rubric } from '../../../+form/controls/rubric';
import { DropdownField } from '../../../+form/controls/field-dropdown';
import { FieldBase } from '../../../+form/controls/field-base';
import { CodelistService } from '../../../+form/services/codelist.service';
import { Container } from '../../../+form/controls/container';
import { Injectable } from '@angular/core';
import { TreeField } from '../../../+form/controls/field-tree';

@Injectable()
export class IsoBaseProfile implements Profile {

  id = 'ISOService';

  label = 'no-name';

  profile: Array<FieldBase<any>> = null;

  constructor(public codelistService: CodelistService) {
    const [addressTypes, advProductGroup, metadataLanguage, publicationInfo] = this.prepareSelects();

    this.profile = [

      new Rubric({
        label: 'Allgemein',
        order: 0,
        children: [
          new TextboxField({
            key: 'title',
            label: 'Titel',
            help: 'Hier wird der Titel für das Dokument eingetragen',
            // domClass: 'half',
            order: 10
          }),

          new TextboxField({
            key: 'previewImage',
            label: 'Vorschaugrafik',
            domClass: 'half',
            order: 10,
            help: 'Die Vorschaugrafik wird in den Suchergebnissen verwendet und dargestellt.'
          }),

          new Container({
            domClass: 'half',
            children: [
              new TextareaField({
                key: 'description',
                label: 'Beschreibung',
                rows: 10
              }),

              new TextboxField({
                key: 'shortDescription',
                label: 'Kurzbezeichnung'
              })
            ]
          }),

          new OpenTableField({
            key: 'addresses',
            label: 'Adressen',
            addWithDialog: true,
            order: 20,
            columns: [
              {
                editor: addressTypes,
                width: '150px'
              },
              {
                editor: new TreeField({
                  key: 'addressRef',
                  label: 'Adresse'
                })
              }
            ]
          }),

          new CheckboxField({
            key: 'isAdvCompatible',
            label: 'AdV kompatibel',
            order: 25
          }),

          new CheckboxField({
            key: 'isOpenData',
            label: 'Open Data',
            domClass: 'half',
            order: 25
          }),

          new RadioField({
            key: 'isConform',
            domClass: 'half',
            order: 26,
            options: [
              {label: 'konform', value: 'conform'},
              {label: 'nicht konform', value: 'not_conform'}
            ]
          })
        ]
      }),

      new Rubric({
        label: 'Verschlagwortung',
        order: 30,
        children: [
          new OpenTableField({
            key: 'advProductGroup',
            label: 'AdV-Produktgruppe',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          }),
          new OpenTableField({
            key: 'optionalKeywords',
            label: 'Optionale Schlagwörter',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          }),

          new CheckboxField({
            key: 'showAsTopic',
            label: 'Als InGrid-Portal-Themenseite anzeigen',
            order: 30
          }),

          new OpenTableField({
            key: 'environmentTopics',
            label: 'Themen',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          })

        ]
      }),


      new Rubric({
        label: 'Raumbezugssystem',
        order: 30,
        children: [
          new OpenTableField({
            key: 'geoThesaurus',
            label: 'Geothesaurus-Raumbezug',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          }),

          new OpenTableField({
            key: 'crs',
            label: 'Raumbezugssystem',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          }),

          new Container({
            domClass: 'half',
            label: 'Höhe',
            hideLabel: false,
            key: 'spatialHeight',
            children: [
              new TextboxField({
                key: 'min',
                label: 'Minimum',
                domClass: 'third'
              }),

              new TextboxField({
                key: 'max',
                label: 'Maximum',
                domClass: 'third'
              }),

              new DropdownField({
                key: 'unit',
                label: 'Maßeinheit',
                domClass: 'third'
              }),

              new DropdownField({
                key: 'verticalDate',
                label: 'Vertikaldatum'
              })
            ]
          }),

          new TextareaField({
            key: 'spatialDescription',
            label: 'Erläuterungen',
            rows: 5,
            domClass: 'half'
          })
        ]
      }),

      new Rubric({
        label: 'Zeitbezug',
        order: 30,
        children: [
          new OpenTableField({
            key: 'timeReference',
            label: 'Zeitbezug der Ressource',
            order: 30,
            domClass: 'half',
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              },
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          }),

          new TextareaField({
            key: 'timeDescription',
            label: 'Erläuterungen',
            rows: 5,
            domClass: 'half'
          })
        ]
      }),

      new Rubric({
        label: 'Zusatzinformation',
        order: 30,
        children: [
          metadataLanguage,

          publicationInfo,

          new OpenTableField({
            key: 'resourceLanguage',
            label: 'Sprache der Resource',
            hideHeader: true,
            columns: [
              {
                editor: new TextboxField({
                  key: 'lang',
                  label: 'Sprache'
                })
              }
            ]
          }),
        ]
      }),

      new Rubric({
        label: 'Verweise',
        order: 30,
        children: [
          new OpenTableField({
            key: 'linksTo',
            label: 'Verweise',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          })
        ]
      })

    ];
  }

  getTitle(doc: any): string {
    return doc.title;
  }

  getTitleFields(): string[] {
    return ['title'];
  }

  private prepareSelects() {
    const advProductGroupSelect = new DropdownField({
      key: 'advProductGroup',
      label: 'Produktgruppe',
      options: []
    });
    /*this.codelistService.byId( '8010' ).then( codelist => {
      advProductGroupSelect.options = codelist;
    } );*/

    const addressTypes = new DropdownField({
      key: 'type',
      label: 'Typ',
      isCombo: true,
      useCodelist: 505,
      options: []
    });

    const metadataLanguage = new DropdownField({
      key: 'metadataLanguage',
      label: 'Sprache des Metadatensatzes',
      domClass: 'half',
      options: []
    });

    const publicationInfo = new DropdownField({
      key: 'publicationInfo',
      label: 'Veröffentlichung',
      isCombo: true,
      domClass: 'half',
      options: []
    });

    this.codelistService.byIds( ['505', '8010', '99999999', '3571'] ).then( codelists => {
      addressTypes.options = codelists[0];
      advProductGroupSelect.options = codelists[1];
      metadataLanguage.options = codelists[2];
      publicationInfo.options = codelists[3];
    } );

    return [addressTypes, advProductGroupSelect, metadataLanguage, publicationInfo];
  }
}
