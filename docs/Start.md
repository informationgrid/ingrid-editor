# IGE-NG Software Documentation

## Introduction

## Architecture

### Spring Boot

#### Profiles

#### Dependency Injection

### Model View Controller

#### REST API / Swagger

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

### Error Handling

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

#### Data history log

A special category of audit log records are data history records. They are used to document changes made to the application data. The data history log is realized in the following way:

- The `de.ingrid.igeserver.persistence.filter.DataHistoryLogger` class that is implemented as an extension (`Filter`) of the `Pipe<PostPersistencePayload>` extension point and therefor invoked after each persistence operation
- This class uses the following parameters when creating an audit log record:
  - *Category*: Value of `audit.log.data-history-category` defined in `application.properties` (default: *data-history*)
  - *Logger*: Value of `audit.log.data-history-logger` defined in `application.properties` (default: *audit.data-history*)

This means that data history records can be retrieved by filtering audit log records by a category value of *data-history*. Since the logger name *audit.data-history* is a descendent of the default audit log logger, it uses the same configuration by default (especially the same appender), but could be configured in a different way as well.

## Data model

### Migrations

## Configuration

## Testing

## Deployment





