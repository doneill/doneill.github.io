---
title: Multiplatform Persistence with SQLDelight
date: 2020-06-28 18:18:25
tags:
- kotlin
- multiplatform
---

## SQLDelight
[SQLDelight](https://cashapp.github.io/sqldelight/) provides libraries and drivers to generate typesafe Kotlin classes from SQL statements that verifies database schemas, statements, and migrations at compile time.  This post will step through the basics of getting started with SQLDelight for Android and iOS using the [kotlin-mulitplatform-template](https://github.com/doneill/kotlin-multiplatform-template) I referenced in a previous [post](http://gh.jdoneill.com/2019/12/06/kotlin-mulitplatform/), a project that started out as a template for getting your development environment started with Kotlin Multiplatform.

## Dependency setup

First we will get started adding the most basic dependencies, adding the plugin classpath to the project, the common library dependencies, and Android app dependencies. 

```kotlin
buildscript {
    repositories {
        google()
        mavenCentral()
        jcenter()
    }
    dependencies {
        classpath(SqlDelight.GRADLE)
    }
}
```

In your common gradle build file apply the plugin and add platform dependencies.

```kotlin
// apply plugin
plugins {
    ...
    id("com.squareup.sqldelight")
}

// commonMain dependency
implementation("com.squareup.sqldelight:runtime:${Versions.SQLDELIGHT}")

// androidMain dependency
implementation("com.squareup.sqldelight:android-driver:${Versions.SQLDELIGHT}")

// iosMain dependency
implementation("com.squareup.sqldelight:native-driver:${Versions.SQLDELIGHT}")

```

In your Android app gradle build file.

```kotlin
implementation (com.squareup.sqldelight:android-driver:${Versions.SQLDELIGHT})
```

### Databse schema setup

Setup your database schema dependencies.  Generically this looks for a database named `MyDatabase` in `com.example.package` package directory structure.  More on this in the next section.

```kotlin
sqldelight {
    database("MyDatabase") {
        packageName = "com.example.package"
        sourceFolders = listOf("sqldelight")
    }
}
```

And that's it for a very basic setup, check out this [commit](https://github.com/doneill/kotlin-multiplatform-template/commit/ae5974a63a0018a26e8a89040091fb4cafb8af9a) for reference.

## Implementation

SQLDelight generates Kotlin source files which can be used to create and interact with the database.  Create your initial database schema with a `*.sq` file.  This file always represents the latest schema for an empty database.  You need to create the SQL source file in the package defined above in the `commonMain` sourceset, e.g. **common/src/commonMain/sqldelight/com/example/package**.  In this example we will be persisting some weather station data.  

```sql
CREATE TABLE Weather (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    latest_temp REAL NOT NULL DEFAULT 0,
    timestamp TEXT NOT NULL
);

selectAll:
SELECT * FROM Weather;

selectById:
SELECT * FROM Weather WHERE id = ?;

selectByName:
SELECT * FROM Weather WHERE name = ?;

insertWeather:
INSERT OR REPLACE INTO Weather(id, name, latest_temp, timestamp)
VALUES (?,?,?,?);

deleteAll:
DELETE FROM Weather;
```

### Drivers

Implement the platform driver factories to create the database on both Android and iOS platforms.  Include the following inside **common/src/commonMain/kotlin/** source set: 

```kotlin
expect class KmpDriverFactory {
    fun createDriver(): SqlDriver
}

fun createDb(kmpDriverFactory: KmpDriverFactory): KmpDb {
    val driver = kmpDriverFactory.createDriver()

    return KmpDb(driver)
}
```

Implement the Android `actual` in **common/src/AndroidMain/kotlin**:

```kotlin
actual class KmpDriverFactory(private val appContext: Context) {
    actual fun createDriver(): SqlDriver {
        return AndroidSqliteDriver(KmpDb.Schema, appContext, "kmp.db")
    }
}
```

Implement the iOS `actual` in **common/src/iosMain/kotlin**:

```kotlin
actual class KmpDriverFactory {
    actual fun createDriver(): SqlDriver {
        return NativeSqliteDriver(KmpDb.Schema, "kmp.db")
    }
}
```

### Client access

In order to show interacting with the SQLite database we add code in `MainActivity`, which is not where this would typically go but it validates the process.  The `insertWeather` and `selectAll` methods are generated for us.

```kotlin
val driver = KmpDriverFactory(this)
val db = createDb(driver)
val kmpQuery = db.kmpModelQueries

kmpQuery.insertWeather(id, name, temp.toDouble(), getDate())
val results = kmpQuery.selectAll().executeAsList()

for (result in results) {
    // do something with result
}
```

Swift code for iOS can be used to call Kotlin `KmpDriverFactory()` and `createDb` to create the database and validate the process on iOS.


```Swift
let driver = KmpDriverFactory()
let db = KmpDriverFactoryKt.createDb(kmpDriverFactory: driver)
let kmpQuery = db.kmpModelQueries

kmpQuery.insertWeather(id: KotlinLong(value: id), name: name, latest_temp: Double(temp), timestamp: DateUtilsKt.getDate())
let results = kmpQuery.selectAll().executeAsList()

for result in results {
    // do something with result
}
```

And that's it for a very basic implementation, check out this [commit](https://github.com/doneill/kotlin-multiplatform-template/commit/0e8e69e6c486379811e7affd06986ab2ac7c98c6) for reference.

## Resources

SQLDelight IntelliJ PLugin is available from within Android Studio by navigating to **Preferences > Plugins > Marketplace > Search for SQLDelight**

- [Introduction to Multiplatform Persistence with SQLDelight](https://johnoreilly.dev/posts/sqldelight-multiplatform/)
- [SQLDelight 1.x Quick Start Guide for Android](https://handstandsam.com/2019/08/23/sqldelight-1-x-quick-start-guide-for-android/)
- [A Multiplatform Delight](https://www.youtube.com/watch?v=WkIry790PHI)

