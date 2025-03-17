---
title: Harlequin Custom Configuration
date: 2025-03-17 10:30:25
tags:
- sqlite
- database
- postgres
- duckdb
---

## Navigating Harlequin Query Results
[Harlequin](https://harlequin.sh) brands itself as a SQL IDE in a terminal.  It was originally introduced as a [duckdb](https://duckdb.org) database tool, it quickly added support for more databases including postgres and sqlite.  The tool is written in python and has a windows/vscode style keymap, fortunately it provides a way to customize the keymap using key/value pairs in a `.harlequin.toml` file. Below are some of the initial customizations to make the query result keys more like [helix](https://docs.helix-editor.com/keymap.html):

Helix as a **GoTo** mode access with `g` from normal mode.  Harlequin is built using the [Textual framework](https://textual.textualize.io/) which doesn't have support for multiple key presses, so can't emulate goto mode so mapped some of the secondary keys to move around. 

**Navigate around the results viewer**

Use `hjkl` to move around individual cells
```toml
[[keymaps.more_arrows]]
keys="k"
action="results_viewer.cursor_up"
key_display="⬆/k"

[[keymaps.more_arrows]]
keys="h"
action="results_viewer.cursor_left"
key_display="⬅/h"

[[keymaps.more_arrows]]
keys="j"
action="results_viewer.cursor_down"
key_display="⬇/j"

[[keymaps.more_arrows]]
keys="l"
action="results_viewer.cursor_right"
key_display="➡/l"
```

Use `s` and `e` to move the the start and end of a row respectively

```toml
[[keymaps.hx]]
keys = "s"
action = "results_viewer.cursor_row_start"

[[keymaps.hx]]
keys = "e"
action = "results_viewer.cursor_row_end"
```

Use `t` and `ctrl+shift+b` to move to column start and end, in Helix, `gt` and `gb` represent top and bottom of screen. 

```toml
[[keymaps.hx]]
keys = "t"
action = "results_viewer.cursor_column_start"

[[keymaps.hx]]
keys = "ctrl+shift+b"
action = "results_viewer.cursor_column_end"
```

Use `ctrl+shift+g` and `ctrl+shift+e` to move to table start and end

```toml
[[keymaps.hx]]
keys = "ctrl+shift+g"
action = "results_viewer.cursor_table_start"

[[keymaps.hx]]
keys = "ctrl+shift+e"
action = "results_viewer.cursor_table_end"
```

Use `w` and `b` to select the next cell and previous cell

```toml
[[keymaps.hx]]
keys = "w"
action = "results_viewer.cursor_next_cell"

[[keymaps.hx]]
keys = "b"
action = "results_viewer.cursor_previous_cell"
```
Use `ctrl+u` and `ctrl+d` to navigate page up and down

```toml
[[keymaps.hx]]
keys = "ctrl+u"
action = "results_viewer.cursor_page_up"

[[keymaps.hx]]
keys = "ctrl+d"
action = "results_viewer.cursor_page_down"
```
