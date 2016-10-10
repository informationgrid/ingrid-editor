import {TableField, TextareaField, TextboxField, Container} from "../../../+form/controls/index";
import {MapField} from "../../../+form/controls/field-map";
import {LatLng, TileLayer} from "leaflet";

let linkDocTypes = {
  values: ['PDF', 'XML', 'ZIP', 'TXT', 'andere']
};

export let profile = [

  new Container({
    useGroupKey: 'mainInfo',
    domClass: 'half',
    children: [
      new TextboxField({
        key: 'taskId',
        label: 'Vorhabensnummer',
        // domClass: 'half',
        order: 1
      }),

      new TextboxField({
        key: 'title',
        label: 'Titel',
        // domClass: 'half',
        order: 10
      }),

      new TextareaField({
        key: 'description',
        label: 'Beschreibung',
        // domClass: 'half',
        rows: 10,
        order: 20
      }),
    ]
  }),

  new MapField({
    key: 'bbox',
    label: 'Karte',
    domClass: 'half',
    height: 340,
    options: {
      zoomControl: true,
      center: new LatLng(40.731253, -73.996139),
      zoom: 12,
      minZoom: 4,
      maxZoom: 19,
      layers: [new TileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })]
    },
    settings: {}
  }),


  new TableField({
    key: 'categories',
    label: 'Kategorien',
    columns: [
      {headerName: 'Kategorie', field: 'category', editable: true}
    ],
    order: 2
  }),

  new Container({
    useGroupKey: 'publicDisplay',
    label: 'Öffentliche Auslegung',
    isRepeatable: true,
    order: 10,
    children: [[
      new TextboxField({
        key: 'date',
        label: 'Datum',
        // domClass: 'half',
        type: 'date'
      }),
      new TableField({
        key: 'constructionInfo',
        label: 'Auslegungsinformationen',
        columns: [
          {headerName: 'Titel', field: 'title', editable: true},
          {headerName: 'Link', field: 'link', editable: true},
          {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
          {headerName: 'Größe', field: 'size', editable: true},
          {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
        ]
      }),
      new TableField({
        key: 'applicationDocs',
        label: 'Antragsunterlagen',
        columns: [
          {headerName: 'Titel', field: 'title', editable: true},
          {headerName: 'Link', field: 'link', editable: true},
          {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
          {headerName: 'Größe', field: 'size', editable: true},
          {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
        ]
      }),
      new TableField({
        key: 'reportsAndRecommendations',
        label: 'Berichte und Empfehlungen',
        columns: [
          {headerName: 'Titel', field: 'title', editable: true},
          {headerName: 'Link', field: 'link', editable: true},
          {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
          {headerName: 'Größe', field: 'size', editable: true},
          {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
        ]
      }),
      new TableField({
        key: 'additionalDocs',
        label: 'Weitere Unterlagen',
        columns: [
          {headerName: 'Titel', field: 'title', editable: true},
          {headerName: 'Link', field: 'link', editable: true},
          {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
          {headerName: 'Größe', field: 'size', editable: true},
          {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
        ]
      })
    ]]
  }),


  new Container({
    useGroupKey: 'publicHearingDates',
    label: 'Erörterungstermin',
    isRepeatable: true,
    order: 15,
    children: [[
      new TextboxField({
        key: 'date',
        label: 'Datum',
        // domClass: 'half',
        type: 'date'
      }),
      new TableField({
        key: 'announcements',
        label: 'Bekanntmachung',
        columns: [
          {headerName: 'Titel', field: 'title', editable: true},
          {headerName: 'Link', field: 'link', editable: true},
          {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
          {headerName: 'Größe', field: 'size', editable: true},
          {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
        ]
      })
    ]]
  }),

  new Container({
    useGroupKey: 'approvalDecisions',
    label: 'Zulassungsentscheidung',
    isRepeatable: true,
    order: 20,
    children: [[
      new TextboxField({
        key: 'date',
        label: 'Datum',
        // domClass: 'half',
        type: 'date'
      }),
      new TextareaField({
        key: 'paymentDecision',
        label: 'Zahlungsentscheidung',
        // domClass: 'half',
        rows: 5
      }),
      new TableField({
        key: 'constructionInfo',
        label: 'Auslegungsinformationen',
        columns: [
          {headerName: 'Titel', field: 'title', editable: true},
          {headerName: 'Link', field: 'link', editable: true},
          {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
          {headerName: 'Größe', field: 'size', editable: true},
          {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
        ]
      })
    ]]
  })

];