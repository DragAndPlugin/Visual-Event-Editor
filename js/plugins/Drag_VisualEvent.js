//=============================================================================
// Drag_VisualEvent.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v0.1.047) An alternative node-based editor for common/map/troop events.
 * @author Drag
 *
 * @url
 *
 * @help 
 * An alternative node-based editor for common/map/troop events. 
 * It aims to improve the experience over the native editor and to speed up your 
 * workflow, offering a lot of QOL and others improvements.
 * 
 * No plugin parameters, every options can be tuned within the editor.
 *
 */
 
var Imported = Imported || {};
Imported.Drag_VisualEvent = true;

var Drag = Drag || {};
Drag.VisualEvent = {};
Drag.VisualEvent.alias = {};
Drag.VisualEvent.version = "0.1.047";

// (function() {
	
	//------------------------------------------------------------------------------------------------------------
	// global variables
	if (typeof require === "function") {
		Drag.VisualEvent.modules = {};
		Drag.VisualEvent.modules.fs = require('fs');
		Drag.VisualEvent.modules.path = require('path');
	}
	
	Drag.VisualEvent.pluginName = "Drag_VisualEvent";
	Drag.VisualEvent.pluginUrl = "https://drag-and-plug-in.itch.io/visual-event-editor";
	Drag.VisualEvent.pluginVersionUrl = "https://raw.githubusercontent.com/DragAndPlugin/Visual-Event-Editor/refs/heads/main/version";
	Drag.VisualEvent.patreonUrl = "http://www.patreon.com/dragandplugin";
	Drag.VisualEvent.itchUrl = "https://drag-and-plug-in.itch.io";
	
	Drag.VisualEvent.nwVisualEventWindowPath = "./Drag_VisualEvent/html/Drag_DevTools_VisualEventEditor.html";
	Drag.VisualEvent.nwVisualEventWindowName = "Drag's DevTools Graph Editor";
	
	Drag.VisualEvent.databaseTypes = ["actor", "animation", "armor", "class", "common_event", "enemy", "item", "skill", "state", "tileset", "troop", "weapon", "switch", "variable", "map_event", "equipment_type", "element_type"];
	Drag.VisualEvent.dataFiles = ["Actors", "Animations", "Armors", "Classes", "CommonEvents", "Enemies", "Items", "MapInfos", "Skills", "States", "System", "Tilesets", "Troops", "Weapons"];
	Drag.VisualEvent.pluginJSDocData = {};
	
	
	//loader functions for inputs/commands/events data
	Drag.VisualEvent.loadInputData = function(filename) {
		if (!Drag.VisualEvent.inputs)
			Drag.VisualEvent.inputs = {};
		
		const data = require(`./Drag_VisualEvent/js/data/${filename}`)(Utils.RPGMAKER_NAME);
		for (const key in data)
			if (!Drag.VisualEvent.inputs[key])
				Drag.VisualEvent.inputs[key] = data[key];
	};
	Drag.VisualEvent.loadInputData('input_data.js');
	
	Drag.VisualEvent.loadInteractiveInputData = function(filename) {
		if (!Drag.VisualEvent.interactiveInputs)
			Drag.VisualEvent.interactiveInputs = {};
		
		const data = require(`./Drag_VisualEvent/js/data/${filename}`)(Drag, Utils.RPGMAKER_NAME);
		for (const key in data)
			if (!Drag.VisualEvent.interactiveInputs[key])
				Drag.VisualEvent.interactiveInputs[key] = data[key];
	};
	Drag.VisualEvent.loadInteractiveInputData('interactive_input_data.js');
	
	try {
		require(`./Drag_VisualEvent/js/mz_plugin_command.js`)(Drag.VisualEvent, Utils.RPGMAKER_NAME);
		require(`./Drag_VisualEvent/js/data/command_data.js`)(Drag.VisualEvent, Utils.RPGMAKER_NAME);
		require(`./Drag_VisualEvent/js/data/event_data.js`)(Drag.VisualEvent, Utils.RPGMAKER_NAME);
	} catch(error) {
		console.error(error);
	}
	
	//------------------------------------------------------------------------------------------------------------
	// plugin functions	

	Drag.VisualEvent.getInputParameters = function(type, properties = {}) {
		if (Drag.VisualEvent.inputs[type]) {
			return {...{...Drag.VisualEvent.inputs[type]}, ...properties}; 
		} else
			return {...{type: type}, ...properties}; 
	};
	
	Drag.VisualEvent.getInteractiveInputParameters = function(type) {
		if (Drag.VisualEvent.interactiveInputs[type])
			return JSON.parse(JSON.stringify(Drag.VisualEvent.interactiveInputs[type])); //deep copy
		else
			return [];
	};
	
	//----------------------------------------------------------------------
	// utils
	
	Drag.VisualEvent.flattenArray = function(arr) {
		if (!Array.isArray(arr))
			return [arr];
		return arr.reduce((acc, val) => acc.concat(val), []);
	};
	
	Drag.VisualEvent.openDevTools = function() {
		if (Utils.isNwjs() && Utils.isOptionValid("test"))
			nw.Window.get().showDevTools();
	};
	
	Drag.VisualEvent.escapeRegExp = function(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	};
	
	Drag.VisualEvent.replaceAll = function(str, find, replace) {
		return str.replace(new RegExp(Drag.VisualEvent.escapeRegExp(find), 'g'), replace);
	};
	
	Drag.VisualEvent.reloadGame = function() {
		if (Drag.VisualEvent.getEditor() && Drag.VisualEvent.getEditor().saveCache)
			try {
				Drag.VisualEvent.getEditor().saveCache(Drag.VisualEvent.reload);
			} catch (error) {
				console.error(error);
			}
		else
			Drag.VisualEvent.reload();
	};
	
	Drag.VisualEvent.reload = function() {
		if (Utils.isNwjs())
			chrome.runtime.reload();
		else
			location.reload();
	};
	
	Drag.VisualEvent.showDevTools = function() {
		if (SceneManager.showDevTools)
			SceneManager.showDevTools();
		else 
			require('nw.gui').Window.get().showDevTools();
	};
	
	Drag.VisualEvent.mergeObjects = function(obj1, obj2, excludedKeys = []) {
		if (Array.isArray(obj1) && Array.isArray(obj2))
			return Drag.VisualEvent.mergeArrays(obj1, obj2, excludedKeys);
		else if (obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object") {
			const merged = Drag.VisualEvent.deepCopyJSON(obj1);
			for (const property in obj2)
				if (excludedKeys.includes(property))
					continue;
				else if (obj1.hasOwnProperty(property))
					merged[property] = Drag.VisualEvent.mergeObjects(obj1[property], obj2[property], excludedKeys);
				else
					merged[property] = obj2[property];
			return merged;
		} else
			return obj2;
	};
	
	Drag.VisualEvent.mergeArrays = function(arr1, arr2, excludedKeys = []) {
		if (Array.isArray(arr1) && Array.isArray(arr2)) {
			const merged = Drag.VisualEvent.deepCopyJSON(arr1);
			for (const [index, item] of arr2.entries())
				if (arr1[index] !== "undefined")
					merged[index] = Drag.VisualEvent.mergeArrays(arr1[index], item, excludedKeys);
				else 
					merged[index] = item;
			return merged;
		} else if (arr1 && typeof arr1 === "object" && arr2 && typeof arr2 === "object")
			return Drag.VisualEvent.mergeObjects(arr1, arr2, excludedKeys);
		else
			return arr2;
	};
	
	Drag.VisualEvent.getUniqueId = function() {
		return Math.random().toString(16).slice(2);
	};
	
	Drag.VisualEvent.getDefaultItemPrice = function(itemType, itemId) {
		switch (itemType) {
			case 0:
				return $dataItems[itemId] ? $dataItems[itemId].price : 0;
				break;
			case 1:
				return $dataWeapons[itemId] ? $dataWeapons[itemId].price : 0;
				break;
			case 2:
				return $dataArmors[itemId] ? $dataArmors[itemId].price : 0;
				break;
		}
	};
	
	// insert item at index in this array
	Drag.VisualEvent.insert = function(arr, index, item) {
		if (!Array.isArray(arr))
			return;
		
		arr.splice(index, 0, item);
		return arr;
	};

	// add array 2 to the end of array 1
	Drag.VisualEvent.append = function(arr1, arr2) {
		if (!Array.isArray(arr1) || !Array.isArray(arr2))
			return;
		
		for (let i = 0; i < arr2.length; i++)
			arr1.push(arr2[i]);

		return arr1;
	};
	
	Drag.VisualEvent.fill = function(arr, item, nb) {
		for (let i = 0; i < nb; i++)
			arr.push(item);
	};
	
	Drag.VisualEvent.removeIndex = function(arr, index) {
		if (!Array.isArray(arr))
			return;
		
		arr.splice(index, 1);
		return arr;
	};
	
	Drag.VisualEvent.removeItem = function(arr, item) {
		if (!Array.isArray(arr))
			return;
		
		const index = arr.indexOf(item);
		arr.splice(index, 1);
		return arr;
	};
	
	Drag.VisualEvent.findAllIndexes = function(arr, item) {
		const indexes = arr.reduce((arr2, value, index) => {
			if (value === item) arr2.push(index);
			return arr2;
		}, []);
		return indexes;
	};
	
	//check if arr1 includes all values of arr2
	Drag.VisualEvent.arrayIncludesArray = function(arr1, arr2) {
		return arr2.every(item => arr1.includes(item));
	};
	
	//check if arr1 includes any value of arr2
	Drag.VisualEvent.arrayIncludesAny = function(arr1, arr2) {
		return arr2.some(item => arr1.includes(item));
	};
	
	Drag.VisualEvent.getChildIndex = function(element) {
		return Array.from(element.parentElement.children).indexOf(element);
	};
	
	Drag.VisualEvent.deepCopyJSON = function(obj) {
		return JSON.parse(JSON.stringify(obj));
	};
	
	//slower than deep copy json, not used
	Drag.VisualEvent.deepCopy = function(obj) {
		if (Array.isArray(obj))
			return obj.map(item => Drag.VisualEvent.deepCopy(item));
		else if (obj && typeof obj === "object")
			return Drag.VisualEvent.objectFromEntries(Object.entries(obj).map(entry => [entry[0], Drag.VisualEvent.deepCopy(entry[1])]));
		else
			return obj;
	};
	
	Drag.VisualEvent.objectFromEntries = function(entries) {
		let obj = {};
		if (!entries)
			return obj;
		
		for (const entry of entries)
			obj[entry[0]] = entry[1];
		return obj;
	};	
	
	Drag.VisualEvent.isIdentical = function(a, b) {
		let isIdentical = true;
		
		if (Array.isArray(a) || Array.isArray(b)) {
			if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
				for (const [index, item] of a.entries()) {
					isIdentical = Drag.VisualEvent.isIdentical(item, b[index])
					if (!isIdentical)
						break;
				}
			} else
				isIdentical = false;
		} else if ((a && typeof a === "object") || (b && typeof b === "object")) {
			if (!(a && typeof a === "object" && b && typeof b === "object"))
				isIdentical = false;
			else if (!(Object.keys(a).length === Object.keys(b).length && Drag.VisualEvent.isIdentical(Object.keys(a).sort(), Object.keys(b).sort())))
				isIdentical = false;
			// else if (!(Object.values(a).length === Object.values(b).length && Drag.VisualEvent.isIdentical(Object.values(a), Object.values(b))))
				// isIdentical = false;
			else
				for (const key of Object.keys(a)) {
					isIdentical  = Drag.VisualEvent.isIdentical(a[key], b[key]);
					if (!isIdentical)
						break;
				}
		} else
			isIdentical = a === b;		
		
		return isIdentical;
	};
	
	Drag.VisualEvent.compareIdentical = function(a, b) {
		if (Array.isArray(a) || Array.isArray(b)) {
			if (!(Array.isArray(a) && Array.isArray(b)))
				return `A is array ${Array.isArray(a)} !== B is array ${Array.isArray(b)}`;
			else if (a.length !== b.length)
				return `Arr A length (${a.length}) !== Arr B length (${b.length})`;
			else
				return a.map((item, index) => Drag.VisualEvent.compareIdentical(item, b[index]));
		} else if ((a && typeof a === "object") || (b && typeof b === "object")) {
			if (!(a && typeof a === "object" && b && typeof b === "object"))
				return `A is object ${typeof a === "object"} !== B is object ${typeof b === "object"}`;
			else if (Object.keys(a).length !== Object.keys(b).length)
				return `A keys length ${Object.keys(a).length} !== B keys length ${Object.keys(b).length}`;
			else if (Object.values(a).length !== Object.values(b).length)
				return `A values length ${Object.values(a).length} !== B values length ${Object.values(b).length}`;
			else if (!Drag.VisualEvent.isIdentical(Object.keys(a).sort(), Object.keys(b).sort()))
				return "A keys !== B keys";
			// else if (!Drag.VisualEvent.isIdentical(Object.values(a), Object.values(b)))
				// return "A values !== B values";
			else
				return Object.keys(a).map(key => Drag.VisualEvent.compareIdentical(a[key], b[key]));
		}
		
		return a === b  ? true : `${a} !== ${b}`;
	};
	
	Drag.VisualEvent.lerp = function(a, b, alpha) {
		return a + alpha * (b - a);
	};
	
	Drag.VisualEvent.getTilesetIndex = function(tileId) {
		if (tileId < Tilemap.TILE_ID_C)
			return 5;
		else if (tileId < Tilemap.TILE_ID_D)
			return 6;
		else if (tileId < Tilemap.TILE_ID_E)
			return 7;
		else 
			return 8;
	};
	
	Drag.VisualEvent.getTilesetStartingId = function(letter) {
		switch (letter) {
			case "B":
				return Tilemap.TILE_ID_B;
			case "C": 
				return Tilemap.TILE_ID_C;
			case "D":
				return Tilemap.TILE_ID_D;
			case "E":
				return Tilemap.TILE_ID_E;
			default:
				return 0;
		}
	};
	
	Drag.VisualEvent.renameObjectKey = function(obj, oldKey, newKey) {
		Object.defineProperty(obj, newKey,
			Object.getOwnPropertyDescriptor(obj, oldKey));
			
		delete obj[oldKey];
	};
	
	Drag.VisualEvent.filterObjectByKey = function(obj, filterValue) {
		return Object.keys(obj).filter(key => 
			key.includes(filterValue)
		).reduce((filteredObj, key) => {
			filteredObj[key] = obj[key];
			return filteredObj;
		}, {});
	};
	
	Drag.VisualEvent.manhattanDistance = function (x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
		return Math.abs((x1 - x2) + (y1 - y2));
	};
	
	Drag.VisualEvent.chebyshevDistance = function (x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
		return Math.abs(Math.max(y2 - y1, x2 - x1));
	};
	
	Drag.VisualEvent.euclideanDistance = function (x1 = 0, y1 = 0, x2 = 0, y2 = 0) { //to round
		return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
	};
	
	//------------------------------------------------------------------------------------------------------------
	// Scene Manager
	
	Drag.VisualEvent.alias.SceneManager_terminate = SceneManager.terminate;
	SceneManager.terminate = function() {
		const GUI = require('nw.gui');
		GUI.App.closeAllWindows();
		GUI.App.quit();
	};
	
	Drag.VisualEvent.alias.SceneManager_onKeyDown = SceneManager.onKeyDown;
	SceneManager.onKeyDown = function(event) {
		if (!event.ctrlKey && !event.altKey) {
			switch (event.keyCode) {
				case 116: // F5
					Drag.VisualEvent.reloadGame();
					return;
			}
		}
		
		Drag.VisualEvent.alias.SceneManager_onKeyDown.apply(this, arguments);
	};
	
	//------------------------------------------------------------------------------------------------------------
	// window openers && other windows related functions

	//ctrl+shift+f8 open editor
	window.addEventListener("keydown", (event) => { if (event.keyCode === 119 && event.ctrlKey && event.shiftKey) Drag.VisualEvent.openEditor(); });
	
	Drag.VisualEvent.openEditor = function(id = 0, type = "") {
		try {
			if (!Drag.VisualEvent.editorWindowHandler) {
				if (Drag.VisualEvent.modules.fs && Drag.VisualEvent.modules.fs.existsSync(Drag.VisualEvent.nwVisualEventWindowPath)) {
					console.log(Drag.VisualEvent.nwVisualEventWindowPath + " opened by : " + Drag.VisualEvent.pluginName);
					const width = screen.width;
					const height = screen.height;
					const top = 0;
					const left = 0; 
					Drag.VisualEvent.editorWindowHandler = window.open(Drag.VisualEvent.nwVisualEventWindowPath, Drag.VisualEvent.nwVisualEventWindowName, `dependent=1, menubar=0, resizable=1, width=${width}, height=${height}, top=${top}, left=${left}`);
					Drag.VisualEvent.editorWindowHandler.data = {}
					Drag.VisualEvent.editorWindowHandler.data.targetId = parseInt(id);
					Drag.VisualEvent.editorWindowHandler.data.targetType = type;
					
					const GUI = require('nw.gui');
					const GUIWindow = GUI.Window.get();
					GUIWindow.on('close', function() {						
						GUI.App.closeAllWindows();
						GUI.App.quit();
					});
					
					Drag.VisualEvent.editorWindowHandler.addEventListener("beforeunload", Drag.VisualEvent.onCloseEditor);					
				} else { 
					console.error(`Couldn't open ${Drag.VisualEvent.nwVisualEventWindowName}. ${Drag.VisualEvent.nwVisualEventWindowPath} file does not exist or is not in the right place.`);
				}
			} else {
				Drag.VisualEvent.editorWindowHandler.focus();
			}
		} catch(err) {
			console.error(err);
		}
	};
	
	Drag.VisualEvent.getEditor = function() {
		return Drag.VisualEvent.editorWindowHandler;
	};
	
	Drag.VisualEvent.focusEditor = function() {
		const editor = Drag.VisualEvent.getEditor();
		if (editor)
		return editor.focus();
	};
	
	Drag.VisualEvent.onCloseEditor = function(event) {
		if (event)
			event.preventDefault();
		
		if (Drag.VisualEvent.windowsHandlers)
			for (const windowHandler in Drag.VisualEvent.windowsHandlers)
				Drag.VisualEvent.windowsHandlers[windowHandler].close();
		
		console.log("Saving Visual Event Editor cache before closing...");
		const editor = Drag.VisualEvent.getEditor();
		
		if (editor)
			try {
				editor.saveCache(Drag.VisualEvent.closeEditor);
			} catch (error) {
				console.error(error);
				Drag.VisualEvent.closeEditor();
			}
	};
	
	Drag.VisualEvent.closeEditor = function() {
		console.log("Closing Visual Event Editor");
		Drag.VisualEvent.editorWindowHandler.removeEventListener("beforeunload", Drag.VisualEvent.onCloseEditor);
		Drag.VisualEvent.editorWindowHandler.close(true);
		Drag.VisualEvent.editorWindowHandler = null;
	};
	
	Drag.VisualEvent.setLightMode = function(doc, lightMode = "dark") {
		if (!doc)
			return;
		
		const eLightMode = doc.querySelector("#lightMode");
		if (lightMode === "light") {
			doc.documentElement.style.setProperty('--background-color', '#ffffff');
			doc.documentElement.style.setProperty('--color', "#000000");
			doc.documentElement.style.setProperty('--color-alpha-03', '#0000001a');
			if (eLightMode)
				eLightMode.setAttribute('data-lightMode', lightMode);
		} else if (lightMode === "dark") {
			doc.documentElement.style.setProperty('--background-color', '#2a2b36');
			doc.documentElement.style.setProperty('--color', '#f5f5dc');
			doc.documentElement.style.setProperty('--color-alpha-03', '#f5f5dc0d');
			if (eLightMode)
				eLightMode.setAttribute('data-lightMode', lightMode);
		}
	};

	Drag.VisualEvent.toggleLightMode = function(doc) {
		if (!doc)
			return;
		
		const lightMode = doc.querySelector("#lightMode").getAttribute('data-lightMode');
		if (lightMode === "light")
			Drag.VisualEvent.setLightMode(doc, "dark");
		else
			Drag.VisualEvent.setLightMode(doc, "light");
	};
	
	Drag.VisualEvent.setDocumentFontSize = function(doc, fontSize) {
		fontSize = parseInt(fontSize);
		
		const body = doc.body;	
		body.style.fontSize = `${fontSize}px`;
		doc.documentElement.style.fontSize = `${fontSize}px`;
	};
	
	Drag.VisualEvent.getDocumentFontSize = function(doc) {
		return parseInt(doc.documentElement.style.fontSize) || 16;
	};
	
	Drag.VisualEvent.openWindow = function(filename, name, width, height, top, left, data = {}) {
		const filepath = `./Drag_VisualEvent/html/`;
		
		if (Utils.RPGMAKER_NAME === "MV")
			top += 30;
		
		try {
			if (!Drag.VisualEvent.windowsHandlers)
				Drag.VisualEvent.windowsHandlers = {};
			
			if (!Drag.VisualEvent.windowsHandlers[`${name}`] || Drag.VisualEvent.windowsHandlers[`${name}`].closed) {
				if (Drag.VisualEvent.modules.fs && Drag.VisualEvent.modules.fs.existsSync(filepath + filename)) {
					const screenWidth = window.screen.width;
					const screenHeight = window.screen.height;
					if (left + width + 20 > screenWidth)
						left += screenWidth - (left + width + 20); 
					if (top + height + (window.outerHeight - window.innerHeight) + 10 > screenHeight)
						top += screenHeight - (top + height + (window.outerHeight - window.innerHeight) + 10); 
					
					Drag.VisualEvent.windowsHandlers[`${name}`] = window.open(filename, name, `attributionsrc=1, dependent=1, menubar=1, resizable=1, width=${width}, height=${height}, top=${top}, left=${left}`);
					Drag.VisualEvent.windowsHandlers[`${name}`].data = data;
					
					const editor = Drag.VisualEvent.getEditor();
					const fontSize = editor ? Drag.VisualEvent.getDocumentFontSize(editor.document) : 16;
					Drag.VisualEvent.windowsHandlers[`${name}`].addEventListener('load', () => {
						Drag.VisualEvent.setDocumentFontSize(Drag.VisualEvent.windowsHandlers[`${name}`].document, fontSize);
					});
				} else { 
					console.error(`Couldn't open ${name}. ${filepath}${filename} file does not exist or is not in the right place.`);
				}
			} else if(Drag.VisualEvent.windowsHandlers[`${name}`])
				Drag.VisualEvent.windowsHandlers[`${name}`].focus();
		} catch(err) {
			console.error(err);
		}
	};
	
	Drag.VisualEvent.openAdvancedSearchWindow = function(input) {
		const rect = input.getBoundingClientRect();
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_AdvancedSearch.html', 'Advanced Search', 
			window.screen.width * 0.35, window.screen.height * 0.625, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input}
		);
	};
	
	Drag.VisualEvent.openShopProcessingMenu = function(input) {
		const rect = input.getBoundingClientRect();
		const val =  input.getAttribute('data-value') || "";
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_ShopProcessing.html', 'Shop Processing Menu', 
			window.screen.width * 0.3, window.screen.height * 0.625, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, value: val}
		);
	};
	
	Drag.VisualEvent.openStructureManager = function(input) {
		const rect = input.getBoundingClientRect();
		const pluginName = input.getAttribute('data-pluginName');
		const structName = input.getAttribute('data-structName');
		const val = JSON.parse(Drag.VisualEvent.unescapeQuotes(input.getAttribute('data-structValue')));
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_StructureManager.html', 'Structure Manager', 
			window.screen.width * 0.3, window.screen.height * 0.7, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, pluginName: pluginName, structName: structName, value: val}
		);
	};
	
	Drag.VisualEvent.openSwitchVariableMenu = function(input) {
		const rect = input.getBoundingClientRect();
		const type = input.getAttribute('data-inputType') || input.getAttribute('data-type');
		console.log(rect, input.ownerDocument.defaultView.screenTop, input.ownerDocument.defaultView.screenLeft)
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_SwitchVariableMenu.html', 'Switch & Variable Menu', 
			window.screen.width * 0.4, window.screen.height * 0.75, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, type: type}
		);
	};
	
	Drag.VisualEvent.openMoveRouteMenu = function(input) {
		const rect = input.getBoundingClientRect();
		const wait = input.getAttribute('data-wait') === "true";
		const repeat = input.getAttribute('data-repeat') === "true";
		const skip = input.getAttribute('data-skip') === "true";
		const list = JSON.parse(input.getAttribute('data-list'));
		const parameters = JSON.parse(input.getAttribute('data-parameters'));
		const eventId = parseInt(input.getAttribute('data-eventId'));
		const thisEventOnly = input.getAttribute('data-thisEventOnly') === "true";
		const mapId = parseInt(input.getAttribute('data-mapId')) || 0;
		const x = parseInt(input.getAttribute('data-x')) || 0;
		const y = parseInt(input.getAttribute('data-y')) || 0;
		
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_MoveRouteMenu.html', 'Move Route Menu', 
			window.screen.width * 0.55, window.screen.height * 0.65, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, list: list, parameters: parameters, eventId: eventId, repeat: repeat, wait: wait, skip: skip, thisEventOnly: thisEventOnly, mapId: mapId, x: x, y: y}
		);
	};
	
	Drag.VisualEvent.openMapLocationPicker = function(input) {
		const mapId = parseInt(input.getAttribute('data-mapId')) || 0;
		const x = parseInt(input.getAttribute('data-x')) || 0;
		const y = parseInt(input.getAttribute('data-y')) || 0;
		
		const isMoveRoutePreview = input.getAttribute('data-isMoveRoutePreview') === "true";
		const list = isMoveRoutePreview ? JSON.parse(input.getAttribute('data-list')) : null;
		const parameters = isMoveRoutePreview ? JSON.parse(input.getAttribute('data-parameters')) : null;
		const rect = input.getBoundingClientRect();
		const allowSearch = input.getAttribute('data-allowSearch') === "true";
		const allowMapChange = input.getAttribute('data-allowMapChange') === "true";
		
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_MapLocationPicker.html', 'Map Location Picker', 
			window.screen.width * 0.5, window.screen.height * 0.625, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, mapId: mapId, x: x, y: y, isMoveRoutePreview: isMoveRoutePreview, list: list, parameters: parameters, allowSearch: allowSearch, allowMapChange: allowMapChange}
		);
	};
	
	Drag.VisualEvent.openMapPropertiesMenu = function(input, mapId) {
		if (!input || !mapId)
			return;
		
		const x = parseInt(input.getAttribute('data-x')) || 0;
		const y = parseInt(input.getAttribute('data-y')) || 0;
		const rect = input.getBoundingClientRect();
		
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_MapSettingsMenu.html', 'Map Settings Menu', 
			window.screen.width * 0.5, window.screen.height * 0.625, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, mapId: mapId, x: x, y: y}
		);
	};
	
	Drag.VisualEvent.openFileExplorer = function(input) {
		const fileCount = parseInt(input.getAttribute('data-fileCount')) || 1;
		const src = fileCount > 1 ? JSON.parse(input.getAttribute('data-src')) : input.getAttribute('data-src');
		const exitFolder = input.getAttribute('data-exitFolder') === "true";
		const allowSubFolder = input.getAttribute('data-allowSubFolder') === "true";
		const allowNone = input.getAttribute('data-allowNone') === "true";
		const previewType = input.getAttribute('data-previewType') || '';
		const fileTypes = input.getAttribute('data-fileTypes');
		const isFullCharacterSheet = input.getAttribute('data-isFullCharacterSheet') === "true";
		const isCharacterSheet = input.getAttribute('data-isCharacterSheet') === "true" || isFullCharacterSheet;
		const allowTilesetSelection = input.getAttribute('data-allowTilesetSelection') === "true";
		const tilesetNames = input.getAttribute('data-tilesetNames') ? input.getAttribute('data-tilesetNames').split(',') : null;
		const subImageSize = [parseInt(input.getAttribute('data-subImageWidth')) || 0, parseInt(input.getAttribute('data-subImageHeight')) || 0];
		const rect = input.getBoundingClientRect();
		const value = fileCount > 1 ? input.value.split(",") : input.value;
		
		Drag.VisualEvent.openWindow(
			"Drag_DevTools_FileExplorer.html", "File Explorer", 
			window.screen.width  * 0.35, window.screen.height * 0.625, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, value: value, src: src, fileCount: fileCount, previewType: previewType, allowNone: allowNone, exitFolder: exitFolder, allowSubFolder: allowSubFolder, 
			isCharacterSheet: isCharacterSheet, isFullCharacterSheet: isFullCharacterSheet, fileTypes: fileTypes, subImageSize: subImageSize, allowTilesetSelection: allowTilesetSelection, tilesetNames: tilesetNames}
		);
	};
	
	Drag.VisualEvent.openNotetagManager = function(input) {
		if (!input)
			return;
		
		const rect = input.getBoundingClientRect();
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_NotetagManager.html', 'Notetag Manager', 
			window.screen.width * 0.225, window.screen.height * 0.6, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input}
		);
	};
	
	Drag.VisualEvent.openTroopMembersManager = function(input, troop, enemies) {
		if (!input || !troop || !enemies)
			return;
		
		const rect = input.getBoundingClientRect();
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_TroopMembersManager.html', 'Troops Members Manager', 
			window.screen.width * 0.6, window.screen.height * 0.7, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, troop: troop, enemies: enemies}
		);	
	};
	
	Drag.VisualEvent.updateEventMembers = function(troopId, members) {
		const editor = Drag.VisualEvent.getEditor();
		editor.updateEventMembers(troopId, members);
	};
	
	Drag.VisualEvent.openEventConditionsMenu = function(input) {
		if (!input)
			return;
		
		const rect = input.getBoundingClientRect();
		const editor = Drag.VisualEvent.getEditor();
		const eventType = editor.data.targetType;
		const mapId = editor.data.mapTargetId;
		const eventId = editor.data.targetId;
		const pageId = editor.data.pageId || 0;
		
		let eventData = null;
		if (eventType === "Map Event")
			eventData = editor.hasItemInEventCache("data", "Map Event", mapId, eventId) ? editor.getEventCacheItem("data", "Map Event", mapId, eventId) : (editor.data.loadedMap.events[eventId] || Drag.VisualEvent.getDefaultMapEvent());
		else
			eventData = editor.hasItemInEventCache("data", "Troop Event", 0, eventId) ? editor.getEventCacheItem("data", "Troop Event", 0, eventId) : (editor.data.$dataTroops[eventId] || Drag.VisualEvent.getDefaultTroopEvent());
		
		Drag.VisualEvent.openWindow(
			'Drag_DevTools_EventConditionsMenu.html', 'Event Conditions', 
			window.screen.width * 0.4, window.screen.height * 0.5, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, eventType: eventType, eventData: eventData, pageId: pageId, editor: editor}
		);
	};
	
	
	
	//---------------------------------------------------------------------------------------------------------
	// Scene Boot
	
	Drag.VisualEvent.alias._Scene_Boot_start = Scene_Boot.prototype.start;
	Scene_Boot.prototype.start = function() {
		Drag.VisualEvent.alias._Scene_Boot_start.call(this);
		Drag.VisualEvent.openEditor();
	};
	
	//---------------------------------------------------------------------------------------------------------
	// Game Switches

	Game_Switches.prototype.getName = function(switchId) {
		if (!$dataSystem)
			return ``;
		return $dataSystem.switches[switchId] || '';
	};
	
	//---------------------------------------------------------------------------------------------------------
	// Game Variables
	
	Game_Variables.prototype.getName = function(varId) {
		if (!$dataSystem)
			return ``;
		return $dataSystem.variables[varId] || '';
	};
	
	Game_Variables.prototype.valueByName = function(name = '') {
		if (!$dataSystem)
			return ``;
		return $gameVariables.value($dataSystem.variables.indexOf(name) || 0);
	};
	
	//------------------------------------------------------------------------------------------------------------
	// Editor cache
	
	Drag.VisualEvent.cacheFilepath = "./Drag_VisualEvent/cache/cache.json";
	Drag.VisualEvent.loadEditorCache = function() {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", Drag.VisualEvent.cacheFilepath);
		xhr.overrideMimeType("application/json");
		xhr.onload = () => this.onEditorCacheLoad(xhr);
		xhr.onerror = () => this.onEditorCacheError();
		xhr.send();
	};
	
	Drag.VisualEvent.saveEditorCache = function(cache, callback) {
		Drag.VisualEvent.writeJSON(Drag.VisualEvent.cacheFilepath, cache, callback);
	};
	
	Drag.VisualEvent.onEditorCacheLoad = function(xhr) {
		if (xhr.status < 400) {
			try { 
				const data = JSON.parse(xhr.responseText);
				Drag.VisualEvent.getEditor().onCacheLoaded(data);
			} catch(err) {
				Drag.VisualEvent.getEditor().onCacheLoadError();
			}
		} else
			this.onEditorCacheError();
	};
	
	Drag.VisualEvent.onEditorCacheError = function() {
		Drag.VisualEvent.getEditor().onCacheLoadError();
	};
	
	//---------------------------------------------------------------------------------------------------------
	// Map Image
	// Big thanks to Hudell and Arthran for their Orange Mapshot MZ (License CC0 1.0) that I modified and used as a base for this part

	Drag.VisualEvent.getMapData = function(map, callback) {
		Drag.VisualEvent.loadDataFile(map.replace('.json', ''), callback);
	};

	Drag.VisualEvent.getMapUrlData = function(data, images) {
		Drag.VisualEvent.createTilemap(data, images);
	};

	Drag.VisualEvent.createTilemap = function(data, images) {
		const tilemap = new MapImage();
		tilemap.tileWidth = $dataSystem.tileSize || 48;
		tilemap._tileWidth = tilemap.tileWidth;
		tilemap.tileHeight = $dataSystem.tileSize || 48;
		tilemap._tileHeight = tilemap.tileHeight;
		tilemap.setData(data.width, data.height, data.data);
		tilemap.horizontalWrap = false;
		tilemap.verticalWrap = false;

		Drag.VisualEvent.loadTileset(tilemap, data.tilesetId, data, images);
		Drag.VisualEvent.createCharacters(data, tilemap, images);
		return tilemap;
	};

	Drag.VisualEvent.loadTileset = function(tilemap, tilesetId, data, images) {
		const tileset = $dataTilesets[tilesetId];
		if (tileset) {
			const bitmaps = [];
			let readyCount = 0;
			
			tilemap.flags = tileset.flags;
			for (const name of tileset.tilesetNames) {
				const bitmap = ImageManager.loadTileset(name);
				bitmaps.push(bitmap);
				
				bitmap.addLoadListener(() => {
					readyCount++;
					if (readyCount === tileset.tilesetNames.length) {
						if (typeof tilemap.setBitmaps === "function") // MZ
							tilemap.setBitmaps(bitmaps);
						else { //MV
							tilemap.bitmaps = bitmaps;
							tilemap.refreshTileset();
							tilemap.refresh();
						}
						
						tilemap._isTilesetReady = true;
						Drag.VisualEvent.paintLayered(data, images, tilemap)
					}
				});
			}			
		}
	};

	Drag.VisualEvent.createCharacters = function(data, tilemap, images) {
		const characterSprites = [];
		for (const event of data.events) {
			if (!event)
				continue;
			
			const spriteChar = new Sprite_Character(event);
			
			spriteChar._event = event;
			spriteChar._tilesetId = data.tilesetId;
			spriteChar._tileId = event.pages[0].image.tileId;
			spriteChar._characterName = event.pages[0].image.characterName;
			spriteChar._characterIndex = event.pages[0].image.characterIndex;
			
			const tileset = $dataTilesets[data.tilesetId];
			if (spriteChar._tileId > 0 || tileset.tilesetNames.includes(spriteChar._characterName)) {
				const setNumber = 5 + Math.floor(spriteChar._tileId / 256);
				spriteChar.bitmap = ImageManager.loadTileset(tileset.tilesetNames[setNumber]);
				characterSprites.push(spriteChar);
			} else if (spriteChar._characterName) {
				spriteChar.bitmap = ImageManager.loadCharacter(spriteChar._characterName);
				spriteChar._isBigCharacter = ImageManager.isBigCharacter(spriteChar._characterName);
				characterSprites.push(spriteChar);
			}
		}
		
		let readyCount = 0;
		for (const spriteChar of characterSprites)
			spriteChar.bitmap.addLoadListener(() => {
				Drag.VisualEvent.prepareCharacter(spriteChar, data, tilemap, images);
				readyCount++;
				if (readyCount === characterSprites.length) {
					tilemap._areCharactersReady = true;
					Drag.VisualEvent.paintLayered(data, images, tilemap)
				}
			});
	};

	Drag.VisualEvent.prepareCharacter = function(spriteChar, data, tilemap, images) {
		spriteChar._character._priorityType = spriteChar._event.pages[0].priorityType;
		spriteChar.y = spriteChar._event.y;
		spriteChar.x = spriteChar._event.x;
		
		if (spriteChar._tileId > 0) {
			const tileId = spriteChar._tileId;
			const pw = tilemap.tileWidth;
			const ph = tilemap.tileHeight;
			const sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * pw;
			const sy = (Math.floor((tileId % 256) / 8) % 16) * ph;
			spriteChar.setFrame(sx, sy, pw, ph);
		} else if (spriteChar._characterName) {
			const pw = spriteChar._isBigCharacter ? spriteChar.bitmap.width / 3 : spriteChar.bitmap.width / 12;
			const ph = spriteChar._isBigCharacter ? spriteChar.bitmap.height / 4 : spriteChar.bitmap.height / 8;
			
			let bx = 0;
			if (!this._isBigCharacter) {
				const index = spriteChar._characterIndex;
				bx = (index % 4) * 3;
			}
			
			let by = 0;
			if (!this._isBigCharacter) {
				const index = spriteChar._characterIndex;
				by = Math.floor(index / 4) * 4;
			}
			
			const sx = (bx + spriteChar._event.pages[0].image.pattern) * pw;
			const sy = (by + (spriteChar._event.pages[0].image.direction - 2) / 2) * ph;
			spriteChar.updateHalfBodySprites();
			spriteChar.setFrame(sx, sy, pw, ph);
		}

		tilemap.addChild(spriteChar);
	};

	Drag.VisualEvent.paintLayered = function(data, images, tilemap) {
		if (!tilemap._isTilesetReady || !tilemap._areCharactersReady)
			return;
		
		const width = data.width * ($dataSystem.tileSize || 48);
		const height = data.height * ($dataSystem.tileSize || 48);
		
		const layer1 = new Bitmap(width, height);
		const layer2 = new Bitmap(width, height);
		const layer3 = new Bitmap(width, height);
		const layer4 = new Bitmap(width, height);
		const shadows = new Bitmap(width, height);
		const lowerEvents = new Bitmap(width, height);
		const normalEvents = new Bitmap(width, height);
		const upperEvents = new Bitmap(width, height);
		const bitmaps = [layer1, layer2, layer3, layer4, shadows, lowerEvents, normalEvents, upperEvents];

		tilemap._paintLayered(data, layer1, layer2, layer3, layer4, shadows, lowerEvents, normalEvents, upperEvents);
		for (const [i, bitmap] of bitmaps.entries())
			bitmap.addLoadListener(() => {
				images[i].src = bitmap.canvas.toDataURL('image/png', 1);
			});
	};

	function MapImage() {
		Tilemap.prototype.initialize.call(this);
	};

	MapImage.prototype = Object.create(Tilemap.prototype);
	MapImage.prototype.constructor = Tilemap;

	MapImage.prototype._paintLayered = function(data, groundBitmap, ground2Bitmap, lowerBitmap, upperLayer, shadowBitmap, lowerEvents, normalEvents, upperEvents) {
		const tileCols = data.width;
		const tileRows = data.height;
		
		//paint map && shadows
		for (let y = 0; y < tileRows; y++)
			for (let x = 0; x < tileCols; x++)
				this._paintTileOnLayers(groundBitmap, ground2Bitmap, lowerBitmap, upperLayer, shadowBitmap, x, y);

		//paint events
		this._paintCharacters(lowerEvents, 0);
		this._paintCharacters(normalEvents, 1);
		this._paintCharacters(upperEvents, 2);
	};

	MapImage.prototype._paintCharacters = function (bitmap, priority) {
		for (const child of this.children) {
			if (child instanceof Sprite_Character) {
				if (child._character !== null)
					if (child._character instanceof Game_Player || child._character instanceof Game_Follower || child._character instanceof Game_Vehicle) continue;
				
				if (child._characterName === '' && child._tileId === 0) continue;
				if (priority !== undefined && child._character._priorityType !== priority) continue;
				
				const x = child.x * this.tileWidth;
				const y = child.y * this.tileHeight;
				
				bitmap.blt(child.bitmap, child._frame.x, child._frame.y, child._frame.width, child._frame.height, x, y, child._frame.width, child._frame.height);
			}
		}
	};

	MapImage.prototype._paintTileOnLayers = function (groundBitmap, ground2Bitmap, lowerBitmap, upperBitmap, shadowBitmap, x, y) {
		const tableEdgeVirtualId = 10000;
		const mx = x;
		const my = y;
		const dx = (mx * this.tileWidth);
		const dy = (my * this.tileHeight);
		const lx = dx / this.tileWidth;
		const ly = dy / this.tileHeight;
		const tileId0 = this._readMapData(mx, my, 0);
		const tileId1 = this._readMapData(mx, my, 1);
		const tileId2 = this._readMapData(mx, my, 2);
		const tileId3 = this._readMapData(mx, my, 3);
		const shadowBits = this._readMapData(mx, my, 4);
		const upperTileId1 = this._readMapData(mx, my - 1, 1);

		if (groundBitmap !== undefined)
			groundBitmap.clearRect(dx, dy, this.tileWidth, this.tileHeight);

		if (ground2Bitmap !== undefined)
			ground2Bitmap.clearRect(dx, dy, this.tileWidth, this.tileHeight);

		if (lowerBitmap !== undefined)
			lowerBitmap.clearRect(dx, dy, this.tileWidth, this.tileHeight);

		if (upperBitmap !== undefined)
			upperBitmap.clearRect(dx, dy, this.tileWidth, this.tileHeight);

		if (shadowBitmap !== undefined)
			shadowBitmap.clearRect(dx, dy, this.tileWidth, this.tileHeight);

		const me = this;

		function drawTiles(bitmap, tileId, shadowBits, upperTileId1) {
			if (tileId < 0)
				return;
			
			if (tileId >= tableEdgeVirtualId)
				MapImage.prototype._drawTableEdge.call(me, bitmap, upperTileId1, dx, dy);
			else
				me._drawTileOldStyle(bitmap, tileId, dx, dy);
		}

		if (groundBitmap !== undefined) {
			drawTiles(groundBitmap, tileId0, undefined, upperTileId1);

			if (shadowBitmap !== undefined && tileId0 < 0)
				drawTiles(shadowBitmap, tileId0, shadowBits, upperTileId1);
		}

		if (ground2Bitmap !== undefined) {
			drawTiles(ground2Bitmap, tileId1, undefined, upperTileId1);

			if (shadowBitmap !== undefined && tileId1 < 0)
				drawTiles(shadowBitmap, tileId1, shadowBits, upperTileId1);
		}

		if (lowerBitmap !== undefined) {
			drawTiles(lowerBitmap, tileId2, undefined, upperTileId1);

			if (shadowBitmap !== undefined && tileId2 < 0)
				drawTiles(shadowBitmap, tileId2, shadowBits, upperTileId1);
		}

		if (upperBitmap !== undefined) {
			drawTiles(upperBitmap, tileId3, shadowBits, upperTileId1);

			if (shadowBitmap !== undefined && tileId3 < 0)
				drawTiles(shadowBitmap, tileId3, shadowBits, upperTileId1);
		}
		
		if (shadowBitmap !== undefined && shadowBits !== undefined)
			MapImage.prototype._drawShadow.call(this, shadowBitmap, shadowBits, dx, dy);
	};

	MapImage.prototype._paintTilesOnBitmap = function (data, lowerBitmap, upperBitmap, x, y) {
		const tableEdgeVirtualId = 10000;
		const mx = x;
		const my = y;
		const dx = (mx * this.tileWidth);
		const dy = (my * this.tileHeight);
		const lx = dx / this.tileWidth;
		const ly = dy / this.tileHeight;
		const tileId0 = this._readMapData(mx, my, 0);
		const tileId1 = this._readMapData(mx, my, 1);
		const tileId2 = this._readMapData(mx, my, 2);
		const tileId3 = this._readMapData(mx, my, 3);
		const shadowBits = this._readMapData(mx, my, 4);
		const upperTileId1 = this._readMapData(mx, my - 1, 1);
		const lowerTiles = [];
		const upperTiles = [];

		if (this._isHigherTile(tileId0))
			upperTiles.push(tileId0);
		else
			lowerTiles.push(tileId0);
		
		if (this._isHigherTile(tileId1))
			upperTiles.push(tileId1);
		else
			lowerTiles.push(tileId1);
		

		lowerTiles.push(-shadowBits);

		if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1))
			if (!Tilemap.isShadowingTile(tileId0))
				lowerTiles.push(tableEdgeVirtualId + upperTileId1);

		if (this._isOverpassPosition(mx, my)) {
			upperTiles.push(tileId2);
			upperTiles.push(tileId3);
		} else {
			if (this._isHigherTile(tileId2))
				upperTiles.push(tileId2);
			else
				lowerTiles.push(tileId2);
			
			if (this._isHigherTile(tileId3))
				upperTiles.push(tileId3);
			else
				lowerTiles.push(tileId3);
			
		}

		lowerBitmap.clearRect(dx, dy, this.tileWidth, this.tileHeight);
		upperBitmap.clearRect(dx, dy, this.tileWidth, this.tileHeight);

		for (let i = 0; i < lowerTiles.length; i++) {
			const lowerTileId = lowerTiles[i];
			if (lowerTileId < 0)
				continue;
			
			if (lowerTileId >= tableEdgeVirtualId)
				MapImage.prototype._drawTableEdge.call(this, lowerBitmap, upperTileId1, dx, dy);
			else
				this._drawTileOldStyle(lowerBitmap, lowerTileId, dx, dy);
		}

		for (let j = 0; j < upperTiles.length; j++)
			this._drawTileOldStyle(upperBitmap, upperTiles[j], dx, dy);
	};

	MapImage.prototype._drawTileOldStyle = function (bitmap, tileId, dx, dy) {
		if (Tilemap.isVisibleTile(tileId)) {
			if (Tilemap.isAutotile(tileId))
				MapImage.prototype._drawAutotile.call(this, bitmap, tileId, dx, dy);
			else
				MapImage.prototype._drawNormalTile.call(this, bitmap, tileId, dx, dy);
		}
	};

	MapImage.prototype._drawAutotile = function (bitmap, tileId, dx, dy) {
		let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
		const kind = Tilemap.getAutotileKind(tileId);
		const shape = Tilemap.getAutotileShape(tileId);
		const tx = kind % 8;
		const ty = Math.floor(kind / 8);
		let bx = 0;
		let by = 0;
		let setNumber = 0;
		let isTable = false;

		if (Tilemap.isTileA1(tileId)) {
			const waterSurfaceIndex = [0, 1, 2, 1][(this.animationFrame || 1) % 4];
			setNumber = 0;
			if (kind === 0) {
				bx = waterSurfaceIndex * 2;
				by = 0;
			} else if (kind === 1) {
				bx = waterSurfaceIndex * 2;
				by = 3;
			} else if (kind === 2) {
				bx = 6;
				by = 0;
			} else if (kind === 3) {
				bx = 6;
				by = 3;
			} else {
				bx = Math.floor(tx / 4) * 8;
				by = ty * 6 + Math.floor(tx / 2) % 2 * 3;
				if (kind % 2 === 0) {
					bx += waterSurfaceIndex * 2;
				} else {
					bx += 6;
					autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
					by += (this.animationFrame || 1) % 3;
				}
			}
		} else if (Tilemap.isTileA2(tileId)) {
			setNumber = 1;
			bx = tx * 2;
			by = (ty - 2) * 3;
			isTable = this._isTableTile(tileId);
		} else if (Tilemap.isTileA3(tileId)) {
			setNumber = 2;
			bx = tx * 2;
			by = (ty - 6) * 2;
			autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
		} else if (Tilemap.isTileA4(tileId)) {
			setNumber = 3;
			bx = tx * 2;
			by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
			if (ty % 2 === 1) {
				autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
			}
		}

		const table = autotileTable[shape];
		const source = this._bitmaps ? this._bitmaps[setNumber] : this.bitmaps[setNumber];

		if (table && source) {
			const w1 = this.tileWidth / 2;
			const h1 = this.tileHeight / 2;
			for (let i = 0; i < 4; i++) {
				const qsx = table[i][0];
				const qsy = table[i][1];
				const sx1 = (bx * 2 + qsx) * w1;
				const sy1 = (by * 2 + qsy) * h1;
				const dx1 = dx + (i % 2) * w1;
				let dy1 = dy + Math.floor(i / 2) * h1;
				if (isTable && (qsy === 1 || qsy === 5)) {
					let qsx2 = qsx;
					const qsy2 = 3;
					if (qsy === 1)
						qsx2 = (4 - qsx) % 4;
					
					const sx2 = (bx * 2 + qsx2) * w1;
					const sy2 = (by * 2 + qsy2) * h1;
					bitmap.blt(source, sx2, sy2, w1, h1, dx1, dy1, w1, h1);
					dy1 += h1 / 2;
					bitmap.blt(source, sx1, sy1, w1, h1 / 2, dx1, dy1, w1, h1 / 2);
				} else {
					bitmap.blt(source, sx1, sy1, w1, h1, dx1, dy1, w1, h1);
				}
			}
		}
	};

	MapImage.prototype._drawNormalTile = function(bitmap, tileId, dx, dy) {
		let setNumber = 0;

		if (Tilemap.isTileA5(tileId))
			setNumber = 4;
		else
			setNumber = 5 + Math.floor(tileId / 256);

		const w = this.tileWidth;
		const h = this.tileHeight;
		const sx = (Math.floor(tileId / 128) % 2 * 8 + tileId % 8) * w;
		const sy = (Math.floor(tileId % 256 / 8) % 16) * h;

		const source = this._bitmaps ? this._bitmaps[setNumber] : this.bitmaps[setNumber];
		if (source)
			bitmap.blt(source, sx, sy, w, h, dx, dy, w, h);
	};

	MapImage.prototype._drawTableEdge = function(bitmap, tileId, dx, dy) {
		if (Tilemap.isTileA2(tileId)) {
			const autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
			const kind = Tilemap.getAutotileKind(tileId);
			const shape = Tilemap.getAutotileShape(tileId);
			const tx = kind % 8;
			const ty = Math.floor(kind / 8);
			const setNumber = 1;
			const bx = tx * 2;
			const by = (ty - 2) * 3;
			const table = autotileTable[shape];

			if (table) {
				const source = this._bitmaps ? this._bitmaps[setNumber] : this.bitmaps[setNumber];
				const w1 = this.tileWidth / 2;
				const h1 = this.tileHeight / 2;
				for (let i = 0; i < 2; i++) {
					const qsx = table[2 + i][0];
					const qsy = table[2 + i][1];
					const sx1 = (bx * 2 + qsx) * w1;
					const sy1 = (by * 2 + qsy) * h1 + h1 / 2;
					const dx1 = dx + (i % 2) * w1;
					const dy1 = dy + Math.floor(i / 2) * h1;
					bitmap.blt(source, sx1, sy1, w1, h1 / 2, dx1, dy1, w1, h1 / 2);
				}
			}
		}
	};

	MapImage.prototype._drawShadow = function(bitmap, shadowBits, dx, dy) {
		if (shadowBits & 0x0f) {
			const w1 = this.tileWidth / 2;
			const h1 = this.tileHeight / 2;
			const color = 'rgba(0,0,0,0.5)';
			for (let i = 0; i < 4; i++) {
				if (shadowBits & (1 << i)) {
					const dx1 = dx + (i % 2) * w1;
					const dy1 = dy + Math.floor(i / 2) * h1;
					bitmap.fillRect(dx1, dy1, w1, h1, color);
				}
			}
		}
	};
	
	//------------------------------------------------------------------------------------------------------------
	// XHR Write/Read JSON
	
	Drag.VisualEvent.loadDataFile = function(name, callback) {
		const url = "data/" + name + ".json";
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.overrideMimeType("application/json");
		xhr.onload = () => this.onXhrLoad(xhr, name, url, callback);
		xhr.onerror = () => this.onXhrError(name, url);
		xhr.send();
	};

	Drag.VisualEvent.onXhrLoad = function(xhr, name, url, callback) {
		if (xhr.status < 400) {
			const data = JSON.parse(xhr.responseText);
			callback(data, name);
		} else
			this.onXhrError(name, url);
	};

	Drag.VisualEvent.onXhrError = function(name, url) {
		console.error(`Couldn't load data file ${url}`);
	};
	
	//------------------------------------------------------------------------------------------------------------
	// FS Write JSON
	
	Drag.VisualEvent.editJSON = function(filepath, filename, filetype, val) {
		if (!Drag.VisualEvent.modules.fs || !filename || !filetype || val === null || val === undefined)
			return;
		
		const file = filepath + filename + "." + filetype;
		try {
			Drag.VisualEvent.modules.fs.readFile(file, 'utf8', (err, data) => {
				if (err) {
					console.error(err);
				} else {
					let obj = JSON.parse(data);
					
					if (Drag.VisualEvent.params.backupData)
						Drag.VisualEvent.createBackup(filename, JSON.parse(data));

					if (Array.isArray(obj) && Array.isArray(val)) {
						const maxId = Math.max(...val.map(v => v && v.id));
						if (maxId > obj.length)
							for (let i = obj.length; i <= maxId; i++)
								if (!obj[i])
									obj[i] = {id: i}; //replace with default value of each type ? actors, weapon, skill... ?
						
						for (const item of val)
							for (const key in item)
								obj[item.id][key] = item[key];
							
					} else if (typeof obj === "object" && typeof val === "object")
						obj = Drag.VisualEvent.mergeMaps(obj, val);
					
					Drag.VisualEvent.writeJSON(file, obj);
				}
			});
		} catch (error) {
			console.error(error);
		}
	};
	
	Drag.VisualEvent.requestBackup = function(filepath, filename, filetype, backupPath, backupFormat, callback) {
		if (!Drag.VisualEvent.modules.fs)
			return;
		
		const file = filepath + filename + "." + filetype;
		
		try {
			Drag.VisualEvent.modules.fs.readFile(file, 'utf8', (err, data) => {
				if (err)
					console.error(err);
				else
					Drag.VisualEvent.createBackup(filename, JSON.parse(data), backupPath, backupFormat, callback);
			});
		} catch (error) {
			console.error(error);
		}
	};
	
	Drag.VisualEvent.createBackup = function(name, data, backupPath, backupFormat, callback) {
		if (!name || !data)
			return;
		
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0"); //month are 0 indexed
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		
		let userDefinedName = backupFormat || "$name_$year-$month-$day-$hours-$minutes-$seconds";
		userDefinedName = 
			Drag.VisualEvent.replaceAll(
				Drag.VisualEvent.replaceAll(
					Drag.VisualEvent.replaceAll(
						Drag.VisualEvent.replaceAll(
							Drag.VisualEvent.replaceAll(
								Drag.VisualEvent.replaceAll(
									Drag.VisualEvent.replaceAll(userDefinedName, '$name', name)
								, '$year', year)
							, '$month', month)
						, '$day', day)
					, '$hours', hours)
				, '$minutes', minutes)
			, '$seconds', seconds);
		if (!userDefinedName.includes(name))
			userDefinedName = name + userDefinedName;
		userDefinedName.replace(/[\\\/:*?"<>|]/g, '' ); // windows unauthorized filename characters 
		
		let src = (backupPath || "data/data_backup/").trim();
		if (src[src.length - 1] !== "/")
			src = src + "/";
		
		const filename = `${src}${userDefinedName}.json`;
		Drag.VisualEvent.writeJSON(filename, data, callback);
	};
	
	Drag.VisualEvent.mergeMaps = function(map1, map2) {
		for (const property in map2)
			if (property === "events")
				for (const ev of map2[property].filter(ev => ev))
					map1[property][ev.id] = ev;
			else
				map1[property] = map2[property];
			
		return map1;
	};
	
	Drag.VisualEvent.writeJSON = function(filename, obj, callback = null, space = 4) {
		if (!Drag.VisualEvent.modules.fs || !obj || !filename)
			return;
		
		try {
			Drag.VisualEvent.ensureDirectoryExistence(filename);
			const data = JSON.stringify(obj, null, space);
			
			Drag.VisualEvent.modules.fs.writeFile(filename, data, function(err) {
				if (err)
					console.error(err);
				else {
					console.log(`Written on ${filename}`);
					if (callback)
						callback();
				}
			});
		} catch (error) {
			console.error(error);
		}
	};
	
	Drag.VisualEvent.ensureDirectoryExistence = function(filePath) {
		if (!Drag.VisualEvent.modules.fs || !Drag.VisualEvent.modules.path)
			return;
		
		const dirname = Drag.VisualEvent.modules.path.dirname(filePath);
		if (Drag.VisualEvent.modules.fs.existsSync(dirname))
			return true;
		
		Drag.VisualEvent.ensureDirectoryExistence(dirname);
		Drag.VisualEvent.modules.fs.mkdirSync(dirname);
	};
	
	//-----------------------------------------------------------------------------------------------------------
	// HTTP
	
	Drag.VisualEvent.getHTTP = function(url, callback) {
		const http = require('http');
		const https = require('https');

		const client = url.toString().indexOf("https") === 0 ? https : http;

		client.get(url, (resp) => {
			let data = '';
			
			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				callback(data);
			});

		}).on("error", (err) => {
			console.error(err);
		});
	};
	
	Drag.VisualEvent.openUrl = function(url) {
		nw.Shell.openExternal(url);
	};
	
	//-----------------------------------------------------------------------------------------------------------
	// Style
	
	Drag.VisualEvent.createCSSStylesheet = function(body) {
		const stylesheet = document.createElement('style');
		stylesheet.type = 'text/css';
		stylesheet.innerHTML = body;
		return stylesheet;
	};
	
	Drag.VisualEvent.addCSSStylesheet = function(document, stylesheet) {
		if (!document || !(stylesheet instanceof HTMLElement))
			return false;
		
		document.querySelector('head').appendChild(stylesheet);
		return true;
	};
	
	Drag.VisualEvent.SVGtoURI = function(svg) {
		return "data:image/svg+xml;base64," + btoa(svg);
	};

	//-----------------------------------------------------------------------------------------------------------
	// Input Fields
	
	Drag.VisualEvent.triggerAllOnReadyOnChange = function(container = document) {
		const elements = container.querySelectorAll('.onReadyOnChange');
		for (const element of elements) {
			if (Drag.VisualEvent.isRadio(element) && !element.checked) {
				element.classList.remove('onReadyOnChange');
				continue;
			}

			if (element.onchange)
				element.onchange();
			
			element.classList.remove('onReadyOnChange');
		}
	};
	
	Drag.VisualEvent.isRadio = function(element) {
		return (element && element.nodeName && Drag.VisualEvent.isInput(element) && element.type.toLowerCase() === "radio");
	};
	
	Drag.VisualEvent.isSelect = function(element) {
		return (element && element.nodeName && element.nodeName.toLowerCase() === "select");
	};
	
	Drag.VisualEvent.isInput = function(element) {
		return (element && element.nodeName && element.nodeName.toLowerCase() === "input");
	};
	
	Drag.VisualEvent.areCommandsInSameBranch = function(commandsList = [], commandIndex1 = 0, commandIndex2 = 0) {
		const command1 = commandsList[commandIndex1];
		const command2 = commandsList[commandIndex2];
		
		for (let i = commandIndex2 + 1; i <= commandIndex1; i++) {
			if (i === commandIndex1)
				return true;
			else if (commandsList[i].indent < command2.indent || (commandsList[i].code === 0 && commandsList[i].indent === command2.indent))
				return false;
		}
		
		return true;
	};
	
	Drag.VisualEvent.getCommandBranchsChilds = function(commandsList = [], commandIndex = 0, includeAssocCommands = false, includeEndCommands = false) {
		const commandIndent = commandsList[commandIndex].indent;
		const commandCode = commandsList[commandIndex].code;
		let childs = [];
		let childIndex = 0;
		for (const [i, command] of commandsList.entries()) {
			if (i <= commandIndex)
				continue;
			
			const isAssocCommand = Drag.VisualEvent.getAssociatedCommands(commandCode).includes(`command${command.code}`);
			if (command.indent <= commandIndent && !isAssocCommand)
				break;
			
			if (commandCode === 102 && command.code === 403 && commandIndent == command.indent)  { //exception for show choice cancel branch 
				childIndex = 7;
				const childLength = Math.max(6 - childs.length, 0); //the math.max shouldn't be useful but just in case
				childs = childs.concat(Array(childLength).fill([]));
			}
				
			if (isAssocCommand && !includeAssocCommands)
				continue;
			
			if (!childs[childIndex])
				childs[childIndex] = [];
				
			if (command.code === 0 && command.indent === commandIndent + 1) {
				if (includeEndCommands)
					childs[childIndex].push(command);
				childIndex++;
				continue;
			};
			
			childs[childIndex].push(command);
		}
		
		return childs;
	};	
	
	// used for show choice select cancel input
	Drag.VisualEvent.toggleCancelBranchChoice = function(input) {
		const node = Drag.VisualEvent.getAncestorById(input, 'graphNode');
		if (input.value === "-2")
			Drag.VisualEvent.getEditor().showNodeOutput(node, 7);
		else
			Drag.VisualEvent.getEditor().hideNodeOutput(node, 7);
	};
	
	Drag.VisualEvent.getFormattedValuesFromInput = function(parameters = [], values = []) {
		const formattedValues = [];
		for (const [i, parameter] of parameters.entries())
			if (parameter.type === "select")
				formattedValues.push(parameter.options[values[i] - (parameter.startValue || 0)]);
			else
				formattedValues.push(values[i]);
		return formattedValues;
	};
	
	Drag.VisualEvent.sanitizeInput = function(input) {
		if (input.type === "number" || input.type === "text") {
			const lastCharIsDot = input.value.slice(-1) === "." || input.value.slice(-1) === ",";
			const isInteger = input.getAttribute('data-inputType') === "integer" || input.getAttribute('data-isInputInteger') === "true";
			const hasFocus = input.ownerDocument.activeElement === input;
			let value = input.value;
			
			if (hasFocus && value === "")
				return;
			
			
			value = value.replace(/[^\d-]+/g, '');
			
			const decimals = parseInt(input.getAttribute('data-decimals'));
			value = Drag.VisualEvent.toFixedNoRounding(value, decimals);
			
			if (!hasFocus && input.max !== "")
				value = Math.min(value, input.max);
			if (!hasFocus && input.min !== "")
				value = Math.max(value, input.min);
			
			if (lastCharIsDot && !isInteger)
				value = value + ".";
			else if (isInteger)
				value = parseInt(value);
			
			input.value = value;
			input.setAttribute('value', value);
		}
	};
	
	//thanks to @Gumbo on Stackoverflow for the regex
	Drag.VisualEvent.toFixedNoRounding = function(numString, decimals) {		
		const regex = new RegExp('^-?\\d+(?:\.\\d{0,' + (decimals || -1) + '})?');
		const res = numString.match(regex);
		return res ? res[0] : numString;
	};
	
	Drag.VisualEvent.roundWithDecimal = function(num, decimals) {
		if (decimals < 0)
			return num;
		
		const factor = parseInt("1" + "0".repeat(decimals)); 
		return Math.round(num * factor) / factor;
	};
	
	Drag.VisualEvent.updatePicture = function(element) {
		if (!element || !element.value)
			return;
		
		const value = element.value;		
		const filename = value.split(',');	
		if (!filename[0])
			return element.style.backgroundImage = "unset";
		
		const isTile = element.getAttribute('data-allowTilesetSelection') === "true" && element.getAttribute('data-tilesetNames') && element.getAttribute('data-tilesetNames').split(',').includes(filename[0]);
		let index = parseInt(value.split(',')[1]) || 0;
		if (isTile)
			index = Drag.VisualEvent.getLinearIndex(index);
		
		const fileCount = parseInt(element.getAttribute('data-filecount')) || 1;
		const src = fileCount > 1 ? JSON.parse(element.getAttribute('data-src')) : element.getAttribute('data-src');
		
		if (isTile)
			element.style.backgroundImage = "url(../../img/tilesets/" + filename[0] + ".png)";
		else if (Array.isArray(src) ? filename.filter(name => name).length > 0 : filename[0])
			element.style.backgroundImage = Array.isArray(src) ? src.map((url, i) => "url(../../" + url + "/" + filename[i] + ".png)").join(', ') : "url(../../" + src + "/" + filename[0] + ".png)";
		
		const isFullCharacterSheet = element.getAttribute('data-isFullCharacterSheet') === "true";
		const isCharacterSheet = element.getAttribute('data-isCharacterSheet') === "true" || isFullCharacterSheet;
		const subImageWidth = parseInt(element.getAttribute('data-subImageWidth'));
		const subImageHeight = parseInt(element.getAttribute('data-subImageHeight'));
		if (!isCharacterSheet && (!subImageWidth || !subImageHeight))
			return;
		
		const image = new Image();
		image.src = !isTile ? Array.isArray(src) ? `../../${src[0]}/${filename[0]}.png` : `../../${src}/${filename[0]}.png` : `../../img/tilesets/${filename[0]}.png`;

		image.onload = function () {		
			const naturalWidth = image.naturalWidth;
			const naturalHeight = image.naturalHeight;

			const isBigImage = filename[0][0] === "$" || filename[0][1] === "$";
			const targetWidth = isTile ? naturalWidth / 16 : (isCharacterSheet ? isBigImage ? naturalWidth / 3 : naturalWidth / 12 : subImageWidth) * (isFullCharacterSheet ? 3 : 1) || naturalWidth;
			const targetHeight = isTile ? naturalHeight / 16 : (isCharacterSheet ? isBigImage ? naturalHeight / 4 : naturalHeight / 8 : subImageHeight) * (isFullCharacterSheet ? 4 : 1) || naturalHeight;

			const frameWidth = element.offsetWidth;
			const frameHeight = element.offsetHeight;
			
			const bgw = naturalWidth * (frameWidth / targetWidth) ;
			const bgh = naturalHeight * (frameHeight / targetHeight) ;
			element.style.backgroundSize = `${bgw}px ${bgh}px`;
			
			const col = parseInt(naturalWidth / targetWidth);
			const colIndex = index % col;
			const rowIndex = Math.floor(index / col);
			
			const bgpy = -(frameHeight * rowIndex);
			const bgpx = -(frameWidth * colIndex);
			element.style.backgroundPosition = `${bgpx}px ${bgpy}px`;
		};
	};
	
	Drag.VisualEvent.getLinearIndex = function(index) {
		if (index > 255)
			index -= 256;
		
		if (index < 128) {
			const row = Math.floor(index / 8);
			const col = index % 8;
			return row * 16 + col;
		} else {
			const offsetIndex = index - 128;
			const row = Math.floor(offsetIndex / 8);
			const col = offsetIndex % 8 + 8;
			return row * 16 + col;
		}
	};
	
	Drag.VisualEvent.linearToTilesetIndex = function(index) {
		const col = index % 16;
		const row = Math.floor(index / 16);
		return col < 8 ? row * 16 + col : row * 16 + col + 128 - 8;
	};
		
	Drag.VisualEvent.playAudio = function(input, parameters) {
		if (parameters)
			switch (parameters.type) {
				case "bgm": 
					AudioManager.playBgm(parameters);
					input.ownerDocument.defaultView._bgmPlaying = true;
					break;
				case "me": 
					AudioManager.playMe(parameters);
					input.ownerDocument.defaultView._mePlaying = true;
					break;
				case "bgs": 
					AudioManager.playBgs(parameters);
					input.ownerDocument.defaultView._bgsPlaying = true;
					break;
				case "se": 
					AudioManager.playSe(parameters);
					input.ownerDocument.defaultView._sePlaying = true;
					break;
			}
	};
		
	Drag.VisualEvent.stopAudio = function(input, type) {
		switch (type) {
			case "bgm":
				AudioManager.stopBgm();
				input.ownerDocument.defaultView._bgmPlaying = false;
				break;
			case "me":
				AudioManager.stopMe();
				input.ownerDocument.defaultView._mePlaying = false;
				break;
			case "bgs":
				AudioManager.stopBgs();
				input.ownerDocument.defaultView._bgsPlaying = false;
				break;
			case "se":
				AudioManager.stopSe();
				input.ownerDocument.defaultView._sePlaying = false;
				break;
		}
	};
		
	Drag.VisualEvent.updateAudio = function(input, parameters) {
		switch (parameters.type) {
			case "bgm":
				if (input.ownerDocument.defaultView._bgmPlaying)
					Drag.VisualEvent.playAudio(input, parameters);
				break;
			case "me":
				if (input.ownerDocument.defaultView._mePlaying)
					Drag.VisualEvent.playAudio(input, parameters);
				break;
			case "bgs":
				if (input.ownerDocument.defaultView._bgsPlaying)
					Drag.VisualEvent.playAudio(input, parameters);
				break;
			case "se":
				if (input.ownerDocument.defaultView._sePlaying)
					Drag.VisualEvent.playAudio(input, parameters);
				break;
		}
	};	
	
	Drag.VisualEvent.getAncestorById = function(element, id = "") {
		let parent = element.parentElement;
		while (parent && parent.id.trim().toLowerCase() !== id.trim().toLowerCase() && parent !== document.body)
			parent = parent.parentElement;
		
		return parent;
	};
	
	Drag.VisualEvent.getFolderList = function(sPath) {
		if (!Drag.VisualEvent.modules.fs || !Drag.VisualEvent.modules.path)
			return;	
		
		const folders = sPath.map(dirPath => {
			const filesAndFolders = Drag.VisualEvent.modules.fs.readdirSync(dirPath);
			const folders = filesAndFolders.filter((item) => {
				const itemPath = Drag.VisualEvent.modules.path.join(dirPath, item);
				const stats = Drag.VisualEvent.modules.fs.statSync(itemPath);
				return stats.isDirectory();
			});
			
			return folders;
		});
		
		return folders;
	};
	
	Drag.VisualEvent.getFileList = function(path = '', types = '*') {
		if (!Drag.VisualEvent.modules.fs || !Drag.VisualEvent.modules.path)
			return;
		
		if (!Drag.VisualEvent.modules.fs.existsSync(path))
			return [];
		
		const filesAndFolders = Drag.VisualEvent.modules.fs.readdirSync(path);
		const files = filesAndFolders.filter((item) => {
			const itemPath = Drag.VisualEvent.modules.path.join(path, item);
			const extName = Drag.VisualEvent.modules.path.extname(itemPath);
			const stats = Drag.VisualEvent.modules.fs.statSync(itemPath);
			return stats.isFile() && (types.includes(extName) || types === '*');
		});
		
		return files;
	};
	
	Drag.VisualEvent.getMapList = function() {
		if (!Drag.VisualEvent.modules.fs ||!Drag.VisualEvent.modules.path)
			return;
		
		const filesAndFolders = Drag.VisualEvent.modules.fs.readdirSync("data/");

		const files = filesAndFolders.filter((item) => {
			const itemPath = Drag.VisualEvent.modules.path.join("data/", item);
			const extName = Drag.VisualEvent.modules.path.extname(itemPath);
			const stats = Drag.VisualEvent.modules.fs.statSync(itemPath);
			const mapRegex = /^Map\d{3}\.json$/;
			return stats.isFile() && extName === ".json" && mapRegex.test(item);
		});

		return files;
	};
	
	Drag.VisualEvent.getMapFileName = function(mapId) {
		return `Map${String(mapId).padStart(3, "0")}`;	
	};
	
	Drag.VisualEvent.getMapName = function(mapId) {
		if ($dataMapInfos && $dataMapInfos[mapId])
			return $dataMapInfos[mapId].name;
		else 
			return "";
	};
	
	Drag.VisualEvent.extractMapId = function(name = "") {
		return parseInt(name.replace('Map', '').replace('.json', ''));
	};
	
	Drag.VisualEvent.getCurrentMapId = function() {
		return $dataMap ? $dataMap.mapId : 0; 
	};
	
	Drag.VisualEvent.getDatabaseData = function(type) {
		const editorData = Drag.VisualEvent.getEditor().data;
		if (type === "map_event")
			// return dataMap ? dataMap.events.filter(ev => ev) : [];
			return editorData.loadedMap ? editorData.loadedMap.events.filter(ev => ev) : [];
		else if (type === "switch" || type === "variable") {
			const dataType = Drag.VisualEvent.getDatabaseTypePlural(type).toLowerCase();
			return editorData.$dataSystem[`${dataType}`] ? editorData.$dataSystem[`${dataType}`].filter((data, index) => index > 0).map((data, index) => ({id: index + 1, name: data})) : [];
		} else if (type === "equipment_type")
			return editorData.$dataSystem.equipTypes.slice(1).map((type, index) => ({name: type === "" ? `#${(index + 1).toString().padStart(2, "0")}` : type, id: index + 1}));
		else if (type === "element_type")
			return editorData.$dataSystem.elements.slice(1).map((type, index) => ({name: type === "" ? `#${(index + 1).toString().padStart(2, "0")}` : type, id: index + 1}));
		else {
			const dataType = Drag.VisualEvent.capitalizeAll(Drag.VisualEvent.replaceAll(Drag.VisualEvent.getDatabaseTypePlural(type), "_", " "), ""); 
			return editorData[`$data${dataType}`] ? editorData[`$data${dataType}`].filter(data => data) : [];
		}
	};
	
	Drag.VisualEvent.getDatabaseTypePlural = function(type) {
		if (type === "enemy")
			return "enemies";
		if (type === "class")
			return "classes";
		if (type === "switch")
			return "switches";
		return `${type}s`;
	};
	
	Drag.VisualEvent.capitalize = function(word) {
		return word[0].toUpperCase() + word.slice(1);
	};
	
	Drag.VisualEvent.capitalizeAll = function(sentence, joiner = " ") {
		return sentence.split(" ").map(word => Drag.VisualEvent.capitalize(word)).join(joiner);
	};
	
	Drag.VisualEvent.escapeQuotes = function(string = "", useBackslash = false) {
		if (typeof string === "string")
			if (useBackslash)
				string = string.replace(/"/g, '\\"').replace(/'/g, "\\'");
			else
				string = string.replace(/"/g, '&quot;').replace(/'/g, "&apos;");
		
		return string;
	};
	
	Drag.VisualEvent.unescapeQuotes = function(string = "", useBackslash = false) {
		if (typeof string === "string")
			if (useBackslash)
				string = string.replace(/\\"/g, '"').replace(/\\'/g, "'");
			else
				string = string.replace(/&quot;/g, '"').replace(/&apos;/g, "'");

		return string;
	};
	
	Drag.VisualEvent.getListInputButtons = function(minList = 0) {
		return `
			<span style="display: inline-block; vertical-align: top; cursor: pointer; height: 1.5em;" id="add-list-input-button" onclick="$.Drag.VisualEvent.onAddListInput(this);">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="height: 1.5em; width: 1.5em">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"></circle>
					<line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
					<line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
				</svg>
			</span>
			<span style="cursor: pointer; height: 1.5em;" id="remove-list-input-button" ${minList ? `data-minList="${minList}"` : ''} onclick="$.Drag.VisualEvent.onRemoveListInput(this);">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="height: 1.5em; width: 1.5em"  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="8" y1="12" x2="16" y2="12"></line>
				</svg>
			</span>
		`;
	};
	
	Drag.VisualEvent.onAddListInput = function(button) {
		const clone = Drag.VisualEvent.addListInput(button);
		Drag.VisualEvent.onInputChange(button);
		
		const editor = Drag.VisualEvent.getEditor();
		if (button.ownerDocument.defaultView === editor) {
			const node = Drag.VisualEvent.getAncestorById(button, 'graphNode');
			if (node)
				editor.cacheGraphNode(node);
		}
		
		return clone;
	};
	
	Drag.VisualEvent.addListInput = function(button) {
		if (!button)
			return;
		
		const clone = button.parentElement.cloneNode(true);
		const node = Drag.VisualEvent.getAncestorById(button, 'graphNode');
		const editor = Drag.VisualEvent.getEditor();
		
		//attribute unique id to radios
		const radios = Array.from(clone.querySelectorAll('input[type="radio"]'));
		const id = `nodeRadioInput${Drag.VisualEvent.getUniqueId()}`;
		for (const radio of radios) {
			radio.setAttribute('id', id);
			radio.setAttribute('name', id);
			radio.previousElementSibling.setAttribute('for', id);
		}
		
		if (node && editor) {
			//deconnect connections
			const connections = Array.from(clone.querySelectorAll('.exec.inputConnection')).concat(Array.from(clone.querySelectorAll('.exec.outputConnection')));
			for (const connection of connections)
				editor.setConnectionConnected(connection, false);
		}
		
		//add element
		button.parentElement.after(clone);
		
		if (node && editor) {
			editor.refreshNodeConnections(node);
			editor.refreshNode(node);
		}
		
		return clone;
	};
	
	Drag.VisualEvent.onRemoveListInput = function(button) {
		if (!button)
			return;
		
		const node = Drag.VisualEvent.getAncestorById(button, 'graphNode');
		const editor = Drag.VisualEvent.getEditor();
		
		//prevent action if last list element or min list requires it
		const parent = button.parentElement.parentElement; 
		const listElementCount = Array.from(parent.querySelectorAll('#add-list-input-button')).length;
		const minList = parseInt(button.getAttribute('data-minList')) || 1;
		if (listElementCount <= minList) 
			return;
		
		if (node && editor) {
			//remove curve if contains connected connections
			const connections = Array.from(button.parentElement.querySelectorAll('.exec.inputConnection')).concat(Array.from(button.parentElement.querySelectorAll('.exec.outputConnection')));
			for (const connection of connections)
				editor.removeConnectionCurves(connection);
		}
		
		//remove element
		button.parentElement.remove(); 
		
		if (node && editor) {
			editor.refreshNodeConnections(node);
			editor.refreshNode(node);
		}
		
		Drag.VisualEvent.onInputChange(parent);
		if (node && editor)
			editor.cacheGraphNode(node);
	};
	
	Drag.VisualEvent.getDefaultValueButton = function() {
		return `
			<span style="cursor: pointer; height: 24px;" onclick="$.Drag.VisualEvent.restoreInputDefaultValue(this);">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 4V2L8 5L12 8V6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12H4C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4Z" 
						style="stroke-width: 1px; fill: currentColor; stroke-linecap: initial; stroke: currentColor;" />
				</svg>
			</span>
		`;
	};
	
	Drag.VisualEvent.restoreInputDefaultValue = function(input) {
		if (!input)
			return;
		
		const defaultValue = input.getAttribute('data-defaultValue');
		if (defaultValue === undefined)
			return;
		
		if (input.type === "radio" && defaultValue === input.value)
			input.checked = true;
		else if (input.type === "checkbox")
			input.checked = defaultValue !== "false";
		else 
			input.value = defaultValue;
		
		if (input.onchange)
			input.onchange();
		
		if (input.onblur)
			input.onblur();
	};
	
	Drag.VisualEvent.getInputValue = function(input) {
		if (input.getAttribute("data-inputType") === "moveRoute") {
			const eventId = parseInt(input.getAttribute("data-eventId")) || 0;
			const repeat = input.getAttribute("data-repeat") === "true";
			const wait = input.getAttribute("data-wait") === "true";
			const skippable = input.getAttribute("data-skip") === "true";
			
			const parameters = JSON.parse(input.getAttribute("data-parameters"));
			const list = JSON.parse(input.getAttribute("data-list")).map((code, i) => (parameters[i] !== null ? {code: code, indent: null, parameters: parameters[i]} : code !== 0 ? {code: code, indent: null} : {code: code}));
			
			return [eventId, {list: list, repeat: repeat, skippable: skippable, wait: wait}];
		}
		
		const valueCount = input.getAttribute('data-valueCount') || 1;
		const inputValue = input.getAttribute('data-value') ? input.getAttribute('data-value') : input.value;
		const values = valueCount > 1 ? inputValue.split(',') : [inputValue];
		
		for (const [i, value] of values.entries()) {
			if (input.type === "radio")
				values[i] = input.checked ? parseInt(value) : null;
			
			else if (input.type === "number" || input.getAttribute('data-inputType') === "range" || input.getAttribute('data-inputType') === "integer" || input.getAttribute('data-inputType') === "number" || input.getAttribute('data-dataType') === "number")
				values[i] = Number(value);
			
			else if (Drag.VisualEvent.databaseTypes.includes(input.getAttribute('data-inputType')))
				values[i] = isNaN(Number(value)) ? Number(input.getAttribute('data-defaultValue')) : Number(value);
			
			else if (input.type === "checkbox")
				return input.checked;
		
			else if (input.getAttribute('data-inputType') === "boolean" || input.getAttribute('data-dataType') === "boolean")
				values[i] = Boolean(value);
			
			else if (input.getAttribute('data-inputType') === "image" && valueCount > 1 && parseInt(input.getAttribute('data-fileCount') || 1) <= 1)
				values[1] = Number(values[1]);
			
			else if (input.getAttribute('data-inputType') === "color")
				return [Drag.VisualEvent.RGBtoNegRGB(Drag.VisualEvent.hexAtoRGBA(value))];
		}
		
		return (values.length > 1 ? values : values[0]);
	};
	
	Drag.VisualEvent.setInputValue = function(input, value) {
		const inputType = input.getAttribute('data-inputType');
		if (inputType === 'moveRoute') {
			input.setAttribute('data-eventId', value[0]);
			input.setAttribute('data-repeat', value[1].repeat);
			input.setAttribute('data-wait', value[1].wait);
			input.setAttribute('data-skip', value[1].skippable);
			
			const parameters = JSON.stringify(value[1].list.map(command => command.parameters));
			const list = JSON.stringify(value[1].list.map(command => command.code));
			input.setAttribute('data-parameters', parameters);
			input.setAttribute('data-list', list);
			
			input.dispatchEvent(new Event('change', {bubbles: true}));
			return;
		}
		
		const valueCount = input.getAttribute('data-valueCount') || 1;
		
		if (Array.isArray(value))
			// value = value.slice(0, valueCount).join(',');
			value = value.join(',');
		
		if (input.type === "checkbox")
			input.checked = value === true;
		else if (inputType === "boolean" || input.getAttribute('data-dataType') === "boolean")
			input.value = Boolean(value);
		else if (input.type === "radio") {
			input.checked = parseInt(input.value) === value;
			if (!input.checked)
				return;
		} else if (inputType === "color") {
			value = value.split(',').map(Number);
			if (value.length > 3)
				value.length = 3;
			input.value = Drag.VisualEvent.RGBAToHexA(Drag.VisualEvent.negrgbtorgb(value, true));
		} else if (Drag.VisualEvent.databaseTypes.includes(inputType))
			Drag.VisualEvent.setDatabaseInputFieldValue(input, value);
		else {
			input.value = value;
			if (input.hasAttribute('data-value'))
				input.setAttribute('data-value', value);
		}
		
		if (inputType === "text")
			Drag.VisualEvent.autoFitTextArea(input);
		
		input.dispatchEvent(new Event('change', {bubbles: true}));
	};
	
	Drag.VisualEvent.getPluginCommandInputsValues = function(inputs) {
		//regroup list inputs
		const lists = {};
		const listInputs = inputs.filter(input => input.getAttribute('data-isList') === "true");
		for (const input of listInputs) {
			const parameterName = input.getAttribute('data-parameterName');
			if (!lists[parameterName])
				lists[parameterName] = [];
			lists[parameterName].push(input);
		}
		
		for (const parameterName in lists) {
			const list = lists[parameterName];
			const index = inputs.indexOf(list[0]);
			inputs.splice(index, list.length, list);
		}
		
		return Object.assign({}, ...inputs.map((input) => { 
			if (Array.isArray(input)) {
				const parameterName = input[0].getAttribute('data-parameterName');
				return {[parameterName]: JSON.stringify(input.map(item => Drag.VisualEvent.getPluginCommandInputValue(item)))};
			}
			
			const parameterName = input.getAttribute('data-parameterName');
			const parameterValue = Drag.VisualEvent.getPluginCommandInputValue(input);
			return {[parameterName]: parameterValue};
		}));
	};
	
	Drag.VisualEvent.getPluginCommandInputValue = function(input) {
		const inputType = input.getAttribute("data-inputType");
		let parameterValue;
		if (inputType === "location") {
			const locationValue = input.getAttribute('data-value').split(',')
			return `{"mapId":"${locationValue[0]}","x":"${locationValue[1]}","y":"${locationValue[2]}"}`;
		} else if (inputType === "struct")
			// return JSON.parse(Drag.VisualEvent.unescapeQuotes(input.getAttribute('data-structValue'), true));
			return input.getAttribute('data-structValue');
		else
			// return Drag.VisualEvent.getInputValue(input);
			return input.getAttribute('data-value') !== null ? input.getAttribute('data-value') : input.value;
		
		return parameterValue;
	};
	
	Drag.VisualEvent.setPluginCommandInputValue = function(input, value, owner = input.ownerDocument) {
		const inputType = input.getAttribute("data-inputType");
		
		if (inputType === "radio")
			owner.querySelector(`#${input.id}[value="${value}"]`).checked = true;
		else if (inputType === "location") {
			const parsed = typeof value === "string" ? JSON.parse(value) : value;
			input.value = `Map${String(parsed.mapId || 0).padStart(3, '0')}: x: ${parsed.x || 0}, y: ${parsed.y || 0}`;
			input.setAttribute('data-value', `${parsed.mapId || 0},${parsed.x || 0},${parsed.y || 0}`);
		} else if (Drag.VisualEvent.databaseTypes.includes(inputType))
			Drag.VisualEvent.setDatabaseInputFieldValue(input, value);
		else if (inputType === "struct")
			if (typeof value === "object")
				input.setAttribute('data-structValue', Drag.VisualEvent.escapeQuotes(JSON.stringify(value)));
			else
				input.setAttribute('data-structValue', value);
		else {
			input.value = value;
			if (input.hasAttribute('data-value'))
				input.setAttribute('data-value', value);
		}
			
		if (inputType === "text")
			Drag.VisualEvent.autoFitTextArea(input);			
		
		input.dispatchEvent(new Event('change', {bubbles: true}));
		input.dispatchEvent(new Event('blur', {bubbles: true}));
	};
	
	Drag.VisualEvent.onInputChange = function(input) {
		if (!input)
			return;
		
		if (typeof input.ownerDocument.defaultView.onInputChange === 'function')
			input.ownerDocument.defaultView.onInputChange(input);
	};
	
	Drag.VisualEvent.getInputField = function(params, index = null, controller = null) {
		if (!params)
			return ``;
		
		if (params.evalOptions) 
			params.options = eval(params.evalOptions);
		
		if (!params.type || params.type === "multiline_string")
			params.type = "text";
		
		if (params.type === "boolean")
			params.type = "radio";
		
		if (params.type === "note")
			params.type = "text";
		
		params.onchange = `${params.onchange ? params.onchange : ''} $.Drag.VisualEvent.onInputChange(this);`;
		
		params.data = params.data || "";
		params.data += `${params.valueCount ? `data-valueCount="${params.valueCount}"` : ""} data-inputType="${params.type}" ${params.isList ? `data-isList="true" data-listId="${Drag.VisualEvent.getUniqueId()}"` : ''} data-defaultValue="${Drag.VisualEvent.escapeQuotes(params.default)}"`

		if (Array.isArray(params.value))
			params.value = params.value.map(val => Drag.VisualEvent.escapeQuotes(val))
		else if (typeof params.value === "string")
			params.value = Drag.VisualEvent.escapeQuotes(params.value);
		
		if (params.type === "string" && params.isOutput) {
			params.onchange += " $.Drag.VisualEvent.autoFitInput(this);";
			params.style = "flex-grow: 1;"
		}
		
		if ((params.value === "" || params.value === undefined) && params.default !== undefined)
			if (params.isList)
				try { params.value = JSON.parse(params.default)[0]; } catch(err) { params.value = []; }
			else
				params.value = params.default;
		
		if (Drag.VisualEvent.databaseTypes.includes(params.type))
			return Drag.VisualEvent.getDatabaseInputField(params, index, controller) + (params.isList ? Drag.VisualEvent.getListInputButtons() : '');
		
		const type = Drag.VisualEvent.capitalize(params.type);
		const inputFieldFunction = `get${type}InputField`;
		if (typeof Drag.VisualEvent[inputFieldFunction] !== "function")
			return Drag.VisualEvent.getDefaultInputField(params, index, controller) + (params.isList ? Drag.VisualEvent.getListInputButtons() : '');
		else
			return Drag.VisualEvent[inputFieldFunction](params, index, controller) + (params.isList ? Drag.VisualEvent.getListInputButtons() : '');
		
		return "";
	};
	
	Drag.VisualEvent.getDefaultInputField = function(params, index, controller = null) {
		return `<input type="text" class="${params.class || ''}" value="${params.value || params.default || ''}" 
			${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} 
			onchange="${params.onchange || ''}"
		/>`;
	};
	
	Drag.VisualEvent.getStructInputField = function(params, index, controller = null) {
		if (params.value && typeof params.value === "object")
			params.value = JSON.stringify(params.value);
		
		const value = Drag.VisualEvent.escapeQuotes(params.value).trim() || '{}';
		return `<input 
			type="text" class="${params.class || ''}" value="Open Structure Manager" ${params.disabled ? 'disabled' : ''} 
			style="cursor: pointer;" 
			${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} data-structValue="${value}" data-pluginName="${params.pluginName}" data-structName="${params.structName}" data-noReset="true"
			onclick="this.blur(); $.Drag.VisualEvent.openStructureManager(this);" onchange="${params.onchange || ''}"
		/>`;
	};
	
	Drag.VisualEvent.getListInputField = function(params) {
		const inputs = []; 
		const parameters = params.inputs.map(input => Drag.VisualEvent.getInputParameters(input));
		for (const param of parameters)
			inputs.push(`<div><label>${param.name || ''}</label>${Drag.VisualEvent.getInputField(param)}</div>`);
		
		return `
			<div id="list-wrapper">
				<div style="border-top: 0.0625em solid white; padding: 0.5em 0em 0.5em 0.5em; text-align: center;">
					<div class="rowGap05em" style="display: flex; flex-direction: column; margin-bottom: 0.5em; text-align: left;">
						${inputs.join('')}
					</div>
					${Drag.VisualEvent.getListInputButtons()}
				</div>
			</div>
		`;
	};
	
	Drag.VisualEvent.getTextInputField = function(params, index, controller = null) {
		return `
			<div style="display: flex; align-items: flex-start;">
				<textarea onchange="${params.onchange || ''} if (this.nextElementSibling.firstElementChild.checked) $.Drag.VisualEvent.autoFitTextArea(this);" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();" 
					class="unfitTextArea ${params.class || ''}" id="${params.id || ''}" placeholder="${params.placeholder || ''}" ${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} unfit
				>${params.value || params.default || ''}</textarea>
				${params.noAutofitCheckbox ? '' : `
					<div class="flex" style="align-items: center; margin-top: 0.3125em; margin-left: 0.3125em;">
						<input id="autofit-textarea-checkbox" title="Autofit textarea" type="checkbox"/>
						<span title="Autofit textarea" style="margin-left: -1.25em; height: 1.5625em;">
							<svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path style="stroke-width: 1; fill: white;" d="M20 6.24219C20 4.99955 18.9926 3.99219 17.75 3.99219H6.25C5.00736 3.99219 4 4.99955 4 6.24219V10.2422C4 10.6564 4.33579 10.9922 4.75 10.9922C5.16421 10.9922 5.5 10.6564 5.5 10.2422V6.24219C5.5 5.82797 5.83579 5.49219 6.25 5.49219H17.75C18.1642 5.49219 18.5 5.82797 18.5 6.24219V10.2422C18.5 10.6564 18.8358 10.9922 19.25 10.9922C19.6642 10.9922 20 10.6564 20 10.2422V6.24219Z"></path>
								<path style="stroke-width: 1; fill: white;" d="M17.2188 13.2197C17.4851 12.9534 17.9018 12.9292 18.1954 13.1471L18.2795 13.2197L20.6496 15.5871C20.858 15.7128 21 15.9629 21 16.2509C21 16.503 20.8911 16.726 20.7242 16.862L20.6493 16.9148L18.2795 19.282L18.1954 19.3546C17.9344 19.5482 17.5762 19.5506 17.3128 19.3618L17.2188 19.282L17.1462 19.1979C16.9526 18.9369 16.9502 18.5787 17.1391 18.3153L17.2188 18.2213L18.44 17H14.6562L14.5671 16.9931C14.2468 16.9434 14 16.6296 14 16.2499C14 15.8702 14.247 15.5565 14.5673 15.5068L14.6563 15.5H18.44L17.2188 14.2803L17.1462 14.1962C16.9284 13.9026 16.9526 13.4859 17.2188 13.2197Z"></path>
								<path style="stroke-width: 1; fill: white;" d="M6.78115 13.2226C7.04742 13.4889 7.07162 13.9055 6.85377 14.1991L6.78115 14.2832L5.56 15.5029H9.34367C9.7061 15.5029 10 15.8386 10 16.2528C10 16.6325 9.75319 16.9464 9.43288 16.9961L9.34383 17.0029H5.56L6.78115 18.2242C7.04742 18.4905 7.07162 18.9072 6.85377 19.2008L6.78115 19.2849C6.51488 19.5512 6.09822 19.5754 5.80461 19.3575L5.72049 19.2849L3.35072 16.9177C3.14219 16.7921 3 16.5419 3 16.2538C3 15.9658 3.14201 15.7157 3.35039 15.59L5.72049 13.2226C6.01338 12.9297 6.48826 12.9297 6.78115 13.2226Z"></path>
							</svg>
						</span>
					</div>`
				}
			</div>
		`;
	};
	
	Drag.VisualEvent.canvas = document.createElement('canvas');
	Drag.VisualEvent.ctx = Drag.VisualEvent.canvas.getContext('2d');
	
	Drag.VisualEvent.measureTextWidth = function(textArea, text) {
		const style = window.getComputedStyle(textArea);
		Drag.VisualEvent.ctx.font = style.font;
		return Drag.VisualEvent.ctx.measureText(text || ' ').width;
	};

	Drag.VisualEvent.autoFitTextArea = function(textArea) {		
		if (textArea.getAttribute('data-resizeWidth') !== "false") {
			// textArea.style.width = "";
			// textArea.style.width = (Math.max(...textArea.value.split('\n').map(text => text.length)) + 2) * 8 + "px";
			textArea.style.width = Math.max(...textArea.value.split('\n').map(line => Drag.VisualEvent.measureTextWidth(textArea, line))) + 8 + "px";
		}
		
		if (textArea.getAttribute('data-resizeHeight') !== "false") {
			textArea.style.height = ""; 
			textArea.style.height = textArea.scrollHeight + 5 + "px";
		}
	};
	
	Drag.VisualEvent.getStringInputField = function(params, index, controller = null) {
		return `
			<input onchange="${params.onchange || ''}" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();" onclick="${params.onclick || ''}" onfocus="${params.onfocus || ''}"
				type="text" class="${params.class || ''}" id="${params.id ? params.id : ''}" placeholder="${params.placeholder || ''}" value="${params.value || params.default || ''}" 
				${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} style="${params.style ? params.style : ''}">`;
	};
	
	Drag.VisualEvent.autoFitInput = function(input) {
		const flexGrow = input.style.flexGrow === "1";
		if (flexGrow)
			input.style.flexGrow = "0";
		
		input.style.width = "1px";
		input.style.minWidth = "1px";
		input.style.minWidth = input.scrollWidth + 5 + "px";
		input.style.removeProperty("width");
		
		if (flexGrow)
			input.style.flexGrow = "1";
	};
	
	Drag.VisualEvent.getNumberInputField = function(params, index, controller = null) {
		let value = params.value !== undefined ? params.value : params.default !== undefined ? params.default : 0;
		if (isNaN(parseFloat(value)))
			value = 0;
		
		return `
			<div class="relative">
				<input type="number" id="${params.id ? params.id : ''}" class="${params.class || ''}"
					value="${value}" ${params.max !== undefined ? `max="${params.max}"` : ''} ${params.min !== undefined ? `min="${params.min}"` : ''} placeholder="${params.placeholder || ''}" 
					onchange="$.Drag.VisualEvent.sanitizeInput(this); ${params.onchange || ''}" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"
					data-decimals="${params.decimals ? params.decimals : "0"}" ${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} />
				${params.tooltip ? `<span class="input-tooltip" data-tooltip="${params.tooltip}"></span>` : ''}
			</div>	
		`;
	};
	
	Drag.VisualEvent.getIntegerInputField = function(params, index, controller = null) {
		let value = params.value !== undefined ? params.value : params.default !== undefined ? params.default : 0;
		if (isNaN(parseInt(value)))
			value = 0;
		
		return `
			<div class="relative">
				<input type="number" id="${params.id ? params.id : ''}" class="${params.class || ''}" 
					value="${value}" ${params.max !== undefined ? `max="${params.max}"` : ''} ${params.min !== undefined ? `min="${params.min}"` : ''} placeholder="${params.placeholder || ''}" 
					onchange="$.Drag.VisualEvent.sanitizeInput(this); ${params.onchange || ''}" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"
					data-isInputInteger="true" ${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} 
				/>
				${params.tooltip ? `<span class="input-tooltip" data-tooltip="${params.tooltip}"></span>` : ''}
			</div>	
		`;
	};
	
	Drag.VisualEvent.getCheckboxInputField = function(params, index, controller = null) {
		return `
			<div class="flex" style="align-items: center;">
				<input type="checkbox" id="${params.id ? params.id : ''}" class="${params.class || ''}" onchange="${params.onchange || ''}" ${params.value ? 'checked': ''} ${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} />
				${params.name && params.showName ? `<span style="margin-left: 0.5em; cursor: pointer;" onclick="$.Drag.VisualEvent.toggleCheckbox(this.previousElementSibling);">${params.name}</span>` : ''}
			</div>
		`;
	};
	
	Drag.VisualEvent.toggleCheckbox = function(checkbox) {
		if (checkbox.disabled)
			return;
		
		checkbox.checked = !checkbox.checked;
		if (checkbox.onchange)
			checkbox.onchange();
	};
	
	Drag.VisualEvent.getSelectInputField = function(params, index, controller = null) {
		return `
			<div class="select">
				<select ${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} id="${params.id ? params.id : ''}" class="${params.class || ''}" onchange="${params.onchange || ''}" ${params.disabled ? 'disabled' : ''}>
					${(function fun() {
						let res = '';
						for (const [i, option] of params.options.entries()) {
							if (!option)
								continue
							
							let value = params.values ? params.values[i] : params.startValue ? i + params.startValue : i;
							value = params.evalOptionsValue ? eval(params.evalOptionsValue) : value;
							res += `
								<option ${params.value == value ? 'selected' : ''} value="${value}">${option}</option>
							`;
						}
						return res;
					})()}
				</select>
				<span class="focus"></span>
			</div>
		`;	
	};
	
	Drag.VisualEvent.getDatabaseInputField = function(params, index, controller = null) {
		if (!params.addOptions || !Array.isArray(params.addOptions))
			params.addOptions = [];
		if (params.isPluginParameter)
			params.addOptions.push("None");
		
		const databaseOptions = Drag.VisualEvent.getDatabaseData(params.type);
		params.options = params.addOptions.map((option, optionId) => ({id: optionId - params.addOptions.length + 1, name: option})).concat(databaseOptions);
		
		const defaultId = params.default !== undefined ? params.default : 1;
		const id = Math.max(params.value !== undefined ? params.value : defaultId, -params.addOptions.length + 1);
		
		let optionValue = params.options.find(option => option.id === id);
		if (!optionValue) {
			optionValue = {id: id, name: "??? [NOT IN DB]"};
			params.options.push(optionValue);
		}
		
		const padId = String(id).padStart(4, "0");
		const name = optionValue.name;
		const literalValue = id <= 0 ? name : `${padId}: ${name}`;
		const literalsOptions = params.options.map(option => `<option ${id === option.id ? 'selected' : ''} value="${option.id}">${option.id > 0 ? String(option.id).padStart(4, "0") + ': ' : ''}${option.name || ''}</option>`);
		
		if (params.isInteractiveController === true)
			params.data = `data-behavior="${JSON.stringify([-1].concat(params.options.map((option, index) => index)))}" ${params.data || ''}`;
		
		if (params.onchange)
			params.onchange = params.onchange.replace('$.Drag.VisualEvent.onInputChange(this);', '').replace('handleInteractiveInput(this, this.parentElement.parentElement);', '').trim();
	
		return `
			<div class="relative flex" style="align-items: center">
				<input
					type="text" class="${params.class ? params.class : ''}" id="${params.id ? params.id : ''}" value="${literalValue}" placeholder="${params.placeholder || ''}"
					${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} data-value="${id}"
					onchange="$.Drag.VisualEvent.onInputComboChange(this); ${params.isInteractiveController ? 'handleInteractiveInput(this, this.parentElement.parentElement);' : ''}" 
					oninput="this.onchange();" onfocus="$.Drag.VisualEvent.onInputComboFocus(this);"
					onblur="$.Drag.VisualEvent.onInputComboBlur(this);" ${params.onchange ? `data-onchange="${params.onchange}"` : ''}
					${params.disabled ? 'disabled' : ''} style="min-width: 12.5em;"
				>
				<select 
					onmouseover="$.Drag.VisualEvent.onSelectMouseOver(this);" onmouseout="$.Drag.VisualEvent.onSelectMouseOut(this);"
					onchange="$.Drag.VisualEvent.onSelectComboChange(this);" onclick="this.onchange();" onblur="$.Drag.VisualEvent.hideSelect(this);"
					class="hidden" style="display: list-item; position: absolute; top: calc(100% - 2px); padding-top: 0px; padding-bottom: 0px; padding-left: 7px; overflow-y: scroll; background-color: var(--background-color); border: 1px solid var(--color); z-index: 2;"
				>
					${literalsOptions.join("")}			
				</select>
				${params.type === "switch" || params.type === "variable" ? `
					<div id="rename-switch-variable-container" title="Rename ${params.type === 'switch' ? 'Switches' : 'Variables'}" class="flex">
						<svg style="margin-left: 5px; cursor: pointer;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
							width="1.5em" height="1.5em" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve" data-type="${params.type}" onclick="$.Drag.VisualEvent.openSwitchVariableMenu(this.parentElement.previousElementSibling.previousElementSibling);">
							<path style="stroke-width: 1px; fill: white;" d="M18,20H2c-0.6,0-1-0.4-1-1s0.4-1,1-1h16c0.6,0,1,0.4,1,1S18.6,20,18,20z"></path>
							<path style="stroke-width: 1px; fill: white;" d="M7,16H3c-0.6,0-1-0.4-1-1v-4c0-0.3,0.1-0.5,0.3-0.7l10-10c0.4-0.4,1-0.4,1.4,0l4,4c0.4,0.4,0.4,1,0,1.4l-10,10 C7.5,15.9,7.3,16,7,16z M4,14h2.6l9-9L13,2.4l-9,9V14z"></path>
						</svg>
					</div>
				` : ''}
			</div>`;
	}; 
	
	Drag.VisualEvent.getCommandInputField = function(params, index, controller = null) {
		if (!params.addOptions || !Array.isArray(params.addOptions))
			params.addOptions = [];
		
		const commandOptions = Drag.VisualEvent.flattenArray(Object.values(Drag.VisualEvent.commandsCategories)).map(command => [parseInt(command.replace('command', '')), Drag.VisualEvent.getCommandName(command).replaceAll('&#8620;', '').replaceAll('&#10100;', '')]);		
		params.options = commandOptions;
		
		const defaultId = 101; //show text	
		const literalsOptions = params.options.map(option => `<option ${option[0] === defaultId ? 'selected' : ''} value="${option[0]}">${option[1] || ''}</option>`);
		
		for (const plugin in Drag.VisualEvent.pluginJSDocData) {
			const pluginData = Drag.VisualEvent.pluginJSDocData[plugin];
			if (pluginData.commands && Object.keys(pluginData.commands).length > 0)
				for (const pluginCommand in pluginData.commands) {
					const pluginCommandData = pluginData.commands[pluginCommand];
					literalsOptions.push(`<option data-pluginCommand="true" data-plugin="${plugin}" value="${pluginCommand}">${plugin}: ${pluginCommandData.text || pluginCommandData.name || ''}</option>`);
				}
		};
		
		const editor = Drag.VisualEvent.getEditor();
		if (editor)
			for (const customNode in editor._customNodes) 
				literalsOptions.push(`<option data-customNode="true" value="${customNode}">${editor._customNodes[customNode].name || ''}</option>`);	
		
		if (params.isInteractiveController === true)
			params.data = `data-behavior="${JSON.stringify([-1].concat(params.options.map((option, index) => index)))}" ${params.data || ''}`;
		
		if (params.onchange)
			params.onchange = params.onchange.replace('$.Drag.VisualEvent.onInputChange(this);', '').replace('handleInteractiveInput(this, this.parentElement.parentElement);', '').trim();
		
		return `
			<div class="relative flex" style="align-items: center">
				<input
					type="text" class="${params.class ? params.class : ''}" id="${params.id ? params.id : ''}" value="Show Text" placeholder="${params.placeholder || ''}"
					${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} data-value="${defaultId}"
					onchange="$.Drag.VisualEvent.onInputComboChange(this); ${params.isInteractiveController ? 'handleInteractiveInput(this, this.parentElement.parentElement);' : ''}" 
					oninput="this.onchange();" onfocus="$.Drag.VisualEvent.onInputComboFocus(this);"
					onblur="$.Drag.VisualEvent.onInputComboBlur(this);" ${params.onchange ? `data-onchange="${params.onchange}"` : ''}
					${params.disabled ? 'disabled' : ''} style="min-width: 12.5em;"
				>
				<select 
					onmouseover="$.Drag.VisualEvent.onSelectMouseOver(this);" onmouseout="$.Drag.VisualEvent.onSelectMouseOut(this);"
					onchange="$.Drag.VisualEvent.onSelectComboChange(this);" onclick="this.onchange();" onblur="$.Drag.VisualEvent.hideSelect(this);"
					class="hidden" style="display: list-item; position: absolute; top: calc(100% - 2px); padding-top: 0px; padding-bottom: 0px; padding-left: 7px; overflow-y: scroll; background-color: var(--background-color); border: 1px solid var(--color); z-index: 2;"
				>
					${literalsOptions.join("")}			
				</select>
			</div>`;
	};
	
	Drag.VisualEvent.refreshDatabaseInputOptions = function(input) {
		const select = input.nextElementSibling;
		const selectValue = parseInt(select.value);
		const selectIndex = select.selectedIndex;
		const selectOptions = select.options;
		
		//remove old options
		for (let i = 0; i < selectOptions.length; i++) {
			if (parseInt(selectOptions[i].value) > 0) {
				selectOptions[i].remove(i);
				i--;
			}
		}
		
		//make new options
		const type = input.getAttribute('data-inputType');
		const databaseOptions = Drag.VisualEvent.getDatabaseData(type);
		
		for (const databaseOption of databaseOptions) {
			const option = document.createElement("option");
			option.value = databaseOption.id;
			option.text = `${String(databaseOption.id).padStart(4, "0")}: ${databaseOption.name || ''}`;
			option.selected = selectValue === databaseOption.id;

			select.add(option, null);
		}
		
		//check if select value still exists
		if (!select.options[selectIndex]) {
			select.selectedIndex = 0;
			Drag.VisualEvent.onSelectComboChange(select);
		}
	};
	
	Drag.VisualEvent.setDatabaseInputFieldValue = function(input, value) {
		input.setAttribute('data-value', value);
		input.value = value;
		input.nextElementSibling.value = parseInt(value);
		
		Drag.VisualEvent.onSelectComboChange(input.nextElementSibling);
	};
	
	Drag.VisualEvent.onInputComboFocus = function(input) {
		const select = input.nextElementSibling;
		Drag.VisualEvent.showSelect(select); 
		input.select();
		Drag.VisualEvent.filterSelectOptions(select, "");
	};
	
	Drag.VisualEvent.onInputComboChange = function(input) {
		const select = input.nextElementSibling;
		if (!select.classList.contains('hidden'))
			Drag.VisualEvent.filterSelectOptions(select, input.value);
	};
	
	Drag.VisualEvent.onInputComboBlur = function(input) {
	};
	
	Drag.VisualEvent.handleComboSelectClickOutside = function(e) {
		const input = this.previousElementSibling;
		if (e.target !== input && e.target !== this && !e.path.includes(input) && !e.path.includes(this))
			Drag.VisualEvent.closeInputComboSelect(this);
	};
	
	Drag.VisualEvent.closeInputComboSelect = function(select) {
		const input = select.previousElementSibling;
		const value = input.getAttribute('data-value');
		const option = Array.from(select.options).find(option => option.value === value); //select.options[parseInt(input.getAttribute('data-value'))];
		if (option) {
			input.value = option.text;
			input.setAttribute('data-value', option.value);
		}
		
		Drag.VisualEvent.hideSelect(select);
		
		const onchange = input.getAttribute('data-onchange');
		if (input.getAttribute('data-onchange') && typeof input.ownerDocument.defaultView[onchange] === "function")
			input.ownerDocument.defaultView[onchange](input);
		
		if (input.getAttribute('data-isInteractiveController') === "true")
			input.ownerDocument.defaultView.handleInteractiveInput(input, input.parentElement.parentElement);
		
		Drag.VisualEvent.onInputChange(input);
		input.blur();
	};
	
	Drag.VisualEvent.onSelectComboChange = function(select) {
		const input = select.previousElementSibling;
		let option = select.options[select.options.selectedIndex];
		if (!option) {
			option = document.createElement("option");
			option.value = input.getAttribute('data-value');
			option.text = `${String(option.value).padStart(4, "0")}: ??? [NOT IN DB]`;
			select.add(option, null);
			select.value = option.value;
		}
		// input.value = option ? option.text : select.options[0].text;
		input.value = option.text;
		input.setAttribute('data-value', select.value);
		
		const onchange = input.getAttribute('data-onchange');
		if (input.getAttribute('data-onchange') && typeof input.ownerDocument.defaultView[onchange] === "function")
			input.ownerDocument.defaultView[onchange](input);
		
		if (input.getAttribute('data-isInteractiveController') === "true")
			input.ownerDocument.defaultView.handleInteractiveInput(input, input.parentElement.parentElement);
		
		Drag.VisualEvent.onInputChange(input);
		
		Drag.VisualEvent.hideSelect(select);
		input.blur();
	};
	
	Drag.VisualEvent.onSelectMouseOver = function(select) {
		if (select.ownerDocument.defaultView._isGraphNode) 
			select.ownerDocument.defaultView.disableGraphZoom();
	};
	
	Drag.VisualEvent.onSelectMouseOut = function(select) {
		if (select.ownerDocument.defaultView._isGraphNode) 
			select.ownerDocument.defaultView.enableGraphZoom();
	};
	
	Drag.VisualEvent.showSelect = function(select) {
		select.classList.remove('hidden');
		Drag.VisualEvent.startListenComboSelectClickOutside(select);
		Drag.VisualEvent.startListenComboSelectKeys(select);
	};
	
	Drag.VisualEvent.hideSelect = function(select) {
		select.classList.add('hidden');
		Drag.VisualEvent.stopListenComboSelectClickOutside();
		Drag.VisualEvent.stopListenComboSelectKeys();
	};
	
	Drag.VisualEvent.startListenComboSelectClickOutside = function(select) {
		Drag.VisualEvent.stopListenComboSelectClickOutside();
		Drag.VisualEvent._comboSelectClickOutsideListenerHandler = {owner: select.ownerDocument, fn: Drag.VisualEvent.handleComboSelectClickOutside.bind(select)};
		Drag.VisualEvent._comboSelectClickOutsideListenerHandler.owner.addEventListener("click", Drag.VisualEvent._comboSelectClickOutsideListenerHandler.fn);
	};
	
	Drag.VisualEvent.stopListenComboSelectClickOutside = function() {
		if (Drag.VisualEvent._comboSelectClickOutsideListenerHandler) {
			Drag.VisualEvent._comboSelectClickOutsideListenerHandler.owner.removeEventListener("click", Drag.VisualEvent._comboSelectClickOutsideListenerHandler.fn);
			Drag.VisualEvent._comboSelectClickOutsideListenerHandler = null;
		}
	};
	
	Drag.VisualEvent.startListenComboSelectKeys = function(select) {
		Drag.VisualEvent.stopListenComboSelectKeys();
		Drag.VisualEvent._comboSelectKeysListenerHandler = {owner: select.ownerDocument, fn: Drag.VisualEvent.handleComboSelectKeys.bind(select)};
		Drag.VisualEvent._comboSelectKeysListenerHandler.owner.addEventListener("keydown", Drag.VisualEvent._comboSelectKeysListenerHandler.fn);
	};
	
	Drag.VisualEvent.stopListenComboSelectKeys = function() {
		if (Drag.VisualEvent._comboSelectKeysListenerHandler) {
			Drag.VisualEvent._comboSelectKeysListenerHandler.owner.removeEventListener("keydown", Drag.VisualEvent._comboSelectKeysListenerHandler.fn);
			Drag.VisualEvent._comboSelectKeysListenerHandler = null;
		}
	};
	
	Drag.VisualEvent.handleComboSelectKeys = function(e) {
		switch (e.code) {
			case "ArrowUp":
				e.preventDefault();
				const previousOption = Drag.VisualEvent.getPreviousSelectOption(this);
				if (previousOption)
					this.value = previousOption.value;
				else 
					this.value = Drag.VisualEvent.getLastSelectOption(this).value;
				return false;
				break;
			case "ArrowDown":
				e.preventDefault();
				const nextOption = Drag.VisualEvent.getNextSelectOption(this);
				if (nextOption)
					this.value = nextOption.value;
				else 
					this.value = Drag.VisualEvent.getFirstSelectOption(this).value;
				return false;
				break;
			case "Enter":
				e.preventDefault();
				Drag.VisualEvent.onSelectComboChange(this);
				return false;
				break;
			case "Escape":
				e.preventDefault();
				Drag.VisualEvent.closeInputComboSelect(this);
				return false;
				break;
		};
	};
	
	Drag.VisualEvent.getPreviousSelectOption = function(select) {
		const previousOptions = Array.from(select.options).filter(option => !option.classList.contains('hidden') && parseInt(option.index) < select.selectedIndex);
		return previousOptions[previousOptions.length - 1];
	};
	
	Drag.VisualEvent.getNextSelectOption = function(select) {
		return Array.from(select.options).find(option => !option.classList.contains('hidden') && parseInt(option.index) > select.selectedIndex);
	};
	
	Drag.VisualEvent.getFirstSelectOption = function(select) {
		return Array.from(select.options).find(option => !option.classList.contains('hidden'));
	};
	
	Drag.VisualEvent.getLastSelectOption = function(select) {
		const options = Array.from(select.options).filter(option => !option.classList.contains('hidden'));
		return options[options.length - 1];
	};
	
	Drag.VisualEvent.filterSelectOptions = function(select, filterValue) {
		filterValue = filterValue.toLowerCase().trim();
		for (const option of select.options)
			if (!(option.value.toLowerCase().trim().includes(filterValue) || option.text.toLowerCase().trim().includes(filterValue)))
				option.classList.add('hidden');
			else 
				option.classList.remove('hidden');
			
		Drag.VisualEvent.updateSelectSize(select);
	};
	
	Drag.VisualEvent.updateSelectSize = function(select) {
		const size = Array.from(select.options).filter(option => option && !option.classList.contains("hidden")).length;
		select.size = size > 0 ? Math.min(size + 1, 15) : 0;
	};
	
	Drag.VisualEvent.getComboInputField = function(params, index, controller = null) {
		const value = params.value !== undefined ? params.value : params.default !== undefined ? params.default : 0;
		return `
			<div class="relative">
				<input
					type="text" class="" value="${value}"  placeholder="${params.placeholder || ''}"
					${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''}
					oninput="this.onchange();" onfocus="this.onchange();"
					onchange="${params.onchange || ''} this.nextElementSibling.style.display = 'list-item'; this.nextElementSibling.size = this.nextElementSibling.options.length + 1;"	
					onblur="setTimeout(() => { if (document.activeElement !== this.nextElementSibling) this.nextElementSibling.style.display = 'none'; }, 1);"
				>
				<select 
					onchange="this.previousElementSibling.value = this.options[this.options.selectedIndex].text; this.style.display = 'none'; $.Drag.VisualEvent.onInputChange(this.previousElementSibling);"
					style="position: absolute; padding-top: 0px; padding-bottom: 0px; padding-left: 7px; background-color: var(--background-color); border: 1px solid var(--color); display: none;">
					${(function fun() {
						let res = '';
						for (const [i, option] of params.options.entries()) {
							if (!option)
								continue
							
							let value = params.values[i];
							res += `
								<option value="${value}">${option}</option>
							`;
						}
						return res;
					})()}
				</select>
			</div>`;
	};
	
	Drag.VisualEvent.getRadioInputField = function(params, index, controller = null) {
		if (!params.options || params.options.length < 2)
			params.options = ["On", "Off"];
		
		return `
			<div class="textCenter flex ${params.class || ''}" style="justify-content: space-around; ${params.containerStyle || ''}">
				${(function fun() {
					let res = '';
					let radioId = Drag.VisualEvent.getUniqueId();
					while(document.querySelectorAll(`.nodeEvent input[type="radio"][id="${radioId}"]`).length > 0)
						radioId = Drag.VisualEvent.getUniqueId();
					for (const [i, option] of params.options.entries()) {
						if (!option)
							continue
						
						let value = params.values ? params.values[i] : i;
						value = params.evalOptionsValue ? eval(params.evalOptionsValue) : value;
						res += `
							<div style="min-width: 4.6875em;">
								<label class="block" for="nodeRadioInput${radioId}">${option}</label>
								<input 
									type="radio" id="nodeRadioInput${radioId}" class="${params.class || ''}" name="nodeRadioInput${radioId}" value="${value}" ${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''}
									onchange="${params.onchange || ''}" ${params.value === value ? 'checked' : ''} ${params.disabled ? 'disabled' : ''}
								/>
							</div>
						`;
					}
					return res;
				})()}
			</div>
		`;
	};
	
	Drag.VisualEvent.getRangeInputField = function(params, index, controller = null) {
		const value = params.value !== undefined ? params.value : params.default !== undefined ? params.default : 0;
		return `
			<div class="relative columnGap05em flex" style="flex-direction: row; align-items: center;">
				<input type="range" min="${params.min}" max="${params.max}" step="${params.step}" class="${params.class || ''}" value="${value}"
					onchange="this.nextElementSibling.firstElementChild.value = this.value; this.nextElementSibling.firstElementChild.onchange(); ${params.onchange || ''}" oninput="this.onchange();"  ${params.data || ''} ${params.disabled ? 'disabled' : ''}/>
				<div class="relative">
					<input type="number" min="${params.min}" max="${params.max}" step="${params.step}" class="onReadyOnChange ${params.class || ''}" style="min-width: 5em;" value="${value}" placeholder="${params.placeholder || ''}" 
						onchange="$.Drag.VisualEvent.sanitizeInput(this); this.parentElement.previousElementSibling.value = this.value; ${params.onchange || ''}" oninput="this.onchange();" 
						${params.data || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} />
					${params.tooltip ? `<span class="input-tooltip" data-tooltip="${params.tooltip}"></span>` : ''}
				</div>
			</div>
		`;
	};
	
	Drag.VisualEvent.getButtonInputField = function(params, index, controller = null) {
		return `
			<div class="relative">
				<button class="${params.class || ''}" onclick="${params.onclick || ''}" ${params.data || params.default || ''} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''}>${params.value}</button>
			</div>
		`;
	};
	
	Drag.VisualEvent.setPresetTint = function(button) {
		const preset = button.getAttribute('data-preset');
		const node = Drag.VisualEvent.getAncestorById(button, 'graphNode')
		const colorInput = node.querySelector('input[type="color"]');
		const grayInput = colorInput.parentElement.querySelector('input[type="range"]');
		switch (preset) {
			case 'normal':
				colorInput.value = '#808080';
				grayInput.value = 0;
				grayInput.onchange();
				break;
			case 'dark':
				colorInput.value = '#5e5e5e';
				grayInput.value = 0;
				grayInput.onchange();
				break;
			case 'sepia':
				colorInput.value = '#916f5e';
				grayInput.value = 170;
				grayInput.onchange();
				break;
			case 'sunset':
				colorInput.value = '#a26f6f'
				grayInput.value = 0;
				grayInput.onchange();
				break;
			case 'night':
				colorInput.value = '#5e5e80';
				grayInput.value = 68;
				grayInput.onchange();
				break;
		}
	};
	
	Drag.VisualEvent.getColorInputField = function(params, index, controller = null) {
		return `
			<div class="relative columnGap05em flex">
				<input type="color" class="${params.class || ''}"
					onclick="${params.onclick || ''}" onchange="" onfocus="this.blur()"
					${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} value="${Drag.VisualEvent.RGBAToHexA(Drag.VisualEvent.negrgbtorgb(params.value), true)}" 
				/>
				${params.alphaAsGrey ? `
				<div class="relative" style="display: grid; grid-template-columns: 1fr 0.5fr; grid-template-rows: 0.5fr 1fr; align-items: center;">
					<span style="margin-left: 0.625em; margin-bottom: -0.625em;">Gray :</span>
					<br>
					<input type="range" min="0" max="255" step="5" class="${params.class || ''}" value="${params.value[3]}" data-inputType="range" data-defaultValue="255"
						onchange="this.nextElementSibling.firstElementChild.value = this.value; this.parentElement.parentElement.firstElementChild.style.filter = 'grayscale(' + $.Drag.VisualEvent.lerp(0, 1, parseInt(this.value) / 255) + ')'; ${params.onchange || ''}" oninput="this.onchange();" ${params.disabled ? 'disabled' : ''}/>
					<div class="relative">
						<input type="number" min="0" max="255" step="5" class=" ${params.class || ''}" style="max-width: 4.6875em;" value="${params.value[3] || 0}" data-inputType="integer" data-defaultValue="255"
							onchange="$.Drag.VisualEvent.sanitizeInput(this); this.parentElement.previousElementSibling.value = this.value; this.parentElement.parentElement.parentElement.firstElementChild.style.filter = 'grayscale(' + $.Drag.VisualEvent.lerp(0, 1, parseInt(this.value) / 255) + ')'; ${params.onchange || ''}" oninput="this.onchange();" 
							${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} />
						${params.tooltip ? `<span class="input-tooltip" data-tooltip="${params.tooltip}"></span>` : ''}
					</div>
				</div>
				` : ''}
				${params.alphaAsIntensity ? `
				<div class="relative" style="display: grid; grid-template-columns: 1fr 0.5fr; grid-template-rows: 0.5fr 0.5fr; align-items: center;">
					<span style="margin-left: 10px; margin-bottom: -20px;">Intensity :</span>
					<br>
					<input type="range" min="0" max="255" step="5" class="${params.class || ''}" value="${params.value[3]}" data-inputType="range" data-defaultValue="255"
						onchange="this.nextElementSibling.firstElementChild.value = this.value; this.parentElement.parentElement.firstElementChild.style.filter = 'opacity(' + $.Drag.VisualEvent.lerp(0, 1, parseInt(this.value) / 255) + ')'; ${params.onchange || ''}" oninput="this.onchange();" ${params.disabled ? 'disabled' : ''}/>
					<div class="relative">
						<input type="number" min="0" max="255" step="5" class="onReadyOnChange ${params.class || ''}" style="max-width: 75px;" value="${params.value[3] || 0}" data-inputType="integer" data-defaultValue="255"
							onchange="$.Drag.VisualEvent.sanitizeInput(this); this.parentElement.previousElementSibling.value = this.value; this.parentElement.parentElement.parentElement.firstElementChild.style.filter = 'opacity(' + $.Drag.VisualEvent.lerp(0, 1, parseInt(this.value) / 255) + ')'; ${params.onchange || ''}" oninput="this.onchange();"
							${!params.notParam ? 'data-isCommandParameter="true"' : ''} ${params.disabled ? 'disabled' : ''} />
						${params.tooltip ? `<span class="input-tooltip" data-tooltip="${params.tooltip}"></span>` : ''}
					</div>
				</div>
				` : ''}
			</div>
		`;
	};
	
	Drag.VisualEvent.negrgbtorgb = function(negrgb) {
		if (negrgb)
			return negrgb.map(value => Drag.VisualEvent.lerp(0, 255, (value + 255) / 510));
		else
			return [0, 0, 0, 1];
	};
		
	Drag.VisualEvent.RGBAToHexA = function(rgba, forceRemoveAlpha = false, convertAlpha = true) {
		return "#" + rgba.filter((string, index) => !forceRemoveAlpha || index !== 3) //remove alpha
			.map((number, index) => Math.round(number)) //round numbers
			.map((number, index) => index === 3 && convertAlpha ? Math.round(number * 255) : number) // convert alpha to 255 number
			.map(number => number.toString(16)) // convert numbers to hex
			.map(string => string.length === 1 ? "0" + string : string) // add 0 when length of one number is 1
			.join("")
	};
	
	Drag.VisualEvent.hexAtoRGBA = function(hexA) {
		const rgba = hexA.match(/[0-9A-Fa-f]{2}/g).map(x => parseInt(x, 16));
		if (rgba.length === 3)
			rgba.push(127.5);
		
		return rgba;
	};
	
	Drag.VisualEvent.RGBtoNegRGB = function(rgb) {
		return rgb.map(value => Drag.VisualEvent.lerp(-255, 255, (value * 2) / 510));
	};
	
	Drag.VisualEvent.getFileInputField = function(params, index, controller = null) {
		const dirs = params.dir ? params.dir.split("/") : [""];
		const dataType = dirs[dirs.length - 2];
		return `
			<input type="text" class="${params.class || ''}"
				style="cursor: pointer;" 
				onclick="$.Drag.VisualEvent.openFileExplorer(this);" onchange="${params.onchange || ''}" onfocus="this.blur()" onload=""
				${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} value="${params.value || ''}"
				data-allowSubFolder='true' data-type="${dataType}" data-src='${params.dir ? params.dir : ""}' 
				data-allowNone='true' data-exitFolder='${params.dir ? "false" : "true"}' data-allowSubFolder='true'
			/>`;
	};
	
	Drag.VisualEvent.getAudioInputField = function(params, index, controller = null) {
		return `
			<input type="text" class="${params.class || ''}"
				style="cursor: pointer;" 
				onclick="$.Drag.VisualEvent.openFileExplorer(this); ${params.onclick || ''}" onchange="${params.onchange || ''}" onfocus="this.blur()" onload=""
				${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} value="${params.value || ''}" ${params.disabled ? "disabled" : ""}
			/>`;
	};
	
	Drag.VisualEvent.getImageInputField = function(params, index, controller = null) {
		// const path = Array.isArray(params.src) ? params.src.map((url, i) => "url(../" + url + "/" + params.value[i] + ".png)").join(', ') : "url(../" + params.src + "/" + params.value[0] + ".png)";
		const width = params.width || 6.25;
		const height = params.height || 6.25; 
		
		return `
			<input type="text" class="onReadyOnChange ${params.class || ''}"
				style="font-size: 0; cursor: pointer; padding: 0; position: relative; overflow: hidden; width: ${width}rem; height: ${height}rem; background-size: cover;" 
				onclick="$.Drag.VisualEvent.openFileExplorer(this); ${params.onclick || ''}" onchange="$.Drag.VisualEvent.updatePicture(this); ${params.onchange || ''}" onfocus="this.blur()" onload="$.Drag.VisualEvent.updatePicture(this)"
				${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} value="${params.value}" ${params.disabled ? "disabled" : ""}
			/>`;
	};
	
	Drag.VisualEvent.getMovieInputField = function(params, index, controller = null) {
		return `
			<input type="text" class="${params.class || ''}"
				style="cursor: pointer;" 
				onclick="$.Drag.VisualEvent.openFileExplorer(this); ${params.onclick || ''}" onchange="${params.onchange || ''}" onfocus="this.blur()" onload=""
				${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} value="${params.value}"
			/>`;
	};
	
	Drag.VisualEvent.getShopProcessingInputField = function(params, index, controller = null) {
		const value = params.value !== undefined ? params.value : params.default !== undefined ? params.default : '[]';
		return `
			<button class="${params.class || ''}" style="cursor: pointer;" 
				onclick="${params.onclick || ''} $.Drag.VisualEvent.openShopProcessingMenu(this);" onchange="${params.onchange || ''}"
				${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} data-value="${value}"
			>Open Shop Processing Menu...</button>
		`;
	};
	
	Drag.VisualEvent.getLocationInputField = function(params, index, controller = null) {
		if (typeof params.value === "string") 
			params.value = params.value.split(',').map(Number); 
		else if (!params.value || !Array.isArray(params.value)) 
			params.value = [];
		
		if (!params.valueCount)
			params.valueCount = 3;
		
		if (params.value.length < params.valueCount)
			Drag.VisualEvent.fill(params.value, 0, params.valueCount - params.value.length);
		
		const mapId = (params.mapId ? params.mapId : params.value.length > 2 ? params.value[0] : 0) || 0;
		const mapx = params.value.length > 2 ? params.value[1] : params.value[0];
		const mapy = params.value.length > 2 ? params.value[2] : params.value[1];

		const mapDisplayValue = `${params.value.length <= 2 ? "Current Map" : "Map" + String(mapId).padStart(3, '0')}: x: ${mapx}, y: ${mapy}`; 
		return `
			<input type="text" class="${params.class || ''}" style="cursor: pointer;" id="${params.id || ''}"
				onclick="${params.onclick || ''} $.Drag.VisualEvent.openMapLocationPicker(this);" onchange="${params.onchange || ''}" onfocus="this.blur()" onload=""
				${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} data-mapId="${mapId}" data-x="${mapx}" data-y="${mapy}" data-value="${params.value}" value="${mapDisplayValue}"
			/>`;
	};
	
	Drag.VisualEvent.getMoveRouteInputField = function(params, index, controller = null) {
		const useDefaultValue = !(params.value && params.value[1]);
		const list = !useDefaultValue ? params.value[1].list.map(moveRoute => moveRoute.code) : [0];
		const parameters = !useDefaultValue ? Drag.VisualEvent.escapeQuotes(JSON.stringify(params.value[1].list.map(moveRoute => moveRoute.parameters ? moveRoute.parameters : null))) : "[null]";
		
		const eventId = params.value && params.value[0] ? params.value[0] : 0;
		const mapId = params.mapId || 0;
		const skip = !useDefaultValue ? params.value[1].skippable : false;
		const wait = !useDefaultValue ? params.value[1].wait : true;
		const repeat = !useDefaultValue ? params.value[1].repeat : false;
		return `
			<button class="${params.class || ''}" style="cursor: pointer;" 
				onclick="$.Drag.VisualEvent.openMoveRouteMenu(this); ${params.onclick || ''}" onchange="$.Drag.VisualEvent.updateMoveRouteList(this);" ${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} 
				data-repeat="${repeat}" data-eventId="${eventId}" data-skip="${skip}" data-wait="${wait}" 
				data-list="[${list}]" data-parameters="${parameters}" data-value="" value="" data-thisEventOnly="${params.thisEventOnly === true}" data-mapId="${mapId}" data-x="${params.x || 0}" data-y="${params.y || 0}"
			>Set Move Route...</button>
			${params.showSummary !== false ? Drag.VisualEvent.getMoveRouteInputList(list) : ''}`;
	};
	
	Drag.VisualEvent.getMoveRouteInputList = function(list) {
		return `
			<div id="move-route-list"> 
				<ul class="shrinkable">
					${list.map(code => `<li>${Drag.VisualEvent.moveRouteNames[code]}</li>`).join('')}
				</ul>
				<div class="shrink-symbol" onclick="this.previousElementSibling.classList.toggle('shrink');">
					<span>&#x2771;</span>
				</div>
			</div>
			`;
	};
	
	Drag.VisualEvent.updateMoveRouteList = function(button) {
		const list = JSON.parse(button.getAttribute('data-list'));
		const listElement = button.nextElementSibling;
		if (listElement)
			listElement.outerHTML = Drag.VisualEvent.getMoveRouteInputList(list);
	};
	
	Drag.VisualEvent.getEventConditionsInputField = function(params, index, controller = null) {
		const conditions = Array.isArray(params.conditions) ? params.conditions : Drag.VisualEvent.formatConditions(params.conditions);
		return `
			<button class="${params.class || ''}" style="cursor: pointer;" 
				onclick="$.Drag.VisualEvent.openEventConditionsMenu(this); ${params.onclick || ''}" onchange="$.Drag.VisualEvent.onInputChange(this);" ${params.data || ""} ${!params.notParam ? 'data-isCommandParameter="true"' : ''} 
			>Set Conditions...</button>
			${params.showSummary !== false ? Drag.VisualEvent.getEventConditionsInputList(conditions, params.eventType) : ''}`;
	};
	
	Drag.VisualEvent.getEventConditionsInputList = function(conditions, eventType) {
		let conditionsList;
		if (eventType === "Troop Event" && conditions.length === 0)
			conditionsList = "<li>Don't run</li>";
		else 
			conditionsList = conditions.map(condition => `<li>${Drag.VisualEvent.translateConditions(condition)}</li>`).join('');
		return `
			<div id="event-conditions-list"> 
				<ul class="shrinkable">
					${conditionsList}
				</ul>
				<div class="shrink-symbol" onclick="this.previousElementSibling.classList.toggle('shrink');">
					<span>&#x2771;</span>
				</div>
			</div>
			`;
	};
	
	Drag.VisualEvent.formatConditions = function(conditions) {
		if (!conditions || typeof conditions !== "object")
			return [];
		
		const fConditions = [];
		if (conditions.switchValid)
			fConditions.push({type: "switch", id: conditions.switchId});
		if (conditions.switch1Valid)
			fConditions.push({type: "switch", id: conditions.switch1Id});
		if (conditions.switch2Valid)
			fConditions.push({type: "switch", id: conditions.switch2Id});
		
		if (conditions.selfSwitchValid)
			fConditions.push({type: "selfswitch", id: conditions.selfSwitchCh});
		
		if (conditions.variableValid)
			fConditions.push({type: "variable", id: conditions.variableId, value: conditions.variableValue});
		
		if (conditions.itemValid)
			fConditions.push({type: "item", id: conditions.itemId});
		
		if (conditions.actorValid && conditions.actorHp === undefined)
			fConditions.push({type: "actor", id: conditions.actorId});
		else if (conditions.actorValid && conditions.actorHp !== undefined)
			fConditions.push({type: "actorhp", id: conditions.actorId, value: conditions.actorHp});
		
		if (conditions.enemyValid)
			fConditions.push({type: "enemyhp", id: conditions.enemyIndex, value: conditions.enemyHp});
		
		if (conditions.turnEnding)
			fConditions.push({type: "turnend"});
		
		if (conditions.turnValid)
			fConditions.push({type: "turn", turnA: conditions.turnA, turnB: conditions.turnB});
		
		return fConditions;
	};
	
	Drag.VisualEvent.translateConditions = function(condition) {
		switch (condition.type) {
			case "switch":
				return `Switch ${String(condition.id).padStart(4, "0")} is ON`;
			case "selfswitch":
				return `Self Switch ${condition.id} is ON`;
			case "variable":
				return `Variable ${String(condition.id).padStart(4, "0")} >= ${condition.value}`;
			case "item": 
				return `Item ${String(condition.id).padStart(4, "0")} is in inventory`;
			case "actor": 
				return `Actor ${String(condition.id).padStart(4, "0")} is in party`;
			case "actorhp":
				return `Actor ${String(condition.id).padStart(4, "0")} HP <= ${condition.value}`;
			case "enemyhp":
				return `Enemy #${condition.id + 1} HP <= ${condition.value}`;
			case "turnend":
				return `Turn End`;
			case "turn":
				return `Turn ${condition.turnA} + ${condition.turnB} * X`;
			default:
				return ``;
		};
	};
	
	Drag.VisualEvent.updateEventConditionsList = function(button, eventType, conditions) {
		const listElement = button.nextElementSibling;
		if (listElement && conditions)
			listElement.outerHTML = Drag.VisualEvent.getEventConditionsInputList(Drag.VisualEvent.formatConditions(conditions), eventType);
	};
	
	Drag.VisualEvent.getInteractiveInputField = function(params, index, controller = null) {
		let res = `<div id='interactive-container' class="flex columnGap1em ${params.class || ''}" ${params.data || ''} style='${params.containerStyle || ''}'>`;
		
		const controllerParam = {...params.controller};
		if (controllerParam.type === "select" || Drag.VisualEvent.databaseTypes.includes(controllerParam.type))
			controllerParam.onchange = `${controllerParam.onchange ? controllerParam.onchange : ''} handleInteractiveInput(this, this.parentElement.parentElement);`;
		else if (controllerParam.type === "radio")
			controllerParam.onchange = `${controllerParam.onchange ? controllerParam.onchange : ''} handleInteractiveInput(this, this.parentElement.parentElement.parentElement);`;
		
		if (controllerParam.interactiveValue === "===") {
			if (params.dependances.every(dependance => dependance.value === params.dependances[0].value))
				controllerParam.value = 0;
			else
				controllerParam.value = 1;
		}
			
		if (controllerParam.value === undefined)
			controllerParam.value = controllerParam.default || 0;
		
		controllerParam.containerStyle = "flex-flow: column;";
		controllerParam.isInteractiveController = true;
		controllerParam.data = `${controllerParam.data ? controllerParam.data : ''} data-isInteractiveController="true" data-behavior="${JSON.stringify(params.behavior || Array(params.dependances.length).fill(1))}" data-dependanceLevel="${params.dependanceLevel + 1 || 1}" ${params.data && params.data.includes('data-dependance="true"') ? 'data-dependance="true"' : ''}`;
		controllerParam.class = "onReadyOnChange";
		res += Drag.VisualEvent.getInputField(controllerParam);
		
		res += "<div id='dependances-container' class='flex' style='justify-content: space-around; flex-flow: column;'>";
		const dependances = [...params.dependances];
		if (dependances.length < controllerParam.options.length)
			if (params.fillDependances)
				Drag.VisualEvent.fill(dependances, params.fillDependances, controllerParam.options.length - dependances.length);
			else
				Drag.VisualEvent.fill(dependances, Drag.VisualEvent.getInputParameters('empty'), controllerParam.options.length - dependances.length);
		
		let gridColLength = 0;
		let gridColIndex = 0;
		
		for (const [i, dependance] of dependances.entries()) {
			const dependanceParam = {...dependance};
			
			if (!params.dependanceLevel)
				dependanceParam.dependanceLevel = 1;
			else
				dependanceParam.dependanceLevel = params.dependanceLevel + 1;
			
			dependanceParam.data += ` data-dependance="true" data-dependanceLevel="${dependanceParam.dependanceLevel}" data-dependanceId="${i}"`;
			dependanceParam.containerParam = 'flex-flow: column;';

			if (params.dependancesStyle && Array.isArray(params.dependancesStyle[gridColIndex]) && gridColLength === 0) {
				res += `<div id="dependance-style-container" class="columnGap05em ${dependanceParam.type === 'empty' ? 'hidden' : ''}" style='display: grid; grid-template-columns: ${params.dependancesStyle[gridColIndex].map(item => item + "fr").join(" ")}; align-items: center;'>`;
				gridColLength += params.dependancesStyle[gridColIndex].length;
				gridColIndex++;
			} else if (gridColLength === 0) {
				res += `<div id="dependance-style-container" class="columnGap05em ${dependanceParam.type === 'empty' ? 'hidden' : ''}" style='display: grid; grid-template-columns: 1fr; align-items: center;'>`;
				gridColLength = 1;
				gridColIndex++;
			}
			
			if (params.noIgnore && params.noIgnore.includes(i))
				dependanceParam.data += ` data-noIgnore="true"`;
			
			res += Drag.VisualEvent.getInputField(dependanceParam, i, controllerParam);	
			
			if (gridColLength > 0 && --gridColLength === 0)
				res += "</div>";
		}
		res += "</div></div>";
		
		return res;
	};
	
	Drag.VisualEvent.handleInteractiveInput = function(input) {
		const parsedBehaviors = JSON.parse(input.getAttribute('data-behavior'));
		const value = Drag.VisualEvent.isSelect(input) ? input.selectedIndex : Drag.VisualEvent.getInputValue(input);
		const behaviors = Array.isArray(parsedBehaviors[value]) ? parsedBehaviors[value] : [parsedBehaviors[value] !== undefined ? parsedBehaviors[value] : value];
		const dependanceLevel = parseInt(input.getAttribute('data-dependancelevel'));

		const container = Drag.VisualEvent.getAncestorById(input, 'interactive-container');
		const targetedDependances = Drag.VisualEvent.flattenArray(behaviors.map(item => Array.from(container.querySelectorAll(`[data-dependance="true"][data-dependanceLevel="${dependanceLevel}"][data-dependanceId="${item}"]`)))).filter(dependance => dependance !== input);
		for (const [i, dependance] of targetedDependances.entries()) {
			if (Drag.VisualEvent.isRadio(input))
				dependance.disabled = false;
			else //if (isSelect(input))
				Drag.VisualEvent.getAncestorById(dependance, "dependance-style-container").classList.remove("hidden");
		}
		
		const untargetedDependances = Array.from(container.querySelectorAll(`[data-dependance="true"][data-dependanceLevel="${dependanceLevel}"]`)).filter(dependance => dependance !== input);
		for (const [i, dependance] of untargetedDependances.entries()) {
			if (targetedDependances.includes(dependance))
				continue;
			if (Drag.VisualEvent.isRadio(input))
				dependance.disabled = true;
			else //if (isSelect(input))
				Drag.VisualEvent.getAncestorById(dependance, "dependance-style-container").classList.add("hidden");
		}
	};
	
	Drag.VisualEvent.getEmptyInputField = function(params, index, controller = null) {
		return ``;
	};
	
// })();