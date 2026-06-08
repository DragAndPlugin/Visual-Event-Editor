##  Visual-Event-Editor

<img width="2560" height="1440" alt="efzfzefzefzfze" src="https://github.com/user-attachments/assets/0079deae-2dbe-4f1e-80a8-845c3a736d1d" />

<p align="center">
  <strong>A node-based visual scripting tool for RPG Maker MV & MZ</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/RPG%20Maker-MV%20%7C%20MZ-blue.svg" alt="RPG Maker MV/MZ">
  <img src="https://img.shields.io/badge/Status-Beta-orange.svg" alt="Status: Beta">
  <img src="https://img.shields.io/badge/License-Source--Available-lightgrey.svg" alt="License">
  <img src="https://img.shields.io/badge/Made%20by-DragAndPlugin-purple.svg" alt="DragAndPlugin">
</p>

---

##  Overview

**Visual Event Editor** is a node-based visual scripting tool for **RPG Maker MV and MZ**. It transforms the native list of event commands into an intuitive graph interface, making event creation faster, clearer, and easier to maintain.

Designed for both beginners and advanced users, it brings modern visual scripting concepts to the RPG Maker ecosystem, while maintaining compatibility with the native editor and plugins.

---

## Features

-  **Node-Based Event Creation**
-  **Compatible with RPG Maker MV, MZ and plugins**
-  **In-Graph Search** (`Ctrl + F`) **and Advanced Search** (find references accross all events and maps)
-  **Reroute Nodes** for cleaner curves layout
-  **Comment & Group Boxes** with customizable color, text and size
-  **Automatic Node Layout** for a clean graph organization with the press of a button
-  **Live Playtesting** of events or specific commands selections
-  **Execution Highlighting** for easier debug.
-  **Automatic Node Conversion of MZ Plugins Commands** 
-  **Custom Node Framework** (WIP)
-  **Notetag Manager** for clear and easy notes and notetags manipulation
-  **Move Route Preview for MV** (+ fixes and improvements for MZ)
-  **Automatic Backups** on event save (optionnal)
-  **Automatic Save** with customizable interval (optionnal)
-  **Various QOL** over the native editor
-  **Extended Self-Switches** from A-D to A-Z
-  **Event page naming**
-  **Unlimited common, map and troop events**
-  **Unlimited switches and variables**
-  **Custom Plugin Manager** with many improvements

---

## Installation

1. Download the latest release from the **Releases** page.
2. Copy the folders into your RPG Maker project root (where `Game.rmmzproject` or `Game.rmmvproject` is located).
3. Open RPG Maker MV or MZ.
4. Enable the plugin in the **Plugin Manager**.
5. Start a **Playtest** to open the **Visual Event Editor**

---

## Usage | Shortcuts

| Action | Shortcut |
|--------|----------|
| Move on Graph | Hold **Right Click** and drag |
| Move a Node | Hold **Left Click** on the node header and drag |
| Move a Curve | **Left Click** on a curve and drag |
| Open Node List | **Right Click** on the graph |
| Open Node Context Menu | **Right Click** on a node header |
| Selection Box | Hold **Left Click** on the graph and drag |
| Focus on Node | **Double Click** a node |
| Create Reroute Node | **Double Click** a curve |
| Search | `Ctrl + F` |
| Undo | `Ctrl + Z` |
| Redo | `Ctrl + Y` |
| Copy | `Ctrl + C` |
| Paste | `Ctrl + V` |
| Cut | `Ctrl + X` |
| Save | `Ctrl + S` |
| Open/Focus Editor | `Ctrl + Shift + F8` |

---

## Custom Nodes

The editor supports extensibility through custom nodes.

You can create and distribute your own custom nodes without modifying the core editor. Custom nodes are automatically detected and integrated into the editor.

More documentation will be provided in future updates as the framework is stil a work in progress.

---

## License

This project is distributed under the **Visual Event Editor License**.

- Free for personal and commercial game development  
- Source code available for learning and customization  
- Redistribution of the editor is not permitted without permission  
- Custom nodes and extensions may be freely distributed  
- Attribution is required  

See the [`LICENSE`](LICENSE) file for full details.

---

## Attribution

If you use this editor in your project, please credit:

Visual Event Editor by DragAndPlugin

## Roadmap

- Database Manager
- Support for some of my other tools (debugger & database sharer)
- Editor add-ons and custom nodes framework improvements
- Continued performance improvements and bug fixes
