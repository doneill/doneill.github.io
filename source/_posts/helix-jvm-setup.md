---
title: Helix JVM language setup
date: 2025-01-06 20:20:25
tags:
- jvm
- kotlin
- scala
- helix
---

I have been a huge [helix](https://helix-editor.com/) fan for some time now.  It is my daily coding driver for most languages and environments. Helix support many languages and [language servers](https://docs.helix-editor.com/lang-support.html) out of the box and are easy to configure. In this post I'll step through basic configuration to work with Java and Kotlin in Helix.

**Java Development**

Install Prerequisites

- JDK (Java Developer Kit) on your system
- Install `jdtls` (Eclipse JDT Language Server) for Java language support
 
```
# Install Java first if you haven't
brew install openjdk@21

# Install Maven (needed for some JDTLS features)
brew install maven

# Install jdtls
brew install jdtls

# Create Configuration Directory
mkdir -p ~/.config/jdtls
mkdir -p ~/.cache/jdtls/workspace

# Test if JDTLS works
jdtls --version
```

- Configure Helix language support, add to **~/.config/helix/languages.toml**

```
[language-server.jdtls]
command = "jdtls"
args = ["-data", "~/.cache/jdtls/workspace"]

[[language]]
name = "java"
scope = "source.java"
file-types = ["java"]
roots = ["pom.xml", "build.gradle", ".git"]
language-servers = ["jdtls"]  
```
**Kotlin Development**

Install Prerequisites

- Install Kotlin
- Install Kotlin Language Server

```
brew install kotlin
brew install kotlin-language-server
```

- Configure Helix language support, add to **~/.config/helix/languages.toml**

```
[language-server.kotlin]
command = "kotlin-language-server"

[[language]]
name = "kotlin"
scope = "source.kotlin"
injection-regex = "kotlin"
file-types = ["kt", "kts"]
shebangs = ["kotlin"]
roots = ["settings.gradle", "settings.gradle.kts", "build.gradle", "build.gradle.kts"]
comment-token = "//"
language-servers = ["kotlin-language-server"]
indent = { tab-width = 4, unit = "    " }  
```

**BONUS Scala Development**

Install Prerequisites

```
# For macOS
brew install scala
brew install coursier/formulas/coursier
brew install metals  

cs setup
cs install metals
```
- Configure Helix language support, add to **~/.config/helix/languages.toml**

```
[language-server.metals]
command = "metals"
args = []

[[language]]
name = "scala"
scope = "source.scala"
file-types = ["scala", "sbt", "sc"]
roots = ["build.sbt", "build.sc"]
language-servers = ["metals"]
indent = { tab-width = 2, unit = "  " }  
```

**Helix Health Report**

```
❯ hx --health java
Configured language servers:
  ✓ jdtls: /opt/homebrew/bin/jdtls
Configured debug adapter: None
Configured formatter: None
Tree-sitter parser: ✓
Highlight queries: ✓
Textobject queries: ✓
Indent queries: ✓

❯ hx --health kotlin
Configured language servers:
  ✓ kotlin-language-server: /opt/homebrew/bin/kotlin-language-server
Configured debug adapter: None
Configured formatter: None
Tree-sitter parser: ✓
Highlight queries: ✓
Textobject queries: ✘
Indent queries: ✘

❯ hx --health scala
Configured language servers:
  ✓ metals: /opt/homebrew/bin/metals
Configured debug adapter: None
Configured formatter: None
Tree-sitter parser: ✓
Highlight queries: ✓
Textobject queries: ✓
Indent queries: ✓
```

Debugging support we will leave for a follow up post.
