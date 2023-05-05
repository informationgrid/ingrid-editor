# Apache Configuration

When the IGE-NG is installed there are two options how to access the application.

- directly on a domain/sub-domain (e.g. https://ige-ng.informationgrid.eu)
- under a context path on a domain (e.g. https://informationgrid.eu/ige-ng)

This needs different configurations.

## Domain/Sub-Domain

Apache

```
<VirtualHost *:443>
    ServerName domain.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/...
    SSLCertificateKeyFile /etc/letsencrypt/...
    SSLCertificateChainFile /etc/letsencrypt/...

    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>

    RewriteCond %{HTTP:Connection} Upgrade [NC]
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule /(.*) ws://localhost:18101/$1 [P,L]

    <IfModule proxy_module>
        RewriteEngine on
        ProxyPass / http://localhost:18101/
        ProxyPassReverse / http://localhost:18101/
    </IfModule>

    ProxyRequests Off
    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    # we need encoded slashes for uploads of extracted zip files
    AllowEncodedSlashes On
</VirtualHost>
```

## Context-Path

Nginx

```
location /ige-ng/ {
  proxy_pass http://<IP>;
  proxy_redirect default;

  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $http_host;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

You also need to add define some environment variables in your docker-compose.yml:

```
CONTEXT_PATH=/ige-ng
BROKER_URL=wss://<DOMAIN>/ige-ng/ws
```

# Create a new profile

## Frontend

Create a new Module with a component inside "`src/profiles`" - directory. For an example look at the file
"`profile-mcloud.ts`".

The ProfileService dynamically loads a profile during load of the website, using the catalog type
(`profile-<type>.ts`), which comes from the backend. For example, if a catalog of type "mcloud" is used,
then the file "`profile-mcloud.ts`" is loaded.

In the profile a component is defined which has to load all the document types, that are used in that
profile. Normally you need the FolderDoctype, AdressDoctype and one to put your data in. For an example
have a look at `mcloud.doctype.ts`

The form fields are defined by using the [ngx-formly](https://formly.dev/guide/getting-started) library.
Besides using standard from fields you can also define your own. Your custom field component must extend
from `FieldType` and has to be declared in `IgeFormlyModule`.

To support autocomplete in [ngx-formly] forms, `id` property must be added

For a correct integration of a field into the form, you need to use the wrappers-field and set it to
`['panel']`. This will use a component (OneColumnWrapperComponent) to place the form field in a defined
order, so that on the left side the label is placed and to the right the configured form field(s).

You can also define frontend validation for each form field. Please check out the library website and the
currently implemented doctypes.

## Backend

In the backend create a new package under `de/ingrid/igeserver/profiles/<profile-name>`. Here all supported
document types are created.
Inside the types-package create for each document type a new class which extends from `EntityType`.
There you can set the ID, in which profiles the document should be available and how internal references are
resolved. Those references can be for example an address, which is referenced by a document. Only the document
itself knows how to handle these references. For this you can override the following functions:

```kotlin
/**
 * Extract referenced documents/addresses and replace them with their ID
 */
fun pullReferences(doc: Document): List<Document>

/**
 * Replace document/address references with their latest version
 */
fun updateReferences(doc: Document, onlyPublished: Boolean)
```

There are also other functions where we can hook into, to react on certain events:

```kotlin
/**
 * Persistence hook called when an instance of this type is created
 */
open fun onCreate(doc: Document) {}

/**
 * Persistence hook called when an instance of this type is updated
 */
open fun onUpdate(doc: Document) {}

/**
 * Persistence hook called when an instance of this type is published
 */
open fun onPublish(doc: Document) {}

/**
 * Persistence hook called when an instance of this type is deleted
 */
open fun onDelete(doc: Document) {}
```

### Profile definition file

Each profile needs a definition file which contains necessary information about the profile. An example can be found below.

<details>
  <summary>Example</summary>

```kotlin
@Service()
@Profile("mcloud")
class MCloudProfile : CatalogProfile {

  override val identifier: String = "mcloud"
  override val title: String = "mCLOUD Katalog"
  override val description: String? = "Dieser Katalog wird für die Erfassung von ..."

  override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {}
  override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {}

  override fun initCatalogCodelists(catalogId: String) {}
  override fun initCatalogQueries(catalogId: String) {}

  override fun getElasticsearchMapping(format: String): String
  override fun getElasticsearchSetting(format: String): String

}
```

</details>

### Export

For the export feature add a service inside the exporter-package which implements `IgeExporter`.
Pebbles template engine is used for easier export. Check out `PortalExporter`.

<details>
  <summary>Example Exporter</summary>

```kotlin
@Service
@Profile("mcloud")
class PortalExporter : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() {
            return ExportTypeInfo(
                    "portal",
                    "mCLOUD Portal",
                    "Export der Daten für die weitere Verwendung im Liferay Portal und Exporter.",
                    MediaType.APPLICATION_JSON_VALUE,
                    "json",
                    listOf("mcloud"))
        }

    override fun run(jsonData: JsonNode): Any {
        val engine = PebbleEngine.Builder()
                .newLineTrimming(false)
                .build()

        val compiledTemplate = engine.getTemplate("templates/export/mcloud/portal.peb")

        val writer: Writer = StringWriter()
        val map = getMapFromObject(jsonData)
        compiledTemplate.evaluate(writer, map)
        return writer.toString().replace("\\s+\n".toRegex(), "\n")
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

    private fun getMapFromObject(json: JsonNode): Map<String, Any> {

        return mapOf("model" to jacksonObjectMapper().convertValue(json, MCloudModel::class.java))

    }
}
```

</details>

<details>
  <summary>Example Template</summary>

```json
{# @pebvariable name="model" type="de.ingrid.igeserver.profiles.mcloud.exporter.model.MCloudModel" #}

{
  "uuid": "{{ model.uuid }}",
  "title": "{{ model.title }}",
  "description": "{{ model.description }}",
  ...
}
```

</details>

### Import

When writing a new importer for a specific document type, we first have to check if the file to be imported is
recognized. Then the model should be used, which already might have been created for an exporter in this profile.
Here are the steps you should follow:

- create a service which implements `IgeImporter`-interface.
- implement `run()`-method
  - return a JsonNode which contains the mapped imported document
- implement `canHandleImportFile()`-method
  - check if this importer can handle the import, by analyzing contentType and file content
- implement `getName()`-method to return the name of the importer

<details>
  <summary>Example</summary>

```kotlin
@Service
@Profile("example")
class ExampleImporter : IgeImporter {

    private val log = logger()

    private val mapperService = MapperService()

    override fun run(data: Any): JsonNode {
        return mapperService.getJsonNode((data as String))
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        val isJson = MediaType.APPLICATION_JSON_VALUE == contentType || MediaType.TEXT_PLAIN_VALUE == contentType
        val hasNecessaryFields = fileContent.contains("\"_id\"") && fileContent.contains("\"_type\"") && fileContent.contains("\"_state\"")
        return isJson && hasNecessaryFields
    }

    override fun getName(): String {
        return "Internes Format"
    }

}
```

</details>

### Indexing

Indexing uses the export functionality of a catalog and can be done in two ways. It can be run for all datasets of a catalog or after a dataset has been published.
When indexing the whole catalog, each dataset is exported to a specified format that shall be sent to an Elasticsearch index.
In the profile definition is the possibility to define the settings and mappings used for the index.

If you want to index a dataset immediately after its publication, you need to implement a filter, which is executed at the specific time.
Here are the steps:

- create a new component for your profile implementing `Filter<PostPublishPayload>`
  - when using elasticsearch for indexing, make sure to enable profile `elasticsearch`
- implement `invoke()`-method

```kotlin
@Component
@Profile("mcloud & elasticsearch")
class MCloudPublishExport : Filter<PostPublishPayload> {
  override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {

  }
}
```

# Add / Update / Remove form field

Open the according document type file under `de/ingrid/igeserver/profiles/<profile-name>` and edit the
`documentFields`-function. Check out the [ngx-formly](https://formly.dev/guide/getting-started) website
how to configure a form field.

Also check out some basics in the section "Create a new profile".

# Add context help for a form field

The context help is stored as mark-down files on the server side. They are located under
`server/src/main/resources/contextHelp/<profile>`. The German translations will be found
in this directory. For other languages a sub-directory needs to be created with the
language-ID, e.g. `en` or `es`.

The structure is as follows:

- **id**: defines the ID of the form field the context help belongs to
- **docType**: a list of document types for which this help will be displayed
- **profile**: for which profile is this help used

The help text itself can be found under the last separator: `---`

Example:

```markdown
---
# ID des GUI Elements
id: announcementDocs
docType:
  - UvpApprovalProcedureDoc
  - UvpLineDeterminationDoc
  - UvpSpatialPlanningProcedureDoc
  - UvpForeignProjectDoc
profile: uvp
---

Auslegungsinformationen hochladen/verlinken ...
```

# Create a new page

- create a new module under app (e.g. AddressModule)
- rename created folder "address" to "+address" to show that it's a page
- create a new component under app/+address (e.g. AddressComponent)
- create a new file "address.routing.ts" with content:

```
export const routing = RouterModule.forChild( [
  {
    path: '',
    component: AddressComponent,
    canActivate: [AuthGuard]
  }
] );
```

- put exported constant inside "import" of the module
- add page to main router (app.router.ts) with configuration

# Add a new toolbar button

- create a new file "<name>.plugin.ts" in a subdirectory of "+forms/dialogs"
- extend class from "Plugin"
- add button with FormToolbarService
- react on event from FormToolbarService using eventId of defined button
- add Plugin to providers in "form-plugin.provider.ts"

# Use a behaviour function for calculations, filtering, ...

When we want to add a configurable behaviour only to specify a different calulation, filtering
or sorting, then it's recommended to provide this in a service, which can be overriden by a
behaviour.

Take care of multiple changes by different behaviours and inform the user!

An example can be seen in tree.service.ts.

# Intercept other functionality and conditionally prevent execution

Use the event-service to send events and wait for the responses of all subscribers.
See the following example:

- if we want to execute code only if all subscribers of an event agree:
  ```
  this.eventService.sendEventAndContinueOnSuccess(IgeEvent.DELETE)
            .subscribe(() => this.showDeleteDialog());
  ```
- a behaviour which want to allow the showing of the delete dialog only if the folder has no children:

  ```
  this.eventService.respondToEvent(IgeEvent.DELETE)
            .subscribe(resultObserver => {
                // do some checks and/or show an alternative dialog

                const responseData = this.buildResponse(success);
                resultObserver(responseData);
            });
  ```

# Migration for a specific version

When there's a need to change the database structure or we need to migrate some data then we can use the
migration tasks.

Go to the package `de/ingrid/igeserver/migrations/tasks` and create a new task with the following name scheme:

`M<version>_<title>.kt`

and implement something like this example for a migration to version 0.17:

```kotlin
@Service
class M017_TestMigration : MigrationBase("0.17") {

    private var log = logger()

    override fun exec(databaseName: String) {
        log.info("Executing migration 0.17")
    }

}
```

# Creating a cron task

If you want to create a task which is executed at a certain time also repeatable, then do the following:

- go to `de/ingrid/igeserver/tasks`
- create a new component annotated class
- add a function with the following annotation
  `@Scheduled(cron = "\${cron.codelist.expression}")`
  where "cron.codelist.expression" should be replaced by a property from the application.properties file.
  An example would look like this

```properties
# scheduler: second, minute, hour, day of month, month, day(s) of week
cron.codelist.expression=0 */30 * * * *
```

# Add a new SVG icon

New Icons added to IGE-NG should be integrated the following way:

- clean SVG file with online tool: https://jakearchibald.github.io/svgomg/
- choose an appropriate symbol catalog in `src/assets/icons`
- add SVG source content from online tool to symbol catalog
- replace svg-tag with symbol-tag
- add classes for easier styling to relevant svg-paths
  - **coloring**: for changing the fill color
  - **coloring-stroke**: for changing the stroke style

For easier editing you can format the file but remember to minimize it afterwards (IntelliJ: Select all + "Join Lines")

# Add a new JSON schema file

For validation of a JSON-document, before it's being saved to the database, you need to create a JSON schema file under
`src/main/resources/<profile>/schemas`.

For schema creation you can use the online generator https://app.quicktype.io/ and insert a JSON presentation of
your document type. The backend entity of your document has to reference this file by overriding the field `jsonSchema`
with the location of the schema file.
