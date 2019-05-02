---
layout: post
title: "Multiplatform Kotlin"
last_update: 2019-01-05
permalink: /kotlin-multiplatform/
categories: kotlin
---

Multiplatform projects are an experimental feature in Kotlin that allows for sharing Kotlin code between iOS and Android. Android leverages the Kotlin/JVM and iOS uses Kotlin/Native which allows iOS apps to call Kotlin from Swift.  This post will step us through getting an environment setup for Android and iOS development.  A completed template project is available on [GitHub](https://github.com/doneill/kt-mulitplatform).

## Local Environment
- [Android Studio](https://developer.android.com/studio)
- Kotlin plugin 1.3.21 or higher should be installed in the IDE. 
- [Xcode](https://developer.apple.com/xcode/) 

## Create an Android Project
Create an empty activity project within Android Studio with **File > New > New Project** from the toolbar.  Ensure that **Kotlin** is the selected language or ensure Kotlin support is checked (depending on version of Android Studio).

Kotlin native requires a recent version of Gradle, ensure that the **gradle/wrapper/gradle-wrapper.properties** file is grabbing 4.7 or higher with the following **distributionUrl**: 

```
distributionUrl=https\://services.gradle.org/distributions/gradle-4.7-all.zip
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

You can also any classes the new module wizard generated for you.  

### Update shared lib build script
We will need to update the lib module build script to be a kotlin multiplatform lib.  Open up the **lib/build.gradle** file, remove all the contents, and replace with the following code: 

```groovy
apply plugin: 'kotlin-multiplatform'

kotlin {
    targets {
        fromPreset(presets.jvm, 'android')

        final def iOSTarget = System.getenv('SDK_NAME')?.startsWith("iphoneos") \
                            ? presets.iosArm64 : presets.iosX64

        fromPreset(iOSTarget, 'iOS') {
            compilations.main.outputKinds('FRAMEWORK')
        }
    }

    sourceSets {
        commonMain {
            dependencies {
                implementation 'org.jetbrains.kotlin:kotlin-stdlib-common'
            }
        }

        androidMain {
            dependencies {
                implementation 'org.jetbrains.kotlin:kotlin-stdlib'
            }
        }
        iosMain {
        }
    }
}


configurations {
    compileClasspath
}

task packForXCode(type: Sync) {
    final File frameworkDir = new File(buildDir, "xcode-frameworks")
    final String mode = project.findProperty("XCODE_CONFIGURATION")?.toUpperCase() ?: 'DEBUG'

    inputs.property "mode", mode
    dependsOn kotlin.targets.iOS.compilations.main.linkTaskName("FRAMEWORK", mode)

    from { kotlin.targets.iOS.compilations.main.getBinary("FRAMEWORK", mode).parentFile }
    into frameworkDir

    doLast {
        new File(frameworkDir, 'gradlew').with {
            text = "#!/bin/bash\nexport 'JAVA_HOME=${System.getProperty("java.home")}'\ncd '${rootProject.rootDir}'\n./gradlew \$@\n"
            setExecutable(true)
        }
    }
}

tasks.build.dependsOn packForXCode
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
$ ./gradlew clean build --info
```

This will run the `packForXCode` task we defined and configure the framework inside of the **lib/build/xcode-frameworks** folder.  Open finder and drag the **main.framework** folder to the root of the **ios-app** project in xcode.  This should open the linked frameworks dialog, ensure that **Copy items if needed** and **Create groups** radio buttons are selected and click **Finish**. 

### Add embedded libs
Select the **ios-app** project inside xcode file view to open the project properties.  Under the **General** tab scroll down to **Embedded Binaries** and click on the `+` button to add the framework.  Select the **main.framework** and click **Add**.   

### Update build settings
With the project properties open, select the **Build Settings** tab and search for **Enable Bitcode**, choose **No** from the drop down. Additionally search for **Framework Search Path** and update the path to `$(SRCROOT)/../lib/build/xcode-frameworks $(PROJECT_DIR)`

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
let label = UILabel(frame: CGRect(x: 0, y: 0, width: 230, height: 21))
label.center = CGPoint(x: 160, y: 285)
label.textAlignment = .center
label.font = label.font.withSize(16)

label.numberOfLines = 0
label.lineBreakMode = .byWordWrapping
label.text = DateHelperKt.getDate()
view.addSubview(label)
```

Take note of the `DateHelperKt.getDate` method call to Kotlin.  At this point you should be able to run the iOS app and see the current date. 
