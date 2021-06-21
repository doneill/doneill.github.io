---
title: Kotlin CLI
date: 2021-06-19 18:18:25
tags:
- kotlin
- clikt
- coroutines
---

Automating things via command line tools is awesome and after doing some experimenting with Kotlin as a modern programming language for cli applications and inspired by the [kotlin cli starter repo](https://github.com/jmfayard/kotlin-cli-starter) I wanted to break down creating the cli application from scratch using [CLIKT](https://ajalt.github.io/clikt/) and [Coroutines](https://kotlinlang.org/docs/coroutines-overview.html).

## Create a single module Gradle project
Create a project folder and skaffold it a Gradle application project:

```bash
# create your poject directory
$ mkdir demo

# initialize it with Gradle project structure
$ cd demo && gradle init
```

Choose the following project settings when prompted:

```bash
# select 2 application project
Select type of project to generate:
  1: basic
  2: application
  3: library
  4: Gradle plugin
Enter selection (default: basic) [1..4] 2

# Kotlin implementation language
Select implementation language:
  1: C++
  2: Groovy
  3: Java
  4: Kotlin
  5: Scala
  6: Swift
Enter selection (default: Java) [1..6] 4

# simple on application project
Split functionality across multiple subprojects?:
  1: no - only one application project
  2: yes - application and library projects
Enter selection (default: no - only one application project) [1..2] 1

# kotlin dsl
Select build script DSL:
  1: Groovy
  2: Kotlin
Enter selection (default: Kotlin) [1..2] 2
```

Now we have an empty application project. Let's clean it up a bit.  The application structure created a single module project, we can remove the module and use the root projct as the module source:

```bash
# move the build script to root project
$ mv app/build.gradle.kts build.gradle.kts
# remove app module, use project root as module source
$ mv app/src src && rm -rf app
```

Open `settings.gradle.kts` and remove the module reference `include("app")`. Your app directory structure should look simiilar to the following:

<p align="rigth">
    <img align="left" width="300" height="244" src="app-structure.png">
</p>

## Dependencies
A common way to manage gradle dependencies is to have an `ext{}` block in your root project.  This doesn't provide any code completion or code navigation, in order to suppport those features we will define dependencies as String constants in `Dependencies.kt` inside of `buildSrc` folder.  The directory `buildSrc` is treated as an included build where Gradle automatically compiles its sources.

```bash
# make a buildSrc directory and source package structure
$ mkdir -p buildSrc/{src/{main/{kotlin,},},}
# create Dependencies.kt
$ touch buildSrc/src/main/kotlin/Dependencies.kt
```

Now we need to create a build script for our Dependencies

```bash
$ touch buildSrc/build.gradle.kts
```

Open the new `build.gradle.kts` file and add the following:

```kotlin
plugins {
    `kotlin-dsl`
}

repositories {
    mavenCentral()
}
```

### Asynchronous Command Line Iterface for Kotlin
We will use `CLIKT` multiplatform library which makes writing cli apps easy and `Coroutines` for an asynchronous, or non-blocking, application. Open `buildSrc/src/main/kotlin/Dependencies.kt` file to add the following dependencies and versions:

```kotlin
object Versions {
    const val CLIKT = "3.2.0"
    const val COROUTINES = "1.5.0"
    const val JVM = "1.8"
    const val KOTLIN = "1.4.32"
}

object Clikt {
    const val CLIKT = "com.github.ajalt.clikt:clikt:${Versions.CLIKT}"
}

object Coroutines {
    const val CORE = "org.jetbrains.kotlinx:kotlinx-coroutines-core:${Versions.COROUTINES}"
}
```

Now we can access these in our applications build script.  Open the root `build.gradle.kts` file to add the dependencies and do some version updates:

```kotlin
// add to the dependencies block
dependencies {
    // clikt
    implementation(Clikt.CLIKT)
    // coroutines
    implementation(Coroutines.CORE)
}
```

Optionally, we can update our kotlin version

```kotlin
// update plugins block
plugins {
    application
    kotlin("jvm") version Versions.KOTLIN
}
```

Once you start using `buildSrc` for dependencies you can update many more build script definitions.

## Demo CLI App
Now that our project structure is complete we can start build our cli application.  We will reate a `cli` package for our source code and create the following classes/objects:

- Main.kt: Our application entry
- Demo.kt: Our suspendable computation
- DemoConfig.kt: Our applications configurations
- DemoCommand.kt: Our applications teminal commands

```bash
# create package directory
$ mkdir src/main/kotlin/cli && touch src/main/kotlin/cli/Main.kt src/main/kotlin/cli/Demo.kt src/main/kotlin/cli/DemoConfig.kt src/main/kotlin/cli/DemoCommand.kt
```

The `DemoConfig.kt` is a utility to house some globals, for now we will use to to reference our app command name. Open `DemoConfig.kt` to and add the following:

```kotlin
package cli

object FulcrumConfig {
    val COMMAND_NAME = "demo"
}
```

The `DemoCommand.kt` is a subclass of [CliktCommand](https://ajalt.github.io/clikt/api/clikt/com.github.ajalt.clikt.core/-clikt-command/).  We will set it up with our help page and support for verbose output.

```kotlin
class DemoCommand: CliktCommand(
    help = """
       Demo API CLI.
    """.trimIndent(),
    epilog = """
        Try it with a demo type

        Examples:
            ${COMMAND_NAME} hello
    """.trimIndent(),
    name = COMMAND_NAME
) {
    init {
        completionOption()
    }

    val help: Boolean by option("-h", "--help", help = "Display this help screen").flag()
    val verbose by option("-v", "--verbose", help = "verbose").flag(defaultForHelp = "disabled")

    override fun run() {
        if (verbose) println(this)
    }
}
```

The `Demo.kt` will have our asynchronous methods to do work, to start we look `help` in the `args` passed to the application.

```kotlin
package cli

suspend fun runDemo(args: Array<String>) {
    val command = DemoCommand()

    command.main(args)

    if (command.help) {
        println(command.getFormattedHelp())
        return
    }
}
```

The `Main.kt` will be our application entry point.  We will run the app in a new coroutine that blocks the current thread until its completion.  `runBlocking` is designed to bridge blocking code to suspending `runDemo` function.

```kotlin
package cli

import kotlinx.coroutines.runBlocking

fun main(args: Array<String>) {
    runBlocking { runDemo(args) }
}
```

With our source code ready we need to define our applications entry point.  We can do this by defining our application entry class.  Following our `buildSrc` pattern we can create a new class to source our application configuration:

```bash
# create Coordinates.kt in buildSrc
$ touch buildSrc/src/main/kotlin/Coordinates.kt
```

Open the newly created `Coordinates.kt` file and add some application configruateions:

```kotlin
object AppCoordinates {
    const val APP_ID = "cli.MainKt"

    const val APP_VERSION_NAME = "0.0.1"
    const val APP_VERSION_CODE = 1
}
```

Now we can reference the `APP_ID` as the main class for our application in the root `build.gradle.kts` build script, open it and add the following:

```kotlin
application {
    mainClass.set(AppCoordinates.APP_ID)
}
```

## Run the app
At this point the application can be assembled and distributed.

```bash
# build the app
$ ./gradlew assemble
# build a distribution
$ ./gradlew installDist
```

This will generate an executable in `build/install/demo/bin/demo`.  We can create a run script at the root of the project to expedite and run the application from project root.

```bash
# create a run script
$ touch demo && chmod 755 demo
```

Open `demo` and add the following:

```bash
#!/usr/bin/env bash

./gradlew --quiet "installDist" && "build/install/demo/bin/demo" "$@"
```

Now we can run `./demo --help` to see our help page defined in `DemoCommand.kt`

```bash
Usage: demo [OPTIONS]

  Demo API CLI.

Options:
  --generate-completion [bash|zsh|fish]
  -h, --help                       Display this help screen
  -v, --verbose                    verbose

Try it with a demo type

Examples: fulcrum hello
```

And with that we have successfully skaffold a Kotlin cli application using `Clikt` and `Coroutines`, happy coding!