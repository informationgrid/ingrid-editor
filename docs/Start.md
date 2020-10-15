# IGE-NG Software Documentation

## Introduction

## Architecture

### Spring Boot

#### Profiles

Several profiles can be activated via Spring. With each activated profile a separate configuration file can be used,
which has the format `application-<profile>.properties` The following list explains each profile:

|Profile|Description|
|---|---|
|dev|Contains configuration used during development for correct setup. It also disables Keycloak.|
|elasticsearch|Activate export to Elasticsearch during publishing and indexing|
|mcloud|Activates importer, exporter and datatypes for the mCLOUD-Profile|

#### Dependency Injection

### Model View Controller

#### REST API / Swagger

http://localhost:8550/v3/api-docs

#### Controller / Services

Services are annotated with `@Service` or `@Component` which makes them available to spring's dependency injection. Instances are singletons by default. A class that requires a service will typically access it through an `@Autowired` member variable.

#### Persistency

The persistence layer of IGE Server consists of the following main **interfaces** (located in the `de.ingrid.igeserver.persistence` package and it's sub-packages):

- `DBApi` defines the **main entry point** to persistency. It provides access to the specific persistency implementation used in the application (e.g. `de.ingrid.igeserver.persistence.orientdb.OrientDBDatabase` for [OrientDB](https://www.orientdb.org/) databases). The methods defined in this interface use generic `JsonNode` instances to **transfer data** between database and application.
- `EntityType` is the base interface for all **persistent types**. This could be general domain specific types like `AddressType`, profile specific types like `MCloudType`  or meta types like `UserInfoType` that are used internally only. Services will use these interfaces to specify the type of data send or expected in the `JsonNode` instances transferred at the `DBApi` interface. The interface also defines methods for **entity type initialization** (like creating the database schema) and callbacks for **entity lifecycle events** (like creation or deletion). Each persistency implementation will provide it's own implementations for these methods if required (e.g. the entity type classes for OrientDB reside in the `de.ingrid.igeserver.persistence.orientdb.model` package).

### Extensions

Extensions are used to extend or alter the functionality of IGE Server without changing the core code. For more information about the concept and implementation see the [Extensions Documentation](./Extensions.md).

IGE Server defines the following extension points:

#### Persistency

- `Pipe<PrePersistencePayload>` called **before** any of the persistence operations **create**, **update**, **publish**, **delete**
- `Pipe<PostPersistencePayload>` called **after** any of the persistence operations **create**, **update**, **publish**, **delete**
- `Pipe<PreCreatePayload>` called **before** the persistence operation **create**
- `Pipe<PostCreatePayload>` called **after** the persistence operation **create**
- `Pipe<PreUpdatePayload>` called **before** the persistence operation **update**
- `Pipe<PostUpdatePayload>` called **after** the persistence operation **update**
- `Pipe<PrePublishPayload>` called **before** the persistence operation **publish**
- `Pipe<PostPublishPayload>` called **after** the persistence operation **publish**
- `Pipe<PreDeletePayload>` called **before** the persistence operation **delete**
- `Pipe<PostDeletePayload>` called **after** the persistence operation **delete**

<details>
  <summary>Beispiel</summary>

```kotlin
@Component
class DefaultUpdateValidator : Filter<PreUpdatePayload> {
  override val profiles: Array<String>?
    get() = arrayOf<String>()

  @Autowired
  private lateinit var dbService: DBApi

  override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
    val docId = payload.document[FIELD_ID].asText();

    context.addMessage(Message(this, "Validate document data '$docId' before update"))

    // do checks

    return payload
  }
}
```
</details>

### Error Handling

IGE Server defines the following **exception hierarchy**:

- `IgeException` is the base class for all exceptions that could visible to REST API clients. It contains the following properties:

  - `statusCode` The HTTP status code send to the client.
  - `errorId` The unique identifier of the exception for getting detail information from the log files.
  - `errorCode` A custom error code written in uppercase letters with the underscore character as word separator (e.g. `ALREADY_EXISTS`), that allows clients to identify the error cause.
  - `errorText` A custom error text that could presented to the user. Variables of the form `${variable}` will be replaced by the value of
    the appropriate key if present in data.
  - `data` An optional key-value map used to customize the error text.
  - `stackTrace` The stack trace of the exception (only if it was an unexpected exception).

  The `statusCode` value will be used as the HTTP response code, while `errorId`, `errorCode`, `errorText`, `data` and `stackTrace` will be send as JSON encoded string inside the response body.

  The following example shows how a validation error response could look like:

  ```json
  {
      "errorId":"d6c386c7-5c5e-4886-aac3-d8a9ddedf625",
      "errorCode":"VALIDATION_ERROR",
      "errorText":"One or more fields are invalid: title, description.",
      "data":{
          "fields":[
              {
                  "name":"title",
                  "errorCode":"REQUIRED"
              },
              {
                  "name":"description",
                  "errorCode":"STRING_LENGTH",
                  "data":{
                      "min":50,
                      "max":250
                  }
              }
          ]
      }
  }
  ```

- `ServerException` is the base class for all exceptions that occur while processing a valid request to the REST API. 

  - Server exceptions have the `statusCode` value **500** if not set to more specific value of **5XX** in sub classes.
  - Server exceptions will be logged with **log level ERROR**.

- `ClientException` is the base class for exceptions that are caused by invalid request to the REST API. 

  - Client exceptions have the `statusCode` value to **400** if not set to more specific value of **4XX** in sub classes.
  - Client exceptions will be logged with **log level DEBUG**.

- All other exceptions are sub classes of either `ServerException` or `ClientException`.

All exceptions pass through `de.ingrid.igeserver.RestResponseEntityExceptionHandler` which ensures logging and the response body as described above.

The following **guidelines** should be kept in mind when handling errors:

- Exceptions should not be swallowed.
- Only logging an exception is not a good practice, since it requires monitoring of the log files to discover them. It's better to let it pass to the client to signal that something went wrong.
- Logging and rethrowing an exception is not necessary, since *all* exceptions are logged by the global exception handler (see above).
- Exceptions should not be handled unless it's possible to handle them in a meaningful way at that point or it's necessary to add meaningful information.
- Exceptions should be thrown instead of using `ResponseEntity.status(HttpStatus.XXX).build()` or `HttpServletResponse.sendError(HttpServletResponse.XXX, msg)`, because this will ensure the response body as described above.
- Whenever possible, information should be added to the exception that helps to analyze the cause (e.g. which record was failed to update).

### Logging

IGE Server uses the [Log4j Framework](https://logging.apache.org/log4j/2.x/) with the Log4j Kotlin API. The configuration is defined in the `log4j2.xml` file.

A class typically creates it's own **logger instance** using the following code

```kotlin
private val log = logger()
```

#### Audit Log

An audit log is written for the **documentation of changes** in the application data or to **record specific interactions** with the system. It consists of special records that answer the question *what* was done *when* and by *whom*.

The `de.ingrid.igeserver.services.AuditLogger` component is used to create audit log records with it's `log()` method. It uses Log4j loggers that can be configured to log to different destinations. The default logger's name is `audit`.

An **audit log record** consists of the following information:

- A *Category* used to group records for filtering (e.g. *data-history*)
- An *Action* specifying the kind of changes applied to the resource (e.g. *delete*)
- An *Actor* executing the action (the value is usually retrieved automatically from `UserService.getCurrentPrincipal()`)
- The *Time* when the action took place (the value is usually retrieved automatically from `DateService.now()`)
- The *Target* of the action (e.g. the unique identifier of the data to which the changes were applied)
- The *Data* defining the changes that were applied

A typical audit log record looks like the following:

```json
{
    "cat":"data-history",
    "action":"delete",
    "actor":"user1",
    "time":"2020-09-07T16:02:11.618768300+02:00",
    "target":"dcf47072-d331-4a4c-bac1-3af64e9c1ea8",
    "data":{
        "_hasChildren":false,"_parent":null,"@rid":"#47:18","@class":"Document",
        "_created":"2020-08-25T14:29:40.797511700+02:00","@version":1,"_type":"UvpDoc",
        "_id":"dcf47072-d331-4a4c-bac1-3af64e9c1ea8","title":"Test",
        "_modified":"2020-08-25T14:29:40.797511700+02:00"
    }
}
```

If we need to **access the audit log** in the application, the audit log must be stored in the **database**. This is achieved using the following **configuration**:

- Definition of the database and database table in `application.properties`:

  ```properties
  audit.log.database=AuditLog
  audit.log.table=Record
  ```

- Configuration of a Log4j appender that writes to that database and database table (in this case an instance of `OrientDBAppender`):

  ```xml
  <OrientDBAppender name="AuditLogDB" database="${spring:audit.log.database}" table="${spring:audit.log.table}" />
  ```

- Configuration of the default Log4j logger used by `AuditLogger` to use this appender:

  ```xml
  <!-- audit logger -->
  <Logger name="audit" level="info" additivity="false">
    <AppenderRef ref="AuditLogDB" />
  </Logger>
  ```

`AuditLogger` will then be able to connect to the database and retrieve records using it's `find()` method.

#### @AuditLog annotation

A convenient way to create an audit log record each time a method is called is to use the `@AuditLog` annotation. It creates a record with the following values:

- *Category*: The value of the `category` parameter defined in the annotation (default: *empty string*)
- *Action*: The value of the `action` parameter defined in the annotation (default: class name with the name of the annotated method appended)
- *Target*: The value of the method parameter specified in the `target` parameter, e.g. if target is `id`, the value of the `id` method parameter will become the value of *Target* (default: *empty string*)
- *Data* The value of the method parameter specified in the `data` parameter, e.g. if target is `document`, the value of the `document` method parameter will become the value of *Data* (default: parameter names and values of the annotated method call in JSON notation)

*Actor* and *Time* are defined as usual.

NOTE: The audit log record is created **after** the method is executed which means that only *successful* method executions are recorded.

Using the annotation **without any parameters**

```kotlin
@AuditLog
fun updateDocument(id: String, data: JsonNode, publish: Boolean = false) {
  ...
}
```

will result in records of the following form:

```json
{
    "cat":"",
    "action":"de.ingrid.igeserver.services.DocumentService.updateDocument",
    "actor":"user1",
    "time":"2020-09-14T17:10:06.145049500+02:00",
    "target":"",
    "data":{
        "data":"{\"title\":\"Test\",\"_id\":\"bd485713-0aba-4140-88cb-dd37675d5973\",\"_parent\":null,\"_type\":\"UvpDoc\",\"_created\":\"2020-09-14T17:04:48.733668500+02:00\",\"_version\":1,\"description\":\"Beschreibung\",\"_modified\":\"2020-09-14T17:10:06.101057900+02:00\"}",
        "publish":"false","id":"bd485713-0aba-4140-88cb-dd37675d5973"
    }
}
```

The following example will create a record similar to the **default data history log** (see below):

```kotlin
@AuditLog(category="data-history", action="update", target="id", data="data", logger="audit.data-history")
fun updateDocument(id: String, data: JsonNode, publish: Boolean = false) {
  ...
}
```

#### Data history log

A special category of audit log records are data history records. They are used to document changes made to the application data. The data history log is realized in the following way:

- The `de.ingrid.igeserver.persistence.filter.DataHistoryLogger` class that is implemented as an extension (`Filter`) of the `Pipe<PostPersistencePayload>` extension point and therefor invoked after each persistence operation
- This class uses the following parameters when creating an audit log record:
  - *Category*: Value of `audit.log.data-history-category` defined in `application.properties` (default: *data-history*)
  - *Logger*: Value of `audit.log.data-history-logger` defined in `application.properties` (default: *audit.data-history*)

This means that data history records can be retrieved by filtering audit log records by a category value of *data-history*. Since the logger name *audit.data-history* is a descendent of the default audit log logger, it uses the same configuration by default (especially the same appender), but could be configured in a different way as well. The produced records look like the example mentioned in the audit log section.

### Profiles

A profile generally is created for every customer, who needs special requirements for entering and handling documents.
An example of how to add a new profile can be found in FAQ.md.

#### Document types

A profile can contain one or more document/entity types. Each document type contains of a definition of fields for the form
in the frontend and a definition in the backend. The definition should contain information about how to resolve references
to other addresses/documents. 

Moreover each type can control its publication and do some validations by overriding the `onPublish`-function

The form fields are defined in a JSON format and will be used by the [ngx-formly](https://formly.dev/) library.
It's also possible to add most of the validation logic within that definition. See also FAQ.md

#### Importer

An importer is used to import a file of a defined format. Multiple importer can be written, which can be chosen during
the import process, if several importer can handle the input format.

![data model](images/Importer.svg)

An importer is a service which implements the interface `IgeImporter`. With the profile annotation you can define, that
the importer is only initialized when a specified profile is active.

The function `canHandleImportFile` is needed to check, if the given file can be imported by this importer. With the given
content and its content-type we should be able to determine if the importer is suitable. If multiple importer say that 
they can handle the input file, then the user is presented a choice dialog, to select the correct importer.  

After an importer is run, we expect to receive a JsonNode object, which is filled with data coming from the imported file.
The object should represent the JSON format, in which the document is stored in the database.

#### Exporter

An exporter is used to transform the data of a document into another format. Multiple exporter can be written, which can
be chosen during the export process in the frontend.

![data model](images/Exporter.svg)

A profile can offer multiple export formats. You need to create a new service, which should only be active if the profile
is. This service must implement the interface `IgeExporter` and return a typeInfo with a description of the exporter. This
is also used in the frontend, to choose from a collection of exporters.

It's recommended to use the [Pebble template engine](https://pebbletemplates.io/) for creating the exported document. 
In combination with a model-class, the template can be easily filled with all the information. When the model-class 
implements one of the provided interfaces, e.g. `DCAT` then the same template can be even used for multiple document types.

## Database

The database-system is [OrientDB](https://www.orientdb.org/), which is a NoSQL database which supports transaction.
It's used as an embedded database, so that there's no need to install or configure another database. Since OrientDB 
supports transactions, it's possible to execute big tasks on the database, with the possibility to rollback to the state
before the task.

### Data model

Each catalog is a separate database. Another database `IgeUsers` is used to manage users and their permissions to access
a catalog.

The data model is shown here:

![data model](images/DocumentWrapper.svg)

A `DocumentWrapper` manages different versions of a document. A document is normally stored in the draft-field. When it's
being published it's removed from the draft-field and put into the published-field. In case another document version has
been in the published-field, it's moved to the archive-field, which can contain a number of documents.

A `Document` can be any kind of data, which has at least a title, the document type and the creation and modification date.
Since it's a NoSQL database, the document can be extended without any schema changes and migrations. By just defining a
new field, it's automatically stored in the document table.

The `Info` contains information about the catalog itself. It can also store settings, like a time pattern for indexing.

The `Behaviours` store the state of a behaviour, which can be changed in the catalog settings of the IGE-NG. A behaviour
can be active or inactive. It can also contain optional parameters for easier configuration and more flexibility.

### Migrations

When a migration is necessary, it has to be executed for every catalog. Tools like [Flyway](https://flywaydb.org/) won't help much, since we 
would need to know, which catalogs/databases exist. Therefore a migration works like this:

* create a new service which extends `MigrationBase`
* set new version in `MigrationBase`-constructor
* implement `exec()`-function to run migration for each database

<details>
  <summary>Example</summary>

```kotlin
@Service
class M017_TestMigration : MigrationBase("0.17") {

    private var log = logger()

    override fun exec(databaseName: String) {
        log.info("Executing migration 0.17")
    }

}
```
</details>

## Configuration

## Testing

## Deployment
