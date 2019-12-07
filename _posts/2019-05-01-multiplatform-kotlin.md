---
layout: post
title: "Multiplatform Kotlin"
last_update: 2019-06-12
permalink: /kotlin-multiplatform/
categories: kotlin
---

# Update
Kotlin hands on has an excellent [starter exercise](https://play.kotlinlang.org/hands-on/Targeting%20iOS%20and%20Android%20with%20Kotlin%20Multiplatform/01_Introduction) to get started.  I updated my notes here with the most recent updates.

Multiplatform projects is a feature in Kotlin that allows for sharing Kotlin code between iOS and Android. Android leverages the Kotlin/JVM and iOS uses Kotlin/Native which allows iOS apps to call Kotlin from Swift.  This post will step us through getting an environment setup for Android and iOS development.  A completed template project is available on [GitHub](https://github.com/doneill/kt-mulitplatform).

## Local Environment
- [Android Studio](https://developer.android.com/studio)
- Kotlin plugin 1.3.50 or higher should be installed in the IDE. 
- [Xcode](https://developer.apple.com/xcode/) 

## Create an Android Project
Create an empty activity project within Android Studio with **File > New > New Project** from the toolbar.  Ensure that **Kotlin** is the selected language or ensure Kotlin support is checked (depending on version of Android Studio).

Kotlin native requires a recent version of Gradle, ensure that the **gradle/wrapper/gradle-wrapper.properties** file is grabbing 5.5.1 or higher with the following **distributionUrl**: 

```
distributionUrl=https\://services.gradle.org/distributions/gradle-5.5.1-all.zip
```

You should be able to compile and run your new Android app.  

## Create an Shared Java Library module
Create a new module with **File > New > New Module** from the toolbar, then select **Java Library**.  We will assume the library name is **lib**, but you can name it anything you want.  

### Setup folder structure for shared Java lib
Create the following subdirectories under your new **lib** module: 

- androidMain
- commonMain
- iosMain

With a corresponding **kotlin** folder underneath, resembling the structure below:

```
-- lib
  -- src
    -- androidMain
        -- kotlin
    -- commonMain
        -- kotlin
    -- iosMain
        -- kotlin
```

### Update shared lib build script
We will need to update the lib module build script to be a kotlin multiplatform lib.  Rename the **lib/build.gradle** file to **lib/build.gradle.kts**, then remove all the contents, and replace with the following code: 

```kotlin
import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

plugins {
    kotlin("multiplatform")
}

kotlin {
    //select iOS target platform depending on the Xcode environment variables
    val iOSTarget: (String, KotlinNativeTarget.() -> Unit) -> KotlinNativeTarget =
    if (System.getenv("SDK_NAME")?.startsWith("iphoneos") == true)
    ::iosArm64
    else
    ::iosX64

    iOSTarget("ios") {
        binaries {
            framework {
                baseName = "SharedCode"
            }
        }
    }

    jvm("android")

    sourceSets["commonMain"].dependencies {
        implementation("org.jetbrains.kotlin:kotlin-stdlib-common")
    }

    sourceSets["androidMain"].dependencies {
        implementation("org.jetbrains.kotlin:kotlin-stdlib")
    }
}

val packForXcode by tasks.creating(Sync::class) {
    val targetDir = File(buildDir, "xcode-frameworks")

    /// selecting the right configuration for the iOS
    /// framework depending on the environment
    /// variables set by Xcode build
    val mode = System.getenv("CONFIGURATION") ?: "DEBUG"
    val framework = kotlin.targets
            .getByName<KotlinNativeTarget>("ios")
            .binaries.getFramework(mode)
    inputs.property("mode", mode)
    dependsOn(framework.linkTask)

    from({ framework.outputDirectory })
    into(targetDir)

    /// generate a helpful ./gradlew wrapper with embedded Java path
    doLast {
        val gradlew = File(targetDir, "gradlew")
        gradlew.writeText("#!/bin/bash\n"
                + "export 'JAVA_HOME=${System.getProperty("java.home")}'\n"
                + "cd '${rootProject.rootDir}'\n"
                + "./gradlew \$@\n")
        gradlew.setExecutable(true)
    }
}

tasks.getByName("build").dependsOn(packForXcode)
```

The update build script uses `kotlin-multiplatform` plugin and defines several targets.  It also defines a `packForXcode` task which configures a framework lib to link in our iOS app we will create in a later step. 

## Implement shared lib module
Create a new package and kotlin source file under **lib/src/commonMain/DateHelper.kt**.  Add the following code to get the current date as `String`. 

```kotlin
package com.yourdomain.platform

expect fun getCurrentDate(): String

fun getDate(): String {
    return "Today's Date is ${getCurrentDate()}"
}
```

The method dependent on platform implementation is marked as `expect`.  The method called by Android and iOS app clients is `getDate()`. 

The common lib implementation is done in **androidMain** and **iosMain** respectively.  Create the same package as **commonMain** with a new kotlin source file under **lib/src/androidMain/DateHelperAnd.kt** and **lib/src/iosMain/DateHelperIos.kt**

Add the following for **DateHelperAnd.kt**

```kotlin
package com.yourdomain.platform

import java.util.Date

actual fun getCurrentDate(): String = Date().toString()
```

Add the following for **DateHelperIos.kt**

```kotlin
package com.yourdomain.platform

import platform.Foundation.NSDate

actual fun getCurrentDate() = NSDate().toString()
```

The implementation of the `expect` methods are marked as `actual`.  Kotlin/Native compiler comes with a set of pre-imported frameworks, so we can use the `NSDate`.  Objective C and Swift interop covered in more detail [here](https://kotlinlang.org/docs/reference/native/objc_interop.html).

## Link shared module in Android
In order for our Android app to depend on the shared lib we must link it as a dependency.  Open the **app/build.gradle** file and add the following under **dependencies** block:

```

dependencies {
    implementation project (':lib')
    ... 
}
```

## Update the Android app
Using the default `TextView` added when we generated an Android project, let's assign an `id` to the `TextView` in the activity so we can access it from code.  Open **app/src/main/res/layout/activity_main.xml** and add the `id`: 

```xml
<TextView android:id="@+id/date_view"
    ...
    />
```

Now we can add the following line of code to the `MainActivity` class in **/app/src/main/java/[package]/MainActivity.kt** file to the end of the `onCreate` method: 

```kotlin
findViewById<TextView>(R.id.date_view).text = getDate()
```

At this point you should be able to run the Android app and see the current date.

## Create iOS project
Fire up Xcode and create a new **Single View App** with **File > New > Project**.  Create a project name, e.g. **ios-app**, and set the directory inside of the project directory created with Android Studio.  Your resulting project structure should look similar to this: 

```
-- Project
  -- app
  -- lib
  -- iosApp
```


## Generate shared framework and link to project
We need to build the framework initially before we can link it to our ios project using the `build` task from our common lib module.  Open a terminal and cd into the **lib** module folder and run the following: 

```
$ ./gradlew clean packForXcode --info
```

This will run the `packForXCode` task we defined and configure the framework inside of the **lib/build/xcode-frameworks** folder. 

### Add embedded libs
Select the **ios-app** project inside xcode file view to open the project properties.  Under the **General** tab scroll down to **Frameworks, Libraries, and Embedded Content** and click on the `+` button to add the framework.  Select the **SharedContent.framework** and click **Add**.   

### Update build settings
With the project properties open, select the **Build Settings** tab and search for **EFramework Search Paths** and update the path to `$(SRCROOT)/../lib/build/xcode-frameworks`

### Create new run script
To keep the framework updated with new builds, select the **Build Rules** tab and add a new run script phase.  Add the following to the shell script: 

```
cd "$SRCROOT/../lib/build/xcode-frameworks"
./gradlew :lib:packForXCode -PXCODE_CONFIGURATION=${CONFIGURATION}
```

This will keep the framework up to date on successive builds.  

## Update the iOS App
The iOS app will use the common lib from Kotlin.  Open up the **ViewController.swift** file and add the following import: 

```swift
// import the framework
import main
```

Now append the following to the `viewDidLoad()` method: 

```swift
let date = DateHelperKt.getDate()

let label = UILabel(frame: CGRect(x: 0, y: 0, width: 230, height: 42))
label.center = CGPoint(x: 160, y: 285)
label.textAlignment = .center
label.font = label.font.withSize(16)
label.textColor = UIColor.black
label.numberOfLines = 0
label.lineBreakMode = .byWordWrapping
label.text = date
view.addSubview(label)
```

Take note of the `DateHelperKt.getDate` method call to Kotlin.  At this point you should be able to run the iOS app and see the current date. 

## References
This is a basic example of setting up code sharing with Kotlin between iOS and Android, below are some references to documentation and libraries: 

- [Kotlin/Native interoperability with Swift/Objective-C](https://kotlinlang.org/docs/reference/native/objc_interop.html)
- [Multiplatform Programming](https://kotlinlang.org/docs/reference/multiplatform.html)
- [kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines/blob/master/README.md)
- [kotlinx-io](https://github.com/Kotlin/kotlinx-io)
- [kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization)
- [Ktor](https://ktor.io/)
- [Ktor HTTP client](https://ktor.io/clients/index.html)

