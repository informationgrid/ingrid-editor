package de.ingrid.igeserver.catalogTransfer

import de.ingrid.igeserver.exports.catalog.CatalogTransferService.ExportedCatalog
import de.ingrid.igeserver.model.User
import kotlinx.datetime.Instant

val catalogInfo =
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "identifier" to "test_catalog",
        "type" to "testType",
        "name" to "Test Catalog",
        "description" to "A test catalog",
        "created" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "modified" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "settings" to "{\"config\": {\"partner\": null, \"provider\": null, \"elasticsearchAlias\": \"ingrid_cat\"}, \"indexCronPattern\": null}",
    )

val behaviours = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "catalog_id" to 1,
        "name" to "Behaviour 1",
        "active" to true,
        "data" to "{}",
    ),
    mutableMapOf<String?, Any?>(
        "id" to 2,
        "catalog_id" to 1,
        "name" to "Behaviour 2",
        "active" to false,
        "data" to "{}",
    ),
)
val codelists = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "identifier" to "identifier1",
        "catalog_id" to 1,
        "name" to "name 1",
        "description" to "Description of codelist 1",
        "data" to "[{\"id\": \"entry_identifier1_1\", \"localisations\": {\"de\": \"entry1_1\"}}]",
        "default_entry" to "entry_identifier1_1",
    ),
    mutableMapOf<String?, Any?>(
        "id" to 2,
        "identifier" to "identifier2",
        "catalog_id" to 1,
        "name" to "name 2",
        "description" to "Description of codelist 2",
        "data" to "[{\"id\": \"entry_identifier2_1\", \"localisations\": {\"de\": \"entry2_1\"}}]",
        "default_entry" to null,
    ),
)
val userInfo = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "user_id" to "testUser",
        "cur_catalog_id" to 1,
        "data" to "{}",
        "role_id" to 1,
    ),
    mutableMapOf<String?, Any?>(
        "id" to 2,
        "user_id" to "testUser2",
        "cur_catalog_id" to 2,
        "data" to "{}",
        "role_id" to 2,
    ),
    mutableMapOf<String?, Any?>(
        "id" to 3,
        "user_id" to "testUser3",
        "cur_catalog_id" to null,
        "data" to "{}",
        "role_id" to 3,
    ),
)

val queries = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "catalog_id" to 1,
        "user_id" to 1,
        "category" to "facet",
        "name" to "Query 1",
        "description" to "Description of query 1",
        "data" to "{}",
        "modified" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "global" to true,
    ),
    mutableMapOf<String?, Any?>(
        "id" to 2,
        "catalog_id" to 1,
        "user_id" to 2,
        "category" to "facet",
        "name" to "Query 2",
        "description" to "Description of query 2",
        "data" to "{}",
        "modified" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "global" to true,
    ),
)

val documentWrapper = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "catalog_id" to 1,
        "parent_id" to null,
        "uuid" to "uuid1",
        "type" to "FOLDER",
        "category" to "data",
        "version" to 1,
        "path" to emptyList<Int>(),
        "deleted" to 0,
        "pending_date" to null,
        "fingerprint" to null,
        "tags" to null,
        "responsible_user" to null,
        "expiry_state" to 0,
        "last_expiry_time" to null,
    ),
    mutableMapOf<String?, Any?>(
        "id" to 2,
        "catalog_id" to 1,
        "parent_id" to 1,
        "uuid" to "uuid2",
        "type" to "testDocType",
        "category" to "data",
        "version" to 1,
        "path" to listOf(1),
        "deleted" to 0,
        "pending_date" to null,
        "fingerprint" to null,
        "tags" to null,
        "responsible_user" to 1,
        "expiry_state" to 0,
        "last_expiry_time" to null,
    ),
)

val document = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "catalog_id" to 1,
        "uuid" to "uuid1",
        "type" to "FOLDER",
        "title" to "Ordner1",
        "data" to "{\"_parent\": null, \"_hasChildren\": false}",
        "version" to 1,
        "created" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "modified" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "createdby" to "Nutzer1",
        "modifiedby" to "Nutzer1",
        "createdbyuser" to 1,
        "modifiedbyuser" to 1,
        "is_latest" to true,
        "state" to "PUBLISHED",
        "contentmodified" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "contentmodifiedby" to "Nutzer1",
    ),
    mutableMapOf<String?, Any?>(
        "id" to 2,
        "catalog_id" to 1,
        "uuid" to "uuid2",
        "type" to "FOLDER",
        "title" to "Satz1",
        "data" to "{\"_parent\": null, \"_hasChildren\": false}",
        "version" to 1,
        "created" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "modified" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "createdby" to "Nutzer1",
        "modifiedby" to "Nutzer1",
        "createdbyuser" to 1,
        "modifiedbyuser" to 1,
        "is_latest" to true,
        "state" to "PUBLISHED",
        "contentmodified" to Instant.parse("2024-11-28T12:00:00+01:00"),
        "contentmodifiedby" to "Nutzer1",
    ),
)

val permissionGroup = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "catalog_id" to 1,
        "name" to "Permission Group 1",
        "description" to "Description of permission group 1",
        "data" to "{}",
        "manager_id" to 1,
    ),
    mutableMapOf<String?, Any?>(
        "id" to 2,
        "catalog_id" to 1,
        "name" to "Permission Group 2",
        "description" to "Description of permission group 2",
        "data" to "{\"addresses\": [], \"documents\": [{\"id\": \"1\", \"title\": \"TestFolderInGroup\", \"isFolder\": true, \"permission\": \"writeTree\", \"hasWritePermission\": true, \"hasOnlySubtreeWritePermission\": false}], \"rootPermission\": null}",
        "manager_id" to null,
    ),
)

val userGroup = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "user_info_id" to 1,
        "group_id" to 1,
    ),
    mutableMapOf<String?, Any?>(
        "id" to 2,
        "user_info_id" to 2,
        "group_id" to 2,
    ),
)

val insertedUser = listOf(
    mutableMapOf<String?, Any?>(
        "id" to 1,
        "user_id" to "ige-super-admin",
    ),
)

val versionInfo = listOf(
    mutableMapOf<String?, Any?>(
        "value" to DB_VERSION,
    ),
)

val createdCatalogAnswer = listOf(
    mutableMapOf<String?, Any?>(
        "id" to CREATED_CATALOG_ID,
    ),
)

val users = listOf<User>(
    User(
        login = "testUser1",
        firstName = "firstName",
        lastName = "lastName",
        email = "email",
        phoneNumber = "phoneNumber",
        organisation = "organisation",
        department = "department",
        latestLogin = null,
        fromLdap = false,
    ),
    User(
        login = "testUser2",
        firstName = "firstName",
        lastName = "lastName",
        email = "email",
        phoneNumber = "phoneNumber",
        organisation = "organisation",
        department = "department",
        latestLogin = null,
        fromLdap = false,
    ),
    User(
        login = "testUser3",
        firstName = "firstName",
        lastName = "lastName",
        email = "email",
        phoneNumber = "phoneNumber",
        organisation = "organisation",
        department = "department",
        latestLogin = null,
        fromLdap = false,
    ),
)

private const val DB_VERSION = "0.XX"

val expectedExportedCatalog = ExportedCatalog(
    DB_VERSION,
    catalogInfo,
    behaviours,
    codelists,
    userInfo,
    queries,
    documentWrapper,
    document,
    permissionGroup,
    userGroup,
    users,
)
