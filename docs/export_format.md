# Export Format

The export format is defined by [ige_export_format.schema.json](ige_export_format.schema.json).

The export format requires the following properties:

* _version - The version of the format.
* _export_date - The date of export.
* resources - An array of payload data (objects).

Resources can contain all sorts of objects, i.e. datasets, addresses. The structure of those objects is enforced by the exporter (or importer) functionality. Each exporter/importer should take the version into account.


