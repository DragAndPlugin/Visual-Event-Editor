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
	Drag.VisualEvent.nwWindowPath = "Drag_DevTools_index.html"; 
	Drag.VisualEvent.nwVisualEventWindowPath = "html/Drag_DevTools_VisualEventEditor.html";
	Drag.VisualEvent.nwVisualEventWindowName = "Drag's DevTools Graph Editor";
	Drag.VisualEvent.nwFileExplorerWindowPath = "html/Drag_DevTools_FileExplorer.html";
	Drag.VisualEvent.nwFileExplorerWindowName = "Drag's DevTools File Explorer";
	
	Drag.VisualEvent.databaseTypes = ["actor", "animation", "armor", "class", "common_event", "enemy", "item", "skill", "state", "tileset", "troop", "weapon", "switch", "variable", "map_event", "equipment_type", "element_type"];
	Drag.VisualEvent.dataFiles = ["Actors", "Animations", "Armors", "Classes", "CommonEvents", "Enemies", "Items", "MapInfos", "Skills", "States", "System", "Tilesets", "Troops", "Weapons"];
	Drag.VisualEvent.pluginJSDocData = {};
	
	Drag.VisualEvent.commandsCategories = {
		"Message": ["command101", "command102", "command103", "command104", "command105"],
		"Game Progression": ["command121", "command122", "command123", "command124"],
		"Flow Control": ["command111","command112", "command113", "command115", "command117", "command118", "command119", "command108"],
		"Party": ["command125", "command126", "command127", "command128", "command129"],
		"Actor": ["command311", "command312", "command326", "command313", "command314", "command315", "command316", "command317", "command318", "command319", "command320", "command321", "command324", "command325"],
		"Movement": ["command201", "command202", "command203", "command204", "command205", "command206"],
		"Character": ["command211", "command216", "command217", "command212", "command213", "command214"],
		"Picture": ["command231", "command232", "command233", "command234", "command235"],
		"Timing": ["command230"],
		"Screen": ["command221", "command222", "command223", "command224", "command225", "command236"],
		"Audio & Video": ["command241", "command242", "command243", "command244", "command245", "command246", "command249", "command250", "command251", "command261"],
		"Scene Control": ["command301", "command302", "command303", "command351", "command352", "command353", "command354"],
		"System Settings": ["command132", "command133", "command139", "command140", "command134", "command135", "command136", "command137", "command138", "command322", "command323"],
		"Map": ["command281", "command282", "command283", "command284", "command285"],
		"Battle": ["command331", "command332", "command342", "command333", "command334", "command335", "command336", "command337", "command339", "command340"],
		"Advanced": ["command355", "command356", "command357"]
	};
	
	Drag.VisualEvent.commandsName = {
		command0: "End",
		command101: "Show Text", command102: "<span class='symbolHeader'>&#10100;</span><span> Show Choices</span>", command103: "Input Number", command104: "Select Item", command105: "Show Scrolling Text", command108: "Comment", command408: "Comment",
		command111: "<span class='symbolHeader'>&#10100;</span><span> Conditional Branch</span>", command402: "When [**]", command403: "When Cancel", command411: "Else", command112: "<span class='symbolHeader'>&#8620;</span> <span>Loop</span>", command413: "Repeat Above", command113: "Break Loop",
		command115: "Exit Event Processing", command117: "Common Event", command118: "Label", command119: "Jump to Label",
		command121: "Control Switches", command122: "Control Variables", command123: "Control Self Switch", command124: "Control Timer",
		command125: "Change Gold", command126: "Change Items", command127: "Change Weapons", command128: "Change Armors", command129: "Change Party Member",
		command132: "Change Battle BGM", command133: "Change Victory ME", command134: "Change Save Access", command135: "Change Menu Access",
		command136: "Change Encounter", command137: "Change Formation Access", command138: "Change Window Color", command139: "Change Defeat ME", command140: "Change Vehicle BGM",
		command201: "Transfer Player", command202: "Set Vehicle Location", command203: "Set Event Location", command204: "Scroll Map", command205: "Set Movement Route", command206: "Get On/Off Vehicle",
		command211: "Change Transparency", command212: "Show Animation", command213: "Show Balloon Icon", command214: "Erase Event", command216: "Change Player Followers", command217: "Gather Followers",
		command221: "Fade Out Screen", command222: "Fade In Screen", command223: "Tint Screen", command224: "Flash Screen", command225: "Shake Screen",
		command230: "Wait", command231: "Show Picture", command232: "Move Picture", command233: "Rotate Picture", command234: "Tint Picture", command235: "Erase Picture",
		command236: "Set Weather Effect", command241: "Play BGM", command242: "Fadeout BGM", command243: "Save BGM", command244: "Replay BGM", command245: "Play BGS", command246: "Fadeout BGS",
		command249: "Play ME", command250: "Play SE", command251: "Stop SE", command261: "Play Movie", command281: "Change Map Name Display", command282: "Change Tileset",
		command283: "Change Battle Background", command284: "Change Parallax", command285: "Get Location Info", command301: "Battle Processing", command601: "If Win", command602: "If Escape", command603: "If Lose",
		command302: "Shop Processing", command303: "Name Input Processing", command311: "Change HP", command312: "Change MP", command326: "Change TP", command313: "Change State", command314: "Recover All",
		command315: "Change EXP", command316: "Change Level", command317: "Change Parameter", command318: "Change Skill", command319: "Change Equipment", command320: "Change Name", command321: "Change Class",
		command322: "Change Actor Images", command323: "Change Vehicle Image", command324: "Change Nickname", command325: "Change Profile", command331: "Change Enemy HP", command332: "Change Enemy MP",
		command342: "Change Enemy TP", command333: "Change Enemy State", command334: "Enemy Recover All", command335: "Enemy Appear", command336: "Enemy Transform", command337: "Show Battle Animation",
		command339: "Force Action", command340: "Abort Battle", command351: "Open Menu Screen", command352: "Open Save Screen", command353: "Game Over", command354: "Return to Title Screen", 
		command355: "Script", command356: "Plugin Command (MV)", command357: "Plugin Command (MZ)",
	};
	
	Drag.VisualEvent.commandsEngine = {
		command356: "MV",
		command357: "MZ"
	};
	
	//command added here won't have their own nodes and will be ignored. their inputs, if they have any will be added to their parent/associated command. 
	//ie : command 401 will be ignored, its text input will be added to command101
	Drag.VisualEvent.associatedCommands = {
		command101: ["command401"],
		command102: ["command402", "command403", "command404"],
		command105: ["command405"],
		command108: ["command408"],
		command111: ["command411", "command412"],
		command112: ["command413"],
		command205: ["command505"],
		command301: ["command601", "command602", "command603", "command604"],
		command302: ["command605"],
		command355: ["command655"],
		command357: ["command657"]
	};
	
	Drag.VisualEvent.flatAssociatedCommandsCode = [401, 402, 403, 404, 405, 408, 411, 412, 413, 505, 601, 602, 603, 604, 605, 655, 657];
	
	Drag.VisualEvent.inputs = {
		//image
		face: {type: "image", name: "Face", default: "", valueCount: 2, src: 'img/faces', data: `data-src='img/faces' data-previewType='image' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='png' data-subImageWidth='144' data-subImageHeight='144'`},
		characterSheet: {type: "image", name: "Character", default: "", valueCount: 2, src: 'img/characters', data: `data-src='img/characters' data-isFullCharacterSheet="true" data-previewType='image' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='png'`},
		singleFrameCharacter: {type: "image", name: "Image", default: "", valueCount: 2, src: 'img/characters', data: `data-src='img/characters' data-isCharacterSheet="true" data-previewType='image' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='png' data-allowTilesetSelection='true'`},
		svbattler: {type: "image", name: "SV Battler", default: "", src: 'img/sv_actors', data: `data-src='img/sv_actors' data-previewType='image' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='png'`},
		parallax: {type: "image", name: "Parallax Background", default: "", src: 'img/parallaxes', data: `data-src='img/parallaxes' data-previewType='image' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='png'`},
		picture: {type: "image", name: "Picture", default: "", src: 'img/pictures', data: `data-src='img/pictures' data-previewType='image' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='png'`},
		battlebacks: {type: "image", name: "Battle Backgrounds", valueCount: 2, default: "", src: ['img/battlebacks2', 'img/battlebacks1'], data: `data-fileCount='2' data-src='["img/battlebacks2", "img/battlebacks1"]' data-previewType='image' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='png'`},
		
		//audio
		bgm: {type: "audio", name: "Name", default: "Battle1", src: 'audio/bgm', data: `data-type="bgm" data-src='audio/bgm' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='ogg'`},
		bgs: {type: "audio", name: "Name", default: "City", src: 'audio/bgs', data: `data-type="bgs" data-src='audio/bgs' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='ogg'`},
		se: {type: "audio", name: "Name", default: "", src: 'audio/se', data: `data-type="se" data-src='audio/se' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='ogg'`},
		me: {type: "audio", name: "Name", default: "", src: 'audio/me', data: `data-type="me" data-src='audio/me' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='ogg'`},
		movie: {type: "movie", name: "Movie", default: "", src: 'movies', data: `data-src='movies' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='mp4,webm' data-previewType='video'`},
		victoryme: {type: "audio", name: "Name", default: "Victory1", src: 'audio/me', data: `data-type="me" data-src='audio/me' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='ogg'`},
		defeatme: {type: "audio", name: "Name", default: "Defeat1", src: 'audio/me', data: `data-type="me" data-src='audio/me' data-allowNone='true' data-exitFolder='false' data-allowSubFolder='true' data-fileTypes='ogg'`},
		
		//location
		mapLocation: {type: "location", name: "Location", default: "0,0,0", valueCount: 3, data: "data-dataType='number' data-allowSearch=true' data-allowMapChange='true'"},
		currentMapLocation: {type: "location", name: "Location", default: "0,0", valueCount: 2, data: "data-dataType='number' data-allowSearch='false' data-allowMapChange='false'"},
		
		//move route
		moveRoute: {type: "moveRoute", name: "Move Route", default: "", valueCount: 2, data: ``},
		
		//shop proc
		shopProcessing: {type: "shopProcessing", name: "Shop Processing", default: [], valueCount: 4, data: "data-dataType='number'"},
		
		//conditions
		mapEventConditions: {type: "eventConditions", name: "Conditions", default: "", eventType: 'Map Event', data: "data-eventType='Map Event'"},
		troopEventConditions: {type: "eventConditions", name: "Conditions", default: "", eventType: 'Troop Event', data: "data-eventType='Troop Event'"},
		
		//database
		variable: {type: "variable", default: 1, name: "Variable"},
		variableNone: {type: "variable", default: 0, name: "Variable", addOptions: ["None"]},
		switch: {type: "switch", default: 1, name: "Switch"},
		switchNone: {type: "switch", default: 0, name: "Switch", addOptions: ["None"]},
		actor: {type: "actor", default: 1, name: "Actor"},
		actorWithParty: {type: "actor", default: 0, name: "Actor", addOptions: ["Entire Party"]},
		actorNone: {type: "actor", default: 0, name: "Actor", addOptions: ["None"]},
		class: {type: "class", default: 1, name: "Class"},
		classNone: {type: "class", default: 0, name: "Class", addOptions: ["None"]},
		skill: {type: "skill", default: 1, name: "Skill"},
		skillNone: {type: "skill", default: 0, name: "Skill", addOptions: ["None"]},
		item: {type: "item", default: 1, name: "Item"},
		itemNone: {type: "item", default: 0, name: "Item", addOptions: ["None"]},
		weapon: {type: "weapon", default: 1, name: "Weapon"},
		weaponNone: {type: "weapon", default: 0, name: "Weapon", addOptions: ["None"]},
		armor: {type: "armor", default: 1, name: "Armor"},
		armorNone: {type: "armor", default: 0, name: "Armor", addOptions: ["None"]},
		state: {type: "state", default: 1, name: "State"},
		stateNone: {type: "state", default: 0, name: "State", addOptions: ["None"]},
		enemy: {type: "enemy", default: 1, name: "Enemy"},
		enemyNone: {type: "enemy", default: 0, name: "Enemy", addOptions: ["None"]},
		commonEvent: {type: "common_event", default: 1, name: "Common Event"},
		commonEventNone: {type: "common_event", default: 0, name: "Common Event", addOptions: ["None"]},
		mapEvent: {type: "map_event", default: 1, name: "Map Event"},
		mapEventWithThis: {type: "map_event", default: 0, name: "Map Event", addOptions: ["This Event"]},
		mapEventWithThisAndPlayer: {type: "map_event", default: -1, name: "Map Event", addOptions: ["Player", "This Event"]},
		mapEventWithPlayer: {type: "map_event", default: 0, name: "Map Event", addOptions: ["Player"]},
		tileset: {type: "tileset", default: 1, name: "Tileset"},
		tilesetNone: {type: "tileset", default: 0, name: "Tileset", addOptions: ["None"]},
		troop: {type: "troop", default: 1, name: "Troop"},
		troopNone: {type: "troop", default: 0, name: "Troop", addOptions: ["None"]},
		animation: {type: "animation", default: 1, name: "Animation"},
		animationNone: {type: "animation", default: 0, name: "Animation", addOptions: ["None"]},
		equipmentType: {type: "equipment_type", default: 1, name: "Equipment Type"},
		elementType: {type: "element_type", default: 1, name: "Element Type"},
		
		//color
		rgba: {type: "color", default: [0, 0, 0, 0], name: "Color"},
		rgbg: {type: "color", default: [0, 0, 0, 0], alphaAsGrey: true, name: "Color"},
		rgbi: {type: "color", default: [255, 255, 255, 170], alphaAsIntensity: true, name: "Color"},
		
		//range
		volume: {type: "range", name: "Volume", tooltip: "%", onchange: "updateAudio(this);", default: 90, min: 0, max: 100, step: 5},
		pitch: {type: "range", name: "Pitch", tooltip: "%", onchange: "updateAudio(this);", default: 100, min: 50, max: 150, step: 5},
		pan: {type: "range", name: "Pan", onchange: "updateAudio(this);", default: 0, min: -100, max: 100, step: 5},
		red: {type: "range", name: "Red", onchange: "", default: 0, min: -255, max: 255, step: 5},
		green: {type: "range", name: "Green", onchange: "", default: 0, min: -255, max: 255, step: 5},
		blue: {type: "range", name: "Blue", onchange: "", default: 0, min: -255, max: 255, step: 5},
		rangeSpeed: {type: "range", name: "Speed", onchange: "", default: 5, min: 1, max: 9, step: 1},
		rangePower: {type: "range", name: "Power", onchange: "", default: 5, min: 1, max: 9, step: 1},
		
		//buttons
		play: {type: "button", name: "", notParam: true, value: "Play", onclick: "playAudio(this);"},
		stop: {type: "button", name: "", notParam: true, value: "Stop", onclick: "stopAudio(this);"},
		normalTint: {type: "button", name: "", notParam: true, value: "Normal", data: "data-preset='normal'",onclick: "$.Drag.VisualEvent.setPresetTint(this);"},
		darkTint: {type: "button", name: "", notParam: true, value: "Dark", data: "data-preset='dark'", onclick: "$.Drag.VisualEvent.setPresetTint(this);"},
		sepiaTint: {type: "button", name: "", notParam: true, value: "Sepia", data: "data-preset='sepia'", onclick: "$.Drag.VisualEvent.setPresetTint(this);"},
		sunsetTint: {type: "button", name: "", notParam: true, value: "Sunset", data: "data-preset='sunset'", onclick: "$.Drag.VisualEvent.setPresetTint(this);"},
		nightTint: {type: "button", name: "", notParam: true, value: "Night", data: "data-preset='night'", onclick: "$.Drag.VisualEvent.setPresetTint(this);"},
		
		//radio
		radioOnOff: {type: "radio", options: ["ON", "OFF"], name: "Operation", data: "data-dataType='number'", default: 0},
		radioOperation: {type: "radio", options: ["Set", "Add", "Sub", "Mul", "Div", "Mod"], name: "Operation", data: "data-dataType='number'", default: 0},
		radioOperation2: {type: "radio", options: ["Increase", "Decrease"], name: "Operation", data: "data-dataType='number'", default: 0},
		radioOperation3: {type: "radio", options: ["Add", "Remove"], name: "Operation", data: "data-dataType='number'", default: 0},
		radioLearnForget: {type: "radio", options: ["Learn", "Forget"], name: "Operation", data: "data-dataType='number'", default: 0},
		radioRange: {type: "radio", options: ["Single", "Range"], name: "", notParam: true, interactiveValue: "===", data: "data-dataType='number'", default: 0},
		radioStartStop: {type: "radio", options: ["Start", "Stop"], name: "Action", data: "data-dataType='number'", default: 0},
		radioSelfSwitch: {type: "radio", options: ["A", "B", "C", "D"], values: ["A", "B", "C", "D"], name: "Self Switch", default: "A"},
		radioTransparency: {type: "radio", options: ["ON", "OFF"], name: "Transparency", data: "data-dataType='number'", default: 0},
		radioFollowers: {type: "radio", options: ["ON", "OFF"], name: "Player Followers", data: "data-dataType='number'", default: 0},
		radioEnabledDisabled: {type: "radio", options: ["Disable", "Enable"], name: "Action", data: "data-dataType='number'", default: 0},
		radioEnemyActor: {type: "radio", options: ["Enemy", "Actor"], name: "Subject", data: "data-dataType='number'", default: 0},
		
		//select
		selectIsOnOff: {type: "select", options: ["OFF", "ON"], name: "Is", data: "data-dataType='number'", default: 1},
		selectOperand: {type: "select", options: ["Constant", "Variable", "Random", "Game Data", "Script"], name: "", data: "data-dataType='number'", default: 0},
		selectOperand2: {type: "select", options: ["Fixed", "Variable"], name: "", data: "data-dataType='number'", default: 0},
		selectWindowBackground: {type: "select", options: ["Window", "Dim", "Transparent"], data: "data-dataType='number'", default: 0, name: "Background"},
		selectVerticalPosition: {type: "select", options: ["Top", "Middle", "Bottom"], data: "data-dataType='number'", default: 2, name: "Position"},
		selectHorizontalPosition: {type: "select", options: ["Left", "Middle", "Right"], data: "data-dataType='number'", default: 2, name: "Position"},
		selectItemType: {type: "select", options: ["Regular Item", "Key Item", "Hidden Item A", "Hidden Item B"], name: "Item Type :", data: "data-dataType='number'", default: 1},
		selectCondition: {type: "select", options: ["Switch", "Variable", "Self Switch", "Timer", "Actor", "Enemy", "Character", "Gold", "Item", "Weapon", "Armor", "Button", "Script", "Vehicle"], data: "data-dataType='number'", default: 0},
		selectComparison: {type: "select", options: ["=", ">=", "<=", ">", "<", "!="], name: "Operator", data: "data-dataType='number'", default: 0},
		selectComparison2: {type: "select", options: [">=", "<="], name: "", data: "data-dataType='number'", default: 0},
		selectComparison3: {type: "select", options: [">=", "<=", "<"], name: "", data: "data-dataType='number'", default: 0},
		selectConstantVariable: {type: "select", options: ["Constant", "Variable"], name: "", data: "data-dataType='number'", default: 0},
		selectDirectVariable: {type: "select", options: ["Direct designation", "Designation with variables"], name: "", data: "data-dataType='number'", default: 0},
		selectOnOff: {type: "select", options: ["On", "Off"], name: "", data: "data-dataType='number'", default: 0},
		selectOrigin: {type: "select", options: ["Upper Left", "Center"], name: "Origin", data: "data-dataType='number'", default: 0},
		selectBlendMode: {type: "select", options: ["Normal", "Additive", "Multiply", "Screen"], name: "Blend Mode", data: "data-dataType='number'", default: 0},
		selectEasingType: {type: "select", options: ["Constant speed", "Slow start", "Slow end", "Screen"], name: "Slow start and end", data: "data-dataType='number'", default: 0},
		selectDesignation: {type: "select", options: ["Direct designation", "Designation with a variable", "Same as random encouters"], name: "Troop Designation", data: "data-dataType='number'", default: 0},
		selectLocationDesignation: {type: "select", options: ["Direct designation", "Designation with a variable"], name: "Location Designation", data: "data-dataType='number'", default: 0},
		selectEventLocationDesignation: {type: "select", options: ["Direct designation", "Designation with a variable", "Exchange with another event"], name: "Location Designation", data: "data-dataType='number'", default: 0},
		selectMZInfoTypeLocationDesignation: {type: "select", options: ["Direct designation", "Designation with a variable", "Designation by a character"], name: "Location Designation", data: "data-dataType='number'", default: 0},
		selectMVInfoTypeLocationDesignation: {type: "select", options: ["Direct designation", "Designation with a variable"], name: "Location Designation", data: "data-dataType='number'", default: 0},
		selectWeather: {type: "select", options: ["None", "Rain", "Storm", "Snow"], values: ["none", "rain", "storm", "snow"], name: "Weather", default: "none"},
		selectSelfSwitch: {type: "select", options: ["A", "B", "C", "D"], values: ["A", "B", "C", "D"], name: "Self Switch", default: "A"},
		selectTroopEnemy: {type: "select", options: ["Entire Troop", "#1 ?", "#2 ?", "#3 ?", "#4 ?", "#5 ?", "#6 ?", "#7 ?", "#8 ?"], name: "Enemy", startValue: -1, data: "data-dataType='number'", default: 0},
		selectTroopEnemy2: {type: "select", options: ["#1 ?", "#2 ?", "#3 ?", "#4 ?", "#5 ?", "#6 ?", "#7 ?", "#8 ?"], name: "Enemy", data: "data-dataType='number'", default: 0},
		selectTarget: {type: "select", options: ["Last Target", "Random", "Index 1", "Index 2", "Index 3", "Index 4", "Index 5", "Index 6", "Index 7", "Index 8"], name: "Enemy", startValue: -2, data: "data-dataType='number'", default: -2},
		selectVehicle: {type: "select", options: ["Boat", "Ship", "Airship"], name: "Vehicle", data: "data-dataType='number'", default: 0},
		selectParameter: {type: "select", options: ["Max HP", "Max MP", "Attack", "Defense", "M. Attack", "M. Defense", "Agility", "Luck"], name: "Parameter", data: "data-dataType='number'", default: 0},
		selectBalloonIcon: {type: "select", options: ["Exclamation", "Question", "Music Note", "Heart", "Anger", "Sweat", "Frustration", "Silence", "Light Bulb", "Zzz", "User-defined 1", "User-defined 2", "User-defined 3", "User-defined 4", "User-defined 5"], name: "Balloon Icon", startValue: 1, data: "data-dataType='number'", default: 0},
		selectFade: {type: "select", options: ["Black", "White", "None"], name: "Fade", data: "data-dataType='number'", default: 0},
		selectActorCondition: {type: "select", options: ["Is in the party", "Name", "Class", "Skill", "Weapon", "Armor", "State"], name: "", data: "data-dataType='number'", default: 0},
		selectEnemyCondition: {type: "select", options: ["Appeared", "State"], name: "", data: "data-dataType='number'", default: 0},
		selectDirection: {type: "select", options: ["Down", "Left", "Right", "Up"], values: [2, 4, 6, 8], name: "Direction", data: "data-dataType='number'", default: 0},
		selectDirectionRetain: {type: "select", options: ["Retain", "Down", "Left", "Right", "Up"], values: [0, 2, 4, 6, 8], name: "Direction", data: "data-dataType='number'", default: 0},
		selectButton: {type: "select", options: ["OK", "Cancel", "Shift", "Down", "Left", "Right", "Up", "Pageup", "Pagedown"], values: ['ok', 'cancel', 'shift', 'down', 'left', 'right', 'up', 'pageup', 'pagedown'], name: "", data: "data-dataType='string'", default: 0},
		selectButtonAction: {type: "select", options: ["is being pressed", "is being triggered", "is being repeated"], name: "", data: "data-dataType='number'", default: 0},
		selectSpeed: {type: "select", options: ["1: x8 Slower", "2: x4 Slower", "3: x2 Slower", "4: Normal", "5: x2 Faster", "6: x4 Faster"], name: "Speed", startValue: 1, data: "data-dataType='number'", default: 4},
		selectFrequency: {type: "select", options: ["1: Lowest", "2: Lower", "3: Normal", "4: Higher", "5: Highest"], name: "Frequency", startValue: 1, data: "data-dataType='number'", default: 3},
		selectInfoType: {type: "select", options: ["Terrain Tag", "Event ID", "Tile ID (Layer 1)", "Tile ID (Layer 2)", "Tile ID (Layer 3)", "Tile ID (Layer 4)", "Region ID"], name: "Info Type", data: "data-dataType='number'", default: 0},
		selectPriority: {type: "select", options: ["Below Characters", "Same As Characters", "Above Characters"], name: "Priority", data: "data-dataType='number'", default: 0},
		selectTrigger: {type: "select", options: ["Action Button", "Player Touch", "Event Touch", "Autorun", "Parallel"], name: "Trigger", data: "data-dataType='number'", default: 0},
		selectMovementType: {type: "select", options: ["Fixed", "Random", "Approach", "Custom"], name: "Movement Type", data: "data-dataType='number'", default: 0},
		selectSpan: {type: "select", options: ["Battle", "Turn", "Moment"], name: "Span", data: "data-dataType='number'", default: 0},
		selectEquipmentFromType: {type: "select", options: [], evalOptions: '["None"].concat($dataArmors.concat($dataWeapons).filter(item => item && item.etypeId === index + 1).map(item => item.name))', name: "Equipment Item", data: "data-dataType='number'", default: 0},
		selectMZGameDataType: {type: "select", options: ["Item", "Weapon", "Armor", "Actor", "Enemy", "Character", "Party", "Other", "Last"], name: "Game Data", data: "data-dataType='number'", default: 0},
		selectMVGameDataType: {type: "select", options: ["Item", "Weapon", "Armor", "Actor", "Enemy", "Character", "Party", "Other"], name: "Game Data", data: "data-dataType='number'", default: 0},
		selectActorParameter: {type: "select", options: ["Level", "EXP", "HP", "MP", "Max HP", "Max MP", "Attack", "Defense", "M. Attack", "M. Defense", "Agility", "Luck", "TP"], name: "Actor Parameter", data: "data-dataType='number'", default: 0},
		selectTroopEnemyParameter: {type: "select", options: ["HP", "MP", "Max HP", "Max MP", "Attack", "Defense", "M. Attack", "M. Defense", "Agility", "Luck", "TP"], name: "Enemy Parameter", data: "data-dataType='number'", default: 0},
		selectCharacterPositionDirection: {type: "select", options: ["Map X", "Map Y", "Direction", "Screen X", "Screen Y"], name: "Character Location/Direction", data: "data-dataType='number'", default: 0},
		selectPartyMember: {type: "select", options: ["Member #1", "Member #2", "Member #3", "Member #4", "Member #5", "Member #6", "Member #7", "Member #8"], name: "Party Member", data: "data-dataType='number'", default: 0},
		selectLastAction: {type: "select", options: ["Last Used Skill ID", "Last Used Item ID", "Last Actor ID to Act", "Last Enemy Index to Act", "Last Target Actor ID", "Last Target Enemy Index"], name: "Last Action", data: "data-dataType='number'", default: 0},
		selectMiscData: {type: "select", options: ["Map ID", "Party Members", "Gold", "Steps", "Play Time", "Timer", "Save Count", "Battle Count", "Win Count", "Escape Count"], name: "Other", data: "data-dataType='number'", default: 0},
		selectValueType: {type: "select", options: ["Flat", "Rate (%)"], name: "Type", data: "data-dataType='number'", default: 0},
		selectDistanceCalcMode: {type: "select", options: ["Chebyshev (Square Shape)", "Manhattan (Diamond Shape)", "Euclidean (Circle Shape)"], name: "Calculation Mode", data: "data-dataType='number'", default: 0},
		
		//outputs
		outputList: {type: "empty", name: "", isOutput: true, notParam: true, isList: true},
		choicesOutput: {type: "stringArray", count: 6, name: "When", default: ["Yes", "No"], isOutput: true},
		cancelOutput: {type: "empty", name: "When Cancel", isOutput: true, notParam: true, condition: "command && command.parameters[1] === -2"},
		defaultChoice: {type: "select", options: ["None", "Choices #1", "Choices #2",  "Choices #3",  "Choices #4",  "Choices #5",  "Choices #6"], data: "data-dataType='number'", startValue: -1, default: 0, name: "Default"},
		cancelChoice: {type: "select", options: ["Branch", "Disallow", "Choices #1", "Choices #2",  "Choices #3",  "Choices #4",  "Choices #5",  "Choices #6"], data: "data-dataType='number'", startValue: -2, default: 1, name: "Cancel", onchange: "$.Drag.VisualEvent.toggleCancelBranchChoice(this);"},
		ifOutput: {type: "empty", name: "If", isOutput: true, notParam: true},
		elseOutput: {type: "empty", name: "Else", isOutput: true, notParam: true},
		loopOutput: {type: "empty", name: "Repeat", isOutput: true, notParam: true},
		winOutput: {type: "empty", name: "If Win", isOutput: true, notParam: true},
		escapeOutput: {type: "empty", name: "If Escape", isOutput: true, notParam: true},
		loseOutput: {type: "empty", name: "If Lose", isOutput: true, notParam: true},
		outputStringList: {type: "string", isList: true, name: "", isOutput: true},
		
		//checkbox
		checkbox: {type: "checkbox", name: "", default: false, showName: true},
		includeEquipment: {type: "checkbox", name: "Include Equipment", default: false, showName: true},
		initialize: {type: "checkbox", name: "Initialize", default: false, showName: false},
		allowDeath: {type: "checkbox", name: "Allow Death", default: false, showName: false},
		showLevelUp: {type: "checkbox", name: "Show Level Up", default: false, showName: false},
		saveExp: {type: "checkbox", name: "Save EXP", default: false, showName: false},
		waitForCompletion: {type: "checkbox", name: "Wait For Completion", default: false, showName: false},
		horizontalLoop: {type: "checkbox", name: "Loop Horizontally", default: false, showName: false},
		verticalLoop: {type: "checkbox", name: "Loop Vertically", default: false, showName: false},
		purchaseOnly: {type: "checkbox", name: "Purchase Only", default: false, showName: false},
		walking: {type: "checkbox", name: "Walking", default: true, showName: false},
		stepping: {type: "checkbox", name: "Stepping", default: false, showName: false},
		directionFix: {type: "checkbox", name: "Direction Fix", default: false, showName: false},
		through: {type: "checkbox", name: "Through", default: false, showName: false},
		canEscape: {type: "checkbox", name: "Can Escape", default: false, showName: false},
		canLose: {type: "checkbox", name: "Can Lose", default: false, showName: false},
		fastForward: {type: "checkbox", default: false, name: "No Fast Forward"},
		targetAllEnemies: {type: "checkbox", default: false, name: "Target all enemies in the troop"},
		resetVariable: {type: "checkbox", name: "Reset Variable", default: true, showName: true},
		
		//integer
		int: {type: "integer", default: 0, name: ""},
		speed: {type: "integer", default: 2, name: "Speed"},
		scrollingSpeed: {type: "integer", default: 2, name: "Speed", min: 1, max: 8},
		distance: {type: "integer", default: 1, name: "Distance"},
		pictureID: {type: "integer", default: 0, name: "Picture ID"},
		durationFrame: {type: "integer", default: 60, name: "Duration in frames (1/60 sec)"},
		durationSeconds: {type: "integer", default: 10, name: "Duration in seconds", min: 1},
		maximumCharacters: {type: "integer", default: 8, name: "Max characters", min: 1, max: 16},
		horizontalScroll: {type: "integer", default: 0, name: "Horizontal Scroll", min: -32, max: 32},
		verticalScroll: {type: "integer", default: 0, name: "Vertical Scroll", min: -32, max: 32},
		pictureNumber: {type: "integer", default: 0, name: "Picture Number", min: 1, max: 100},
		x: {type: "integer", default: 0, name: "x"},
		y: {type: "integer", default: 0, name: "y"},
		width: {type: "integer", default: 100, name: "Width", tooltip: "%", min: 0},
		height: {type: "integer", default: 100, name: "Height", tooltip: "%", min: 0},
		opacity: {type: "integer", default: 255, name: "Opacity", min: 0, max: 255},
		digits: {type: "integer", name: "Digits :", default: 1, min: 1, max: 8},
		sec: {type: "integer", name: "", tooltip: "sec", evalValue: "value % 60", min: 0, max: 59, default: 0},
		min: {type: "integer", name: "",  tooltip: "min", evalValue: "Math.floor(value / 60)", min: 0, default: 0},
		percentage: {type: "integer", name: "", tooltip: "%", default: 50, min: 0, max: 100},
		rate: {type: "integer", name: "Rate", tooltip: "%", default: 100, min: 0, max: 100},
		valueInt: {type: "integer", default: 0, name: "Value"},
		intList: {type: "integer", name: "", default: 1, isList: true},
		
		//string & textareas
		label: {type: "string", name: "Label", default: ""},
		string: {type: "string", name: "", default: ""},
		stringList: {type: "string", name: "", default: "", isList: true},
		name: {type: "string", name: "Name", default: ""},
		text: {type: "text", name: "Text", default: ""},
		script: {type: "text", name: "Script", default: ""},
		notetagName: {type: "string", name: "Notetag", default: ""},
		value: {type: "text", name: "Value", default: ""},
		
		stringIntList: {type: "list", name: "Values / Weights", inputs: ["value", "weight"]},
		
		empty: {type: "empty", name: "", default: ""},
	};
	
	Drag.VisualEvent.interactiveInputs = {
		selectSwitchWithRange: {
			type: "interactive", name: "Switch", behavior: [0, [0, 1]], 
			controller: Drag.VisualEvent.inputs.radioRange, 
			dependances: [Drag.VisualEvent.inputs.switch, Drag.VisualEvent.inputs.switch]
		},
		selectVariableWithRange: {
			type: "interactive", name: "Variable", behavior: [0, [0, 1]], noIgnore: [1],
			controller: Drag.VisualEvent.inputs.radioRange, 
			dependances: [Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.variable]
		},
		selectVariableOperand: {
			type: "interactive", name: "Operand", behavior: [0, 1, [2, 3], 4, 5], 
			controller: Drag.VisualEvent.inputs.selectOperand, 
			dependances: [
				Drag.VisualEvent.inputs.string, 
				Drag.VisualEvent.inputs.variable, 
				Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.int, 
				{
					type: "interactive", name: "Game Data", behavior: Utils.RPGMAKER_NAME === "MZ" ? [0, 1, 2, [3, 4], [5, 6], [7, 8], 9, 10, 11] : [0, 1, 2, [3, 4], [5, 6], [7, 8], 9, 10],
					controller: Utils.RPGMAKER_NAME === "MZ" ? Drag.VisualEvent.inputs.selectMZGameDataType : Drag.VisualEvent.inputs.selectMVGameDataType, 
					dependances: Utils.RPGMAKER_NAME === "MZ" ? [
						Drag.VisualEvent.inputs.item, Drag.VisualEvent.inputs.weapon, Drag.VisualEvent.inputs.armor,
						Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.selectActorParameter,
						Drag.VisualEvent.inputs.selectTroopEnemy2, Drag.VisualEvent.inputs.selectTroopEnemyParameter,
						Drag.VisualEvent.inputs.mapEventWithThisAndPlayer, Drag.VisualEvent.inputs.selectCharacterPositionDirection,
						Drag.VisualEvent.inputs.selectPartyMember, Drag.VisualEvent.inputs.selectMiscData, Drag.VisualEvent.inputs.selectLastAction
					] :
					[
						Drag.VisualEvent.inputs.item, Drag.VisualEvent.inputs.weapon, Drag.VisualEvent.inputs.armor,
						Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.selectActorParameter,
						Drag.VisualEvent.inputs.selectTroopEnemy2, Drag.VisualEvent.inputs.selectTroopEnemyParameter,
						Drag.VisualEvent.inputs.mapEventWithThisAndPlayer, Drag.VisualEvent.inputs.selectCharacterPositionDirection,
						Drag.VisualEvent.inputs.selectPartyMember, Drag.VisualEvent.inputs.selectMiscData
					]
					,
					dependancesStyle: Utils.RPGMAKER_NAME === "MZ" ? [1, 1, 1, [0.5, 0.5], [0.5, 0.5], [0.5, 0.5], 1, 1, 1] : [1, 1, 1, [0.5, 0.5], [0.5, 0.5], [0.5, 0.5], 1, 1]
				}, 
				Drag.VisualEvent.inputs.text
			],
			dependancesStyle: [1, 1, [0.5, 0.5], 1, 1]
		},
		selectTimerAction: {
			type: "interactive", name: "Timer", behavior: [[0, 1], -1], 
			controller: Drag.VisualEvent.inputs.radioStartStop, 
			dependances: [Drag.VisualEvent.inputs.min, Drag.VisualEvent.inputs.sec]
		},
		selectConditional: Utils.RPGMAKER_NAME === "MZ" ? {
			type: "interactive", name: "Condition", behavior: [[0, 1], [2, 3, 4], [5, 6], [7, 8, 9], [10, 11], [12, 13], [14, 15], [16, 17], 18, [19, 20], [21, 22], [23, 24], 25, 26], 
			containerStyle: "align-items: center;",
			controller: Drag.VisualEvent.inputs.selectCondition, 
			dependances: [
				Drag.VisualEvent.inputs.switch, Drag.VisualEvent.inputs.radioOnOff, 
				Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.selectComparison, {
					type: "interactive", name: "", behavior: [0, 1], containerStyle: "align-items: center; margin-top: 1em;",
					controller: Drag.VisualEvent.inputs.selectConstantVariable, 
					dependances: [Drag.VisualEvent.inputs.string, Drag.VisualEvent.inputs.variable]
				},
				Drag.VisualEvent.inputs.selectSelfSwitch, Drag.VisualEvent.inputs.selectOnOff,
				Drag.VisualEvent.inputs.selectComparison2, Drag.VisualEvent.inputs.min, Drag.VisualEvent.inputs.sec,
				Drag.VisualEvent.inputs.actor, {
					type: "interactive", name: "", behavior: [-1, 0, 1, 2, 3, 4, 5], containerStyle: "align-items: center; margin-top: 1em;",
					controller: Drag.VisualEvent.inputs.selectActorCondition, 
					dependances: [Drag.VisualEvent.inputs.string, Drag.VisualEvent.inputs.class, Drag.VisualEvent.inputs.skill, Drag.VisualEvent.inputs.weapon, Drag.VisualEvent.inputs.armor, Drag.VisualEvent.inputs.state]
				},
				Drag.VisualEvent.inputs.selectTroopEnemy2, {
					type: "interactive", name: "", behavior: [-1, 0], containerStyle: "align-items: center; margin-top: 1em;",
					controller: Drag.VisualEvent.inputs.selectEnemyCondition, 
					dependances: [Drag.VisualEvent.inputs.state]
				},
				Drag.VisualEvent.inputs.mapEventWithThisAndPlayer, Drag.VisualEvent.inputs.selectDirection,
				Drag.VisualEvent.inputs.selectComparison3, Drag.VisualEvent.inputs.int,
				Drag.VisualEvent.inputs.item,
				Drag.VisualEvent.inputs.weapon, Drag.VisualEvent.inputs.includeEquipment,
				Drag.VisualEvent.inputs.armor, Drag.VisualEvent.inputs.includeEquipment,
				Drag.VisualEvent.inputs.selectButton, Drag.VisualEvent.inputs.selectButtonAction,
				Drag.VisualEvent.inputs.text,
				Drag.VisualEvent.inputs.selectVehicle
			],
			dependancesStyle: [[0.5, 0.5], [0.7, 0.3], 1, [0.5, 0.5], [0.3, 0.3, 0.3], 1, 1, 1, 1, [0.5, 0.5], [0.5, 0.5], 1, 1, 1, 1, 1, [0.5, 0.5], 1, 1]
		} : {
			type: "interactive", name: "Condition", behavior: [[0, 1], [2, 3, 4], [5, 6], [7, 8, 9], [10, 11], [12, 13], [14, 15], [16, 17], 18, [19, 20], [21, 22], 23, 24, 25], 
			containerStyle: "align-items: center;",
			controller: Drag.VisualEvent.inputs.selectCondition, 
			dependances: [
				Drag.VisualEvent.inputs.switch, Drag.VisualEvent.inputs.radioOnOff, 
				Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.selectComparison, {
					type: "interactive", name: "", behavior: [0, 1], containerStyle: "align-items: center;",
					controller: Drag.VisualEvent.inputs.selectConstantVariable, 
					dependances: [Drag.VisualEvent.inputs.string, Drag.VisualEvent.inputs.variable]
				},
				Drag.VisualEvent.inputs.selectSelfSwitch, Drag.VisualEvent.inputs.selectOnOff,
				Drag.VisualEvent.inputs.selectComparison2, Drag.VisualEvent.inputs.min, Drag.VisualEvent.inputs.sec,
				Drag.VisualEvent.inputs.actor, {
					type: "interactive", name: "", behavior: [-1, 0, 1, 2, 3, 4, 5], containerStyle: "align-items: center;",
					controller: Drag.VisualEvent.inputs.selectActorCondition, 
					dependances: [Drag.VisualEvent.inputs.string, Drag.VisualEvent.inputs.class, Drag.VisualEvent.inputs.skill, Drag.VisualEvent.inputs.weapon, Drag.VisualEvent.inputs.armor, Drag.VisualEvent.inputs.state]
				},
				Drag.VisualEvent.inputs.selectTroopEnemy2, {
					type: "interactive", name: "", behavior: [-1, 0], containerStyle: "align-items: center;",
					controller: Drag.VisualEvent.inputs.selectEnemyCondition, 
					dependances: [Drag.VisualEvent.inputs.state]
				},
				Drag.VisualEvent.inputs.mapEventWithThisAndPlayer, Drag.VisualEvent.inputs.selectDirection,
				Drag.VisualEvent.inputs.selectComparison3, Drag.VisualEvent.inputs.int,
				Drag.VisualEvent.inputs.item,
				Drag.VisualEvent.inputs.weapon, Drag.VisualEvent.inputs.includeEquipment,
				Drag.VisualEvent.inputs.armor, Drag.VisualEvent.inputs.includeEquipment,
				Drag.VisualEvent.inputs.selectButton,
				Drag.VisualEvent.inputs.text,
				Drag.VisualEvent.inputs.selectVehicle
			],
			dependancesStyle: [[0.5, 0.5], [0.7, 0.3], 1, [0.5, 0.5], [0.3, 0.3, 0.3], 1, 1, 1, 1, [0.5, 0.5], [0.5, 0.5], 1, 1, 1, 1, 1, 1, 1, 1]
		},
		selectOperand: {
			type: "interactive", name: "Operand", behavior: [0, 1], 
			controller: Drag.VisualEvent.inputs.selectConstantVariable, 
			dependances: [Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.variable],
			dependancesStyle: [1, 1]
		},
		selectActorWithRange: {
			type: "interactive", name: "Operand", behavior: [0, 1],
			controller: Drag.VisualEvent.inputs.selectOperand2, 
			dependances: [Drag.VisualEvent.inputs.actorWithParty, Drag.VisualEvent.inputs.variable],
		},
		selectEquipmentWithType: {
			type: "interactive", name: "Equipment",
			controller: Drag.VisualEvent.inputs.equipmentType, 
			fillDependances: Drag.VisualEvent.inputs.selectEquipmentFromType,
			dependances: [],
		},
		selectEnemyActorSubject: {
			type: "interactive", name: "Subject", behavior: [0, 1],
			controller: Drag.VisualEvent.inputs.radioEnemyActor, 
			dependances: [Drag.VisualEvent.inputs.selectTroopEnemy2, Drag.VisualEvent.inputs.actor],
		},
		directVariablePosition: {
			type: "interactive", name: "Position", behavior: [[0, 1], [2, 3]],
			controller: Drag.VisualEvent.inputs.selectDirectVariable, 
			dependances: [Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.variable],
			dependancesStyle: [[0.5, 0.5], [0.5, 0.5]]
		},
		selectTroopDesignation: {
			type: "interactive", name: "Troop", behavior: [0, 1, -1],
			controller: Drag.VisualEvent.inputs.selectDesignation,
			dependances: [Drag.VisualEvent.inputs.troop, Drag.VisualEvent.inputs.variable],
			dependancesStyle: [0.5, 0.5]
		},
		selectLocationWithDesignation: {
			type: "interactive", name: "Location", behavior: [0, [1, 2, 3]],
			controller: Drag.VisualEvent.inputs.selectLocationDesignation,
			dependances: [Drag.VisualEvent.inputs.mapLocation, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.variable],
			dependancesStyle: [1, [0.3, 0.3, 0.3]]
		},
		selectEventLocationWithDesignation: {
			type: "interactive", name: "Location", behavior: [0, [1, 2], 3],
			controller: Drag.VisualEvent.inputs.selectEventLocationDesignation,
			dependances: [Drag.VisualEvent.inputs.currentMapLocation, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.mapEventWithThis],
			dependancesStyle: [1, [0.5, 0.5], 1]
		},
		selectInfoLocationWithDesignation: {
			type: "interactive", name: "Location", behavior: Utils.RPGMAKER_NAME === "MZ" ? [0, [1, 2], 3] : [0, [1, 2]],
			controller: Utils.RPGMAKER_NAME === "MZ" ? Drag.VisualEvent.inputs.selectMZInfoTypeLocationDesignation : Drag.VisualEvent.inputs.selectMVInfoTypeLocationDesignation,
			dependances: Utils.RPGMAKER_NAME === "MZ" ? 
				[Drag.VisualEvent.inputs.currentMapLocation, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.mapEventWithThisAndPlayer] 
				: 
				[Drag.VisualEvent.inputs.currentMapLocation, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.variable] 
			,
			dependancesStyle: [1, [0.5, 0.5], 1]
		},
		selectAutonomousMovementType: {
			type: "interactive", name: "Autonomous Movement Type", behavior: [-1, -1, -1, 3],
			controller: Drag.VisualEvent.inputs.selectMovementType,
			dependances: [Drag.VisualEvent.inputs.empty, Drag.VisualEvent.inputs.empty, Drag.VisualEvent.inputs.empty, Drag.VisualEvent.inputs.moveRoute],
			dependancesStyle: [1]
		},
		selectFlatRateValue: {
			type: "interactive", name: "Value Type", behavior: [0, 1],
			controller: Drag.VisualEvent.inputs.selectValueType,
			dependances: [Drag.VisualEvent.inputs.valueInt, Drag.VisualEvent.inputs.percentage],
			dependancesStyle: [1, 1]
		}
	};
	
	Drag.VisualEvent.commandsParametersIndex = {
		command102: [0, 4, 3, 2, 1],
		command111: [Utils.RPGMAKER_NAME === "MZ" ? 
			{controller: 0, dependances: [1, 2, 1, 4, {controller: 2, dependances: [3, 3]}, 1, 2, 2, 1, 1, 1, {controller: 2, dependances: [3, 3, 3, 3, 3, 3]}, 1, {controller: 2, dependances: [3]}, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1]}
			:
			{controller: 0, dependances: [1, 2, 1, 4, {controller: 2, dependances: [3, 3]}, 1, 2, 2, 1, 1, 1, {controller: 2, dependances: [3, 3, 3, 3, 3, 3]}, 1, {controller: 2, dependances: [3]}, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1]}
		],
		command122: [{controller: -1, dependances: [0, 1]}, 2, {controller: 3, dependances: [4, 4, 4, 5, {controller: 4, dependances: Utils.RPGMAKER_NAME === "MZ" ? [5, 5, 5, 5, 6, 5, 6, 5, 6, 5, 5, 5] : [5, 5, 5, 5, 6, 5, 6, 5, 6, 5, 5,]}, 4]}],
	};
	
	Drag.VisualEvent.commandsParameters = {		
		command101: Utils.RPGMAKER_NAME === "MZ" ? [Drag.VisualEvent.inputs.face, Drag.VisualEvent.inputs.selectWindowBackground, Drag.VisualEvent.inputs.selectVerticalPosition, Drag.VisualEvent.inputs.name] : [Drag.VisualEvent.inputs.face, Drag.VisualEvent.inputs.selectWindowBackground, Drag.VisualEvent.inputs.selectVerticalPosition],
		command401: [Drag.VisualEvent.inputs.text],
		command102: [Drag.VisualEvent.inputs.choicesOutput, Drag.VisualEvent.inputs.cancelOutput, Drag.VisualEvent.inputs.selectWindowBackground, Drag.VisualEvent.inputs.selectHorizontalPosition, Drag.VisualEvent.inputs.defaultChoice, Drag.VisualEvent.inputs.cancelChoice],
		command402: [],
		command403: [],
		command404: [],
		command103: [Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.digits],
		command104: [Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.selectItemType],
		command105: [Drag.VisualEvent.inputs.scrollingSpeed, Drag.VisualEvent.inputs.fastForward],
		command405: [Drag.VisualEvent.inputs.text],
		command108: [Drag.VisualEvent.inputs.text],
		command408: [Drag.VisualEvent.inputs.text],
		command111: [Drag.VisualEvent.interactiveInputs.selectConditional, Drag.VisualEvent.inputs.ifOutput, Drag.VisualEvent.inputs.elseOutput],
		command411: [],
		command112: [Drag.VisualEvent.inputs.loopOutput],
		command412: [],
		command413: [],
		command113: [],
		command115: [],
		command117: [Drag.VisualEvent.inputs.commonEvent],
		command118: [Drag.VisualEvent.inputs.label],
		command119: [Drag.VisualEvent.inputs.label],
		command121: [Drag.VisualEvent.interactiveInputs.selectSwitchWithRange, Drag.VisualEvent.inputs.radioOnOff],
		command122: [Drag.VisualEvent.interactiveInputs.selectVariableWithRange, Drag.VisualEvent.inputs.radioOperation, Drag.VisualEvent.interactiveInputs.selectVariableOperand],
		command123: [Drag.VisualEvent.inputs.selectSelfSwitch, Drag.VisualEvent.inputs.radioOnOff],
		command124: [Drag.VisualEvent.interactiveInputs.selectTimerAction],
		command125: [Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand],
		command126: [Drag.VisualEvent.inputs.item, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand],
		command127: [Drag.VisualEvent.inputs.weapon, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand, Drag.VisualEvent.inputs.includeEquipment],
		command128: [Drag.VisualEvent.inputs.armor, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand, Drag.VisualEvent.inputs.includeEquipment],
		command129: [Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.radioOperation3, Drag.VisualEvent.inputs.initialize],
		command132: [Drag.VisualEvent.inputs.bgm, Drag.VisualEvent.inputs.volume, Drag.VisualEvent.inputs.pitch, Drag.VisualEvent.inputs.pan, Drag.VisualEvent.inputs.play, Drag.VisualEvent.inputs.stop],
		command133: [Drag.VisualEvent.inputs.victoryme, Drag.VisualEvent.inputs.volume, Drag.VisualEvent.inputs.pitch, Drag.VisualEvent.inputs.pan, Drag.VisualEvent.inputs.play, Drag.VisualEvent.inputs.stop],
		command134: [Drag.VisualEvent.inputs.radioEnabledDisabled],
		command135: [Drag.VisualEvent.inputs.radioEnabledDisabled],
		command136: [Drag.VisualEvent.inputs.radioEnabledDisabled],
		command137: [Drag.VisualEvent.inputs.radioEnabledDisabled],
		command138: [Drag.VisualEvent.inputs.rgba],
		command139: [Drag.VisualEvent.inputs.defeatme, Drag.VisualEvent.inputs.volume, Drag.VisualEvent.inputs.pitch, Drag.VisualEvent.inputs.pan, Drag.VisualEvent.inputs.play, Drag.VisualEvent.inputs.stop],
		command140: [Drag.VisualEvent.inputs.selectVehicle, Drag.VisualEvent.inputs.bgm, Drag.VisualEvent.inputs.volume, Drag.VisualEvent.inputs.pitch, Drag.VisualEvent.inputs.pan, Drag.VisualEvent.inputs.play, Drag.VisualEvent.inputs.stop],
		command201: [Drag.VisualEvent.interactiveInputs.selectLocationWithDesignation, Drag.VisualEvent.inputs.selectDirectionRetain, Drag.VisualEvent.inputs.selectFade],
		command202: [Drag.VisualEvent.inputs.selectVehicle, Drag.VisualEvent.interactiveInputs.selectLocationWithDesignation],
		command203: [Drag.VisualEvent.inputs.mapEventWithThis, Drag.VisualEvent.interactiveInputs.selectEventLocationWithDesignation, Drag.VisualEvent.inputs.selectDirectionRetain], //remove mapID value since it use current map
		command204: [Drag.VisualEvent.inputs.selectDirection, Drag.VisualEvent.inputs.distance, Drag.VisualEvent.inputs.selectSpeed, Drag.VisualEvent.inputs.waitForCompletion],
		command205: [Drag.VisualEvent.inputs.moveRoute],
		command505: [],
		command206: [],
		command211: [Drag.VisualEvent.inputs.radioTransparency],
		command212: [Drag.VisualEvent.inputs.mapEventWithThisAndPlayer, Drag.VisualEvent.inputs.animation, Drag.VisualEvent.inputs.waitForCompletion],
		command213: [Drag.VisualEvent.inputs.mapEventWithThisAndPlayer, Drag.VisualEvent.inputs.selectBalloonIcon, Drag.VisualEvent.inputs.waitForCompletion],
		command214: [],
		command216: [Drag.VisualEvent.inputs.radioFollowers],
		command217: [],
		command221: [],
		command222: [],
		command223: [Drag.VisualEvent.inputs.rgbg, Drag.VisualEvent.inputs.normalTint, Drag.VisualEvent.inputs.darkTint, Drag.VisualEvent.inputs.sepiaTint, Drag.VisualEvent.inputs.sunsetTint, Drag.VisualEvent.inputs.nightTint, Drag.VisualEvent.inputs.durationFrame, Drag.VisualEvent.inputs.waitForCompletion],
		command224: [Drag.VisualEvent.inputs.rgbi, Drag.VisualEvent.inputs.durationFrame, Drag.VisualEvent.inputs.waitForCompletion], 
		command225: [Drag.VisualEvent.inputs.rangePower, Drag.VisualEvent.inputs.rangeSpeed, Drag.VisualEvent.inputs.durationFrame, Drag.VisualEvent.inputs.waitForCompletion],
		command230: [Drag.VisualEvent.inputs.durationFrame],
		command231: [Drag.VisualEvent.inputs.pictureID, Drag.VisualEvent.inputs.picture, Drag.VisualEvent.inputs.selectOrigin, Drag.VisualEvent.interactiveInputs.directVariablePosition, Drag.VisualEvent.inputs.width, Drag.VisualEvent.inputs.height, Drag.VisualEvent.inputs.opacity, Drag.VisualEvent.inputs.selectBlendMode],
		command232: [Drag.VisualEvent.inputs.pictureID, Drag.VisualEvent.inputs.empty, Drag.VisualEvent.inputs.selectOrigin, Drag.VisualEvent.interactiveInputs.directVariablePosition, Drag.VisualEvent.inputs.width, Drag.VisualEvent.inputs.height, Drag.VisualEvent.inputs.opacity, Drag.VisualEvent.inputs.selectBlendMode, Drag.VisualEvent.inputs.durationFrame, Drag.VisualEvent.inputs.waitForCompletion, Utils.RPGMAKER_NAME === "MZ" ? Drag.VisualEvent.inputs.selectEasingType : Drag.VisualEvent.inputs.empty],
		command233: [Drag.VisualEvent.inputs.pictureID, Drag.VisualEvent.inputs.speed],
		command234: [Drag.VisualEvent.inputs.pictureNumber, Drag.VisualEvent.inputs.rgbg, Drag.VisualEvent.inputs.normalTint, Drag.VisualEvent.inputs.darkTint, Drag.VisualEvent.inputs.sepiaTint, Drag.VisualEvent.inputs.sunsetTint, Drag.VisualEvent.inputs.nightTint, Drag.VisualEvent.inputs.durationFrame, Drag.VisualEvent.inputs.waitForCompletion],
		command235: [Drag.VisualEvent.inputs.pictureID],
		command236: [Drag.VisualEvent.inputs.selectWeather, Drag.VisualEvent.inputs.rangePower, Drag.VisualEvent.inputs.durationFrame, Drag.VisualEvent.inputs.waitForCompletion],
		command241: [Drag.VisualEvent.inputs.bgm, Drag.VisualEvent.inputs.volume, Drag.VisualEvent.inputs.pitch, Drag.VisualEvent.inputs.pan, Drag.VisualEvent.inputs.play, Drag.VisualEvent.inputs.stop],
		command242: [Drag.VisualEvent.inputs.durationSeconds],
		command243: [],
		command244: [],
		command245: [Drag.VisualEvent.inputs.bgs, Drag.VisualEvent.inputs.volume, Drag.VisualEvent.inputs.pitch, Drag.VisualEvent.inputs.pan, Drag.VisualEvent.inputs.play, Drag.VisualEvent.inputs.stop],
		command246: [Drag.VisualEvent.inputs.durationSeconds],
		command249: [Drag.VisualEvent.inputs.me, Drag.VisualEvent.inputs.volume, Drag.VisualEvent.inputs.pitch, Drag.VisualEvent.inputs.pan, Drag.VisualEvent.inputs.play, Drag.VisualEvent.inputs.stop],
		command250: [Drag.VisualEvent.inputs.se, Drag.VisualEvent.inputs.volume, Drag.VisualEvent.inputs.pitch, Drag.VisualEvent.inputs.pan, Drag.VisualEvent.inputs.play, Drag.VisualEvent.inputs.stop],
		command251: [],
		command261: [Drag.VisualEvent.inputs.movie],
		command281: [Drag.VisualEvent.inputs.radioOnOff],
		command282: [Drag.VisualEvent.inputs.tileset],
		command283: [Drag.VisualEvent.inputs.battlebacks],
		command284: [Drag.VisualEvent.inputs.parallax, Drag.VisualEvent.inputs.horizontalLoop, Drag.VisualEvent.inputs.verticalLoop, Drag.VisualEvent.inputs.horizontalScroll, Drag.VisualEvent.inputs.verticalScroll],
		command285: [Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.selectInfoType, Drag.VisualEvent.interactiveInputs.selectInfoLocationWithDesignation], //remove mapID value since it use current map
		command301: [Drag.VisualEvent.interactiveInputs.selectTroopDesignation, Drag.VisualEvent.inputs.canEscape, Drag.VisualEvent.inputs.canLose, Drag.VisualEvent.inputs.winOutput, Drag.VisualEvent.inputs.escapeOutput, Drag.VisualEvent.inputs.loseOutput],
		command601: [],
		command602: [],
		command603: [],
		command604: [],
		command302: [Drag.VisualEvent.inputs.shopProcessing, Drag.VisualEvent.inputs.purchaseOnly],
		command605: [Drag.VisualEvent.inputs.shopProcessing],
		command303: [Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.maximumCharacters],
		command311: [Drag.VisualEvent.interactiveInputs.selectActorWithRange, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand, Drag.VisualEvent.inputs.allowDeath],
		command312: [Drag.VisualEvent.interactiveInputs.selectActorWithRange, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand],
		command326: [Drag.VisualEvent.interactiveInputs.selectActorWithRange, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand],
		command313: [Drag.VisualEvent.interactiveInputs.selectActorWithRange, Drag.VisualEvent.inputs.radioOperation3, Drag.VisualEvent.inputs.state],
		command314: [Drag.VisualEvent.interactiveInputs.selectActorWithRange],
		command315: [Drag.VisualEvent.interactiveInputs.selectActorWithRange, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand, Drag.VisualEvent.inputs.showLevelUp],
		command316: [Drag.VisualEvent.interactiveInputs.selectActorWithRange, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand, Drag.VisualEvent.inputs.showLevelUp],
		command317: [Drag.VisualEvent.interactiveInputs.selectActorWithRange, Drag.VisualEvent.inputs.selectParameter, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand],
		command318: [Drag.VisualEvent.interactiveInputs.selectActorWithRange, Drag.VisualEvent.inputs.radioLearnForget, Drag.VisualEvent.inputs.skill],
		command319: [Drag.VisualEvent.inputs.actor, Drag.VisualEvent.interactiveInputs.selectEquipmentWithType],
		command320: [Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.name],
		command321: [Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.class, Drag.VisualEvent.inputs.saveExp],
		command322: [Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.face, Drag.VisualEvent.inputs.characterSheet, Drag.VisualEvent.inputs.svbattler], //make face character battler update on change actor
		command323: [Drag.VisualEvent.inputs.selectVehicle, Drag.VisualEvent.inputs.characterSheet], //make vehicle image update on change vehicle
		command324: [Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.name],
		command325: [Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.text],
		command331: [Drag.VisualEvent.inputs.selectTroopEnemy, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand, Drag.VisualEvent.inputs.allowDeath],
		command332: [Drag.VisualEvent.inputs.selectTroopEnemy, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand],
		command342: [Drag.VisualEvent.inputs.selectTroopEnemy, Drag.VisualEvent.inputs.radioOperation2, Drag.VisualEvent.interactiveInputs.selectOperand],
		command333: [Drag.VisualEvent.inputs.selectTroopEnemy, Drag.VisualEvent.inputs.radioOperation3, Drag.VisualEvent.inputs.state],
		command334: [Drag.VisualEvent.inputs.selectTroopEnemy],
		command335: [Drag.VisualEvent.inputs.selectTroopEnemy2],
		command336: [Drag.VisualEvent.inputs.selectTroopEnemy2, Drag.VisualEvent.inputs.enemy],
		command337: Utils.RPGMAKER_NAME === "MZ" ? [Drag.VisualEvent.inputs.selectTroopEnemy, Drag.VisualEvent.inputs.animation] : [Drag.VisualEvent.inputs.selectTroopEnemy, Drag.VisualEvent.inputs.animation, Drag.VisualEvent.inputs.targetAllEnemies],
		command339: [Drag.VisualEvent.interactiveInputs.selectEnemyActorSubject, Drag.VisualEvent.inputs.skill, Drag.VisualEvent.inputs.selectTarget],
		command340: [],
		command351: [],
		command352: [],
		command353: [],
		command354: [],
		command355: [Drag.VisualEvent.inputs.text],
		command655: [Drag.VisualEvent.inputs.text],
		command356: [Drag.VisualEvent.inputs.text], //Plugin Command MV, to improve, if possible
		command357: [], //plugin command MZ inputs are defined by the jsdoc parser
		command657: []
	};
	
	Drag.VisualEvent.moveRouteNames = [
		'End', 'Move Down', 'Move Left', 'Move Right', 'Move Up', 'Move Lower Left', 'Move Lower Right', 'Move Upper Left', 'Move Upper Right', 'Move at Random', 'Move Toward Player', 'Move Away from Player', 'Move Forward', 'Move Backward', 
		'Jump', 'Wait', 'Turn Down', 'Turn Left', 'Turn Right', 'Turn Up', 'Turn 90° Right', 'Turn 90° Left', 'Turn 180°', 'Turn 90° Right or Left', 'Turn at Random', 'Turn Toward Player', 'Turn Away from Player', 
		'Switch On', 'Switch Off', 'Change Speed', 'Change Frequency', 'Walking Animation On', 'Walking Animation Off', 'Stepping Animation On', 'Stepping Animation Off', 'Direction Fix On', 'Direction Fix Off', 
		'Through On', 'Through Off', 'Transparent On', 'Transparent Off', 'Change Image', 'Change Opacity', 'Change Blend Mode', 'Play SE', 'Script'
	];
	
	Drag.VisualEvent.moveRouteParameters = {
		14: [Drag.VisualEvent.inputs.x, Drag.VisualEvent.inputs.y],
		15: [Drag.VisualEvent.inputs.durationFrame],
		27: [Drag.VisualEvent.inputs.switch],
		28: [Drag.VisualEvent.inputs.switch],
		29: [Drag.VisualEvent.inputs.selectSpeed],
		30: [Drag.VisualEvent.inputs.selectFrequency],
		41: [Drag.VisualEvent.inputs.characterSheet],
		42: [Drag.VisualEvent.inputs.opacity],
		43: [Drag.VisualEvent.inputs.selectBlendMode],
		44: [Drag.VisualEvent.inputs.se],
		45: [Drag.VisualEvent.inputs.script],
	};
	
	Drag.VisualEvent.emptyList = {
		code: 0, 
		indent: 0, 
		parameters: []
	};
	
	Drag.VisualEvent.getEmptyList = function() {
		return {...Drag.VisualEvent.emptyList};
	};
	
	Drag.VisualEvent.defaultCommonEvent = {
		id: 0,
		list: [Drag.VisualEvent.getEmptyList()],
		name: "",
		switchId: 1,
		trigger: 0
	};
	
	Drag.VisualEvent.defaultMapEventPage = {
		conditions: {
			actorId: 1,
			actorValid: false,
			itemId: 1,
			itemValid: false,
			selfSwitchCh: "A",
			selfSwitchValid: false,
			switch1Id: 1,
			switch1Valid: false,
			switch2Id: 1,
			switch2Valid: false,
			variableId: 1,
			variableValid: false,
			variableValue: 0,
		},
		directionFix: false,
		image: {
			characterIndex: 0,
			characterName: "",
			direction: 2,
			pattern: 0,
			tileId: 0,
		},
		list: [Drag.VisualEvent.getEmptyList()],
		moveFrequency: 3,
		moveRoute: {
			list: [{code: 0, parameters: []}], 
			repeat: true, 
			skippable: false, 
			wait: false
		},
		moveSpeed: 3,
		moveType: 0,
		priorityType: 0,
		stepAnime: false,
		through: false,
		trigger: 0,
		walkAnime: true,
	};
	
	Drag.VisualEvent.defaultTroopEventPage = {
		conditions: {
			actorHp: 50,
			actorId: 1,
			actorValid: false,
			enemyHp: 50,
			enemyIndex: 0,
			enemyValid: false,
			switchId: 1,
			switchValid: false,
			turnA: 0,
			turnB: 0,
			turnEnding: false,
			turnValid: false
		},
		list: [Drag.VisualEvent.getEmptyList()],
		span: 0
	};
	
	Drag.VisualEvent.getDefaultEventPage = function(type) {
		if (type === "Map Event")
			return JSON.parse(JSON.stringify(Drag.VisualEvent.defaultMapEventPage)); 
		else if (type === "Troop Event")
			return JSON.parse(JSON.stringify(Drag.VisualEvent.defaultTroopEventPage)); 
		else
			return {};
	};
	
	Drag.VisualEvent.defaultTroopEvent = {
		id: 0,
		members: [],
		name: "",
		pages: [Drag.VisualEvent.getDefaultEventPage("Troop Event")]
	};
	
	Drag.VisualEvent.defaultMapEvent = {
		id: 0,
		name: "EV000",
		note: "",
		pages: [Drag.VisualEvent.getDefaultEventPage("Map Event")],
		x: 0,
		y: 0
	};
	
	//-----------------------------------------------------------------------------
	// plugin parameters
	
	//------------------------------------------------------------------------------------------------------------
	// plugin command	
	
	//------------------------------------------------------------------------------------------------------------
	// plugin functions
	
	Drag.VisualEvent.getDefaultCommonEvent = function() {
		return Drag.VisualEvent.deepCopyJSON(Drag.VisualEvent.defaultCommonEvent);
	};
	
	Drag.VisualEvent.getDefaultMapEvent = function() {
		return Drag.VisualEvent.deepCopyJSON(Drag.VisualEvent.defaultMapEvent);
	};
	
	Drag.VisualEvent.getDefaultTroopEvent = function() {
		return Drag.VisualEvent.deepCopyJSON(Drag.VisualEvent.defaultTroopEvent);
	};
	
	Drag.VisualEvent.getDefaultEvent = function(type) {
		switch (type) {
			case "Common Event":
				return Drag.VisualEvent.getDefaultCommonEvent();
			case "Map Event":
				return Drag.VisualEvent.getDefaultMapEvent();
			case "Troop Event":
				return Drag.VisualEvent.getDefaultTroopEvent();
			default: 
				return null;
		};
	};
	
	Drag.VisualEvent.getCommandName = function(code) {
		if (typeof code === "number")
			return Drag.VisualEvent.commandsName[`command${code}`];
		else 
			return Drag.VisualEvent.commandsName[code];
	};
	
	Drag.VisualEvent.getCommandCategory = function(code) {
		for (category in Drag.VisualEvent.commandsCategories)
			if (Drag.VisualEvent.commandsCategories[category].includes(`command${code}`))
				return category;
			
		return "";
	};
	
	Drag.VisualEvent.getAssociatedCommands = function(code) {
		if (typeof code === "number")
			return Drag.VisualEvent.associatedCommands[`command${code}`] || [];
		else
			return Drag.VisualEvent.associatedCommands[code] || [];
	};
	
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
	
	Drag.VisualEvent.getCommandParameters = function(code) {
		try {
			if (typeof code === "number")
				return JSON.parse(JSON.stringify(Drag.VisualEvent.commandsParameters[`command${code}`])); //deep copy
			else 
				return JSON.parse(JSON.stringify(Drag.VisualEvent.commandsParameters[code]));
		} catch (error) {
			console.error(error);
			return {};
		}
	};
	
	Drag.VisualEvent.getMoveCommandParameters = function(code) {
		return Drag.VisualEvent.moveRouteParameters[parseInt(code)].map(item => {return {...item}}); 
	};
	
	Drag.VisualEvent.getPluginList = function() {
		// return PluginManager ? PluginManager._scripts : [];
		return Array.from(document.querySelectorAll('script')).filter(script => script.src.includes('js/plugins/')).map(script => script.src.split('/js/plugins/').pop().replace('.js', ''));
	};
	
	Drag.VisualEvent.fetchPluginCommands = function(name, callback, parseParams = true, parseCommands = true) {
		Drag.VisualEvent.fetchPluginText(name, {parseParams: parseParams, parseCommands: parseCommands}, callback);
	};
	
	Drag.VisualEvent.fetchPluginText = function(name, options, callback) {
		name = name.replace('.js', '').trim();
		fetch(`js/plugins/${name}.js`).then(res => {
			return res.text();
		}).then(text => {
			const parsed = Drag.VisualEvent.parsePluginJSDoc(text, name, options);
			callback(parsed);
		});
	};
	
	Drag.VisualEvent.parsePluginJSDoc = function(text, name, options = {parseParams: true, parseCommands: true}) {
		if (Utils.RPGMAKER_NAME !== "MZ") {
			Drag.VisualEvent.pluginJSDocData[name] = {};
			return {}
		}
		
		const jsdocRegex = /@[^@\n]+|~struct~\w+:/g;
		const structRegex = /~struct~\w+:/g;
		const matches = [...text.matchAll(jsdocRegex)];
		
		const pluginData = {};
		if (options.parseParams)
			pluginData.params = {};
		if (options.parseCommands)
			pluginData.commands = {};
		if (options.parseParams || options.parseCommands)
			pluginData.structs = {};
		
		for (const [i, match] of matches.entries()) {
			if (match.parsed)
				continue;
			
			const [tag, val] = Drag.VisualEvent.parseJSDocTag(match[0]);
			
			const isStruct = tag.match(structRegex);
			if (tag === "command" || tag === "param" || isStruct) {
				const data = {name: !isStruct ? val : Drag.VisualEvent.getStructName(tag)};
				
				for (let j = i + 1; j < matches.length; j++) {
					const [subTag, subVal] = Drag.VisualEvent.parseJSDocTag(matches[j][0]);
					
					if (subTag === "command" || (subTag === "param" && !isStruct) || subTag.match(structRegex)) 
						break;
					else {
						if (tag === "command" && options.parseCommands) {
							if (subTag === "arg") {
								data.args = data.args || [];
								data.args.push({name: subVal});
							} else {
								if (!data.args)
									data[subTag] = subVal;
								else
									Drag.VisualEvent.parseJSDocTagAndVal(subTag, subVal, data.args[data.args.length - 1]);
							}
						} else if (tag === "param" && options.parseParams) {
							Drag.VisualEvent.parseJSDocTagAndVal(subTag, subVal, data);
						} else if (isStruct && (options.parseCommands || options.parseParams)) {
							if (subTag === "param") {
								data.params = data.params || [];
								data.params.push({name: subVal});
							} else
								Drag.VisualEvent.parseJSDocTagAndVal(subTag, subVal, data.params[data.params.length - 1]);
						}
						
						matches[j].parsed = true;
					}
				}
				
				if (tag === "command" && options.parseCommands)
					pluginData.commands[val] = data;
				else if (tag === "param" && options.parseParams && !isStruct)
					pluginData.params[val] = data;
				else if (isStruct && (options.parseCommands || options.parseParams))
					pluginData.structs[data.name] = data;
				
			} else
				pluginData[tag] = val;
		}
		
		Drag.VisualEvent.pluginJSDocData[name] = pluginData;
		return pluginData;
	};
	
	Drag.VisualEvent.parseJSDocTag = function(text) {
		const tag = text.replace(/ .*/, '').replace("@", '').trim();
		const val = text.substring(tag.length + 1).trim();
		
		return [tag, val];
	};
	
	Drag.VisualEvent.parseJSDocTagAndVal = function(tag, val, obj) {
		const structTypeRegex = /struct<\w+>/g;
		
		if (tag === "type" && val.slice(-2) === "[]") {
			val = val.slice(0, -2);
			obj[tag] = val
			obj["isList"] = true;
		} else if (tag !== "option" && tag !== "value")
			obj[tag] = val;
		
		if (tag === "type" && (val === "combo" || val === "select")) {
			obj["options"] = [];
			obj["values"] = [];
		} else if (obj["options"] && tag === "option") {
			obj["options"].push(val);
			obj["values"].push(val);
		} else if (obj["values"] && tag === "value") 
			obj["values"][obj["values"].length - 1] = val;
		
		if (tag === "type" && val.match(structTypeRegex)) {
			obj["structName"] = Drag.VisualEvent.getStructName(val);
			obj["type"] = "struct";
		}
	};
	
	Drag.VisualEvent.getStructName = function(structString) {
		return structString.replace("struct<", "").replace("~struct~", "").replace(">", "").replace(":", "").replace("[]", "").trim();
	};
	
	Drag.VisualEvent.getPluginCommandParameters = function(pluginName, commandName) {
		const pluginData = Drag.VisualEvent.pluginJSDocData[pluginName];
		const commandData = pluginData ? pluginData.commands[commandName] : null;
		const commandArgs = commandData ? commandData.args : null;
		return commandArgs ? commandArgs.map(item => {return {...item}}) : []; //two level deep copy
	};
	
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
	
	// window.addEventListener("keydown", (event) => { if (event.keyCode === 116) Drag.VisualEvent.reloadGame(); }, true);
	
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
	
	Drag.VisualEvent.insert = function(arr, index, item) {
		if (!Array.isArray(arr))
			return;
		
		arr.splice(index, 0, item);
		return arr;
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
	
	Drag.VisualEvent.deepCopy = function(obj) {
		if (Array.isArray(obj))
			return obj.map(item => Drag.VisualEvent.deepCopy(item));
		else if (obj && typeof obj === "object")
			return Drag.VisualEvent.objectFromEntries(Object.entries(obj).map(entry => [entry[0], Drag.VisualEvent.deepCopy(entry[1])]));
			// return Object.fromEntries(Object.entries(obj).map(entry => [entry[0], Drag.VisualEvent.deepCopy(entry[1])]));
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
	// window opener

	window.addEventListener("keydown", (event) => { if (event.keyCode === 119 && event.ctrlKey && event.shiftKey) Drag.VisualEvent.openEditor(); });
	Drag.VisualEvent.openEditor = function(id = 0, type = "") {
		try {
			if (!Drag.VisualEvent.graphWindowHandler) {
				if (Drag.VisualEvent.modules.fs && Drag.VisualEvent.modules.fs.existsSync(Drag.VisualEvent.nwVisualEventWindowPath)) {
					console.log(Drag.VisualEvent.nwVisualEventWindowPath + " opened by : " + Drag.VisualEvent.pluginName);
					const width = screen.width * 0.75;
					const height = screen.height * 0.75;
					const top = (screen.height / 2) - (height / 2);
					const left = (screen.width / 2) - (width / 2); 
					Drag.VisualEvent.graphWindowHandler = window.open(Drag.VisualEvent.nwVisualEventWindowPath, Drag.VisualEvent.nwVisualEventWindowName, `dependent=1, menubar=0, resizable=1, width=${width}, height=${height}, top=${top}, left=${left}`);
					Drag.VisualEvent.graphWindowHandler.data = {}
					Drag.VisualEvent.graphWindowHandler.data.targetId = parseInt(id);
					Drag.VisualEvent.graphWindowHandler.data.targetType = type;
					
					const GUI = require('nw.gui');
					const GUIWindow = GUI.Window.get();
					GUIWindow.on('close', function() {						
						GUI.App.closeAllWindows();
						GUI.App.quit();
					});
					
					Drag.VisualEvent.graphWindowHandler.addEventListener("beforeunload", Drag.VisualEvent.onCloseEditor);					
				} else { 
					console.error(`Couldn't open ${Drag.VisualEvent.nwVisualEventWindowName}. ${Drag.VisualEvent.nwVisualEventWindowPath} file does not exist or is not in the right place.`);
				}
			} else {
				Drag.VisualEvent.graphWindowHandler.focus();
			}
		} catch(err) {
			console.error(err);
		}
	};
	
	Drag.VisualEvent.getEditor = function() {
		return Drag.VisualEvent.graphWindowHandler;
	};
	
	Drag.VisualEvent.onCloseEditor = function(event) {
		if (event) {
			event.preventDefault();
			// event.returnValue = true;
		}
		
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
		Drag.VisualEvent.graphWindowHandler.removeEventListener("beforeunload", Drag.VisualEvent.onCloseEditor);
		Drag.VisualEvent.graphWindowHandler.close(true);
		Drag.VisualEvent.graphWindowHandler = null;
	};
	
	Drag.VisualEvent.openWindow = function(path, commonDir, name, width, height, top, left, data = {}) {
		try {
			if (!Drag[`${name}WindowHandler`] || Drag[`${name}WindowHandler`].closed) {
				if (Drag.VisualEvent.modules.fs && Drag.VisualEvent.modules.fs.existsSync(path)) {
					const screenWidth = window.screen.width;
					const screenHeight = window.screen.height;
					if (left + width + 20 > screenWidth)
						left += screenWidth - (left + width + 20); 
					if (top + height + (window.outerHeight - window.innerHeight) + 10 > screenHeight)
						top += screenHeight - (top + height + (window.outerHeight - window.innerHeight) + 10); 
					
					Drag[`${name}WindowHandler`] = window.open(path.replace(commonDir, ''), name, `attributionsrc=1, dependent=1, menubar=1, resizable=1, width=${width}, height=${height}, top=${top}, left=${left}`);
					Drag[`${name}WindowHandler`].data = data;
					
					const editor = Drag.VisualEvent.getEditor();
					const fontSize = editor ? Drag.VisualEvent.getDocumentFontSize(editor.document) : 16;
					Drag[`${name}WindowHandler`].addEventListener('load', () => {
						Drag.VisualEvent.setDocumentFontSize(Drag[`${name}WindowHandler`].document, fontSize);
					});
				} else { 
					console.error(`Couldn't open ${name}. ${path} file does not exist or is not in the right place.`);
				}
			} else if(Drag[`${name}WindowHandler`])
				Drag[`${name}WindowHandler`].focus();
		} catch(err) {
			console.error(err);
		}
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
	
	Drag.VisualEvent.openShopProcessingMenu = function(input) {
		const rect = input.getBoundingClientRect();
		const val =  input.getAttribute('data-value') || "";
		Drag.VisualEvent.openWindow(
			'html/Drag_DevTools_ShopProcessing.html', 'html/', 'Shop Processing Menu', 
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
			'html/Drag_DevTools_StructureManager.html', 'html/', 'Structure Manager', 
			window.screen.width * 0.3, window.screen.height * 0.7, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, pluginName: pluginName, structName: structName, value: val}
		);
	};
	
	Drag.VisualEvent.openSwitchVariableMenu = function(input) {
		const rect = input.getBoundingClientRect();
		const type = input.getAttribute('data-inputType') || input.getAttribute('data-type');
		
		Drag.VisualEvent.openWindow(
			'html/Drag_DevTools_SwitchVariableMenu.html', 'html/', 'Switch & Variable Menu', 
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
			'html/Drag_DevTools_MoveRouteMenu.html', 'html/', 'Move Route Menu', 
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
			'html/Drag_DevTools_MapLocationPicker.html', 'html/', 'Map Location Picker', 
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
			'html/Drag_DevTools_MapSettingsMenu.html', 'html/', 'Map Settings Menu', 
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
			Drag.VisualEvent.nwFileExplorerWindowPath, 'html/', Drag.VisualEvent.nwFileExplorerWindowName, 
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
			'html/Drag_DevTools_NotetagManager.html', 'html/', 'Notetag Manager', 
			window.screen.width * 0.225, window.screen.height * 0.6, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input}
		);
	};
	
	Drag.VisualEvent.openTroopMembersManager = function(input, troop, enemies) {
		if (!input || !troop || !enemies)
			return;
		
		const rect = input.getBoundingClientRect();
		Drag.VisualEvent.openWindow(
			'html/Drag_DevTools_TroopMembersManager.html', 'html/', 'Troops Members Manager', 
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
			'html/Drag_DevTools_EventConditionsMenu.html', 'html/', 'Event Conditions', 
			window.screen.width * 0.4, window.screen.height * 0.5, rect.y + input.ownerDocument.defaultView.screenTop, rect.x + input.ownerDocument.defaultView.screenLeft, 
			{input: input, eventType: eventType, eventData: eventData, pageId: pageId, editor: editor}
		);
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
		const tilemap = new Tilemap();
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
	
	Tilemap.prototype._paintLayered = function (data, groundBitmap, ground2Bitmap, lowerBitmap, upperLayer, shadowBitmap, lowerEvents, normalEvents, upperEvents) {
		const tileCols = data.width;
        const tileRows = data.height;
		
		//paint map && shadows
        for (let y = 0; y < tileRows; y++)
            for (let x = 0; x < tileCols; x++)
                this._paintTileOnLayers(groundBitmap, ground2Bitmap, lowerBitmap, upperLayer, shadowBitmap, x, y);

		//pain events
        this._paintCharacters(lowerEvents, 0);
        this._paintCharacters(normalEvents, 1);
        this._paintCharacters(upperEvents, 2);
    };

    Tilemap.prototype._paintCharacters = function (bitmap, priority) {
		for (const child of this.children) { //.filter(child => child && child._character && child._character._priorityType === priority)
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

    Tilemap.prototype._paintTileOnLayers = function (groundBitmap, ground2Bitmap, lowerBitmap, upperBitmap, shadowBitmap, x, y) {
        const tableEdgeVirtualId = 10000;
        const mx = x;
        const my = y;
		// var dx = (mx * this._tileWidth).mod(this._layerWidth);
		// var dy = (my * this._tileHeight).mod(this._layerHeight);
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
            if (tileId < 0) {
                // if (shadowBits !== undefined) {
                    // MapShotTileMap.prototype._drawShadow.call(me, bitmap, shadowBits, dx, dy);
                // }
            } else if (tileId >= tableEdgeVirtualId) {
                MapShotTileMap.prototype._drawTableEdge.call(me, bitmap, upperTileId1, dx, dy);
            } else {
                me._drawTileOldStyle(bitmap, tileId, dx, dy);
            }
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
			MapShotTileMap.prototype._drawShadow.call(this, shadowBitmap, shadowBits, dx, dy);
    };
	
	Tilemap.prototype._paintTilesOnBitmap = function (data, lowerBitmap, upperBitmap, x, y) {
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
            if (lowerTileId < 0) {
                // if ($.Param.drawAutoShadows) {
                    // MapShotTileMap.prototype._drawShadow.call(this, lowerBitmap, shadowBits, dx, dy);
                // }
            } else if (lowerTileId >= tableEdgeVirtualId)
                MapShotTileMap.prototype._drawTableEdge.call(this, lowerBitmap, upperTileId1, dx, dy);
            else
                this._drawTileOldStyle(lowerBitmap, lowerTileId, dx, dy);
        }

        for (let j = 0; j < upperTiles.length; j++)
            this._drawTileOldStyle(upperBitmap, upperTiles[j], dx, dy);
    };
	
	Tilemap.prototype._drawTileOldStyle = function (bitmap, tileId, dx, dy) {
        if (Tilemap.isVisibleTile(tileId)) {
            if (Tilemap.isAutotile(tileId))
				MapShotTileMap.prototype._drawAutotile.call(this, bitmap, tileId, dx, dy);
            else
                MapShotTileMap.prototype._drawNormalTile.call(this, bitmap, tileId, dx, dy);
        }
    };
	
	function MapShotTileMap() {}

    MapShotTileMap.prototype = Object.create(Tilemap.prototype);
    MapShotTileMap.prototype.constructor = MapShotTileMap;

    MapShotTileMap.prototype._drawAutotile = function (bitmap, tileId, dx, dy) {
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
                        // qsx2 = [0, 3, 2, 1][qsx];
					
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

    MapShotTileMap.prototype._drawNormalTile = function(bitmap, tileId, dx, dy) {
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

    MapShotTileMap.prototype._drawTableEdge = function(bitmap, tileId, dx, dy) {
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

    MapShotTileMap.prototype._drawShadow = function(bitmap, shadowBits, dx, dy) {
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
	// XHR Read JSON
	
	Drag.VisualEvent.loadEditorCache = function() {
		const url = "html/data/cache.json";
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.overrideMimeType("application/json");
		xhr.onload = () => this.onEditorCacheLoad(xhr);
		xhr.onerror = () => this.onEditorCacheError();
		xhr.send();
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
	
	Drag.VisualEvent.isRadio = function (element) {
		return (element && element.nodeName && Drag.VisualEvent.isInput(element) && element.type.toLowerCase() === "radio");
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
			element.style.backgroundImage = "url(../img/tilesets/" + filename[0] + ".png)";
		else if (Array.isArray(src) ? filename.filter(name => name).length > 0 : filename[0])
			element.style.backgroundImage = Array.isArray(src) ? src.map((url, i) => "url(../" + url + "/" + filename[i] + ".png)").join(', ') : "url(../" + src + "/" + filename[0] + ".png)";
		
		const isFullCharacterSheet = element.getAttribute('data-isFullCharacterSheet') === "true";
		const isCharacterSheet = element.getAttribute('data-isCharacterSheet') === "true" || isFullCharacterSheet;
		const subImageWidth = parseInt(element.getAttribute('data-subImageWidth'));
		const subImageHeight = parseInt(element.getAttribute('data-subImageHeight'));
		if (!isCharacterSheet && (!subImageWidth || !subImageHeight))
			return;
		
		const image = new Image();
		image.src = !isTile ? Array.isArray(src) ? `../${src[0]}/${filename[0]}.png` : `../${src}/${filename[0]}.png` : `../img/tilesets/${filename[0]}.png`;

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
	
	Drag.VisualEvent.getFileList = function(sPath = '', types = '*') {
		if (!Drag.VisualEvent.modules.fs || !Drag.VisualEvent.modules.path)
			return;
		
		if (!Drag.VisualEvent.modules.fs.existsSync(sPath))
			return [];
		
		const filesAndFolders = Drag.VisualEvent.modules.fs.readdirSync(sPath);
		const files = filesAndFolders.filter((item) => {
			const itemPath = Drag.VisualEvent.modules.path.join(sPath, item);
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
		Drag.VisualEvent.addListInput(button);
		Drag.VisualEvent.onInputChange(button);
		
		const editor = Drag.VisualEvent.getEditor();
		if (button.ownerDocument.defaultView === editor) {
			const node = Drag.VisualEvent.getAncestorById(button, 'graphNode');
			if (node)
				editor.cacheGraphNode(node);
		}
	};
	
	Drag.VisualEvent.addListInput = function(button) {
		if (!button)
			return;
		
		const clone = button.parentElement.cloneNode(true);
		const node = Drag.VisualEvent.getAncestorById(button, 'graphNode');
		const editor = Drag.VisualEvent.getEditor();
		
		if (!node || !editor)
			return;
		
		//attribute unique id to radios
		const radios = Array.from(clone.querySelectorAll('input[type="radio"]'));
		const id = `nodeRadioInput${Drag.VisualEvent.getUniqueId()}`;
		for (const radio of radios) {
			radio.setAttribute('id', id);
			radio.setAttribute('name', id);
			radio.previousElementSibling.setAttribute('for', id);
		}
		
		//deconnect connections
		const connections = Array.from(clone.querySelectorAll('.exec.inputConnection')).concat(Array.from(clone.querySelectorAll('.exec.outputConnection')));
		for (const connection of connections)
			editor.setConnectionConnected(connection, false);
		
		//add element
		button.parentElement.after(clone);
		
		editor.refreshNodeConnections(node);
		editor.refreshNode(node);
		
		return clone;
	};
	
	Drag.VisualEvent.onRemoveListInput = function(button) {
		if (!button)
			return;
		
		const node = Drag.VisualEvent.getAncestorById(button, 'graphNode');
		const editor = Drag.VisualEvent.getEditor();
		
		if (!node || !editor)
			return;
		
		//prevent action if last list element or min list requires it
		const parent = button.parentElement.parentElement; 
		const listElementCount = Array.from(parent.querySelectorAll('#add-list-input-button')).length;
		const minList = parseInt(button.getAttribute('data-minList')) || 1;
		if (listElementCount <= minList) 
			return;
		
		//remove curve if contains connected connections
		const connections = Array.from(button.parentElement.querySelectorAll('.exec.inputConnection')).concat(Array.from(button.parentElement.querySelectorAll('.exec.outputConnection')));
		for (const connection of connections)
			editor.removeConnectionCurves(connection);
		
		//remove element
		// if (listElementCount > 1) 
		button.parentElement.remove(); 
		
		editor.refreshNodeConnections(node);
		editor.refreshNode(node);
		
		Drag.VisualEvent.onInputChange(parent);
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
	
	Drag.VisualEvent.autoFitTextArea = function(textArea) {		
		if (textArea.getAttribute('data-resizeWidth') !== "false") {
			textArea.style.width = "";
			textArea.style.width = (Math.max(...textArea.value.split('\n').map(text => text.length)) + 2) * 8 + "px";
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
				${params.name && params.showName ? `<span style="margin-left: 0.5em;" onclick="$.Drag.VisualEvent.toggleCheckbox(this.previousElementSibling);">${params.name}</span>` : ''}
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
					<div title="Rename ${params.type === 'switch' ? 'Switches' : 'Variables'}" class="flex">
						<svg style="margin-left: 5px; cursor: pointer;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
							width="1.5em" height="1.5em" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve" data-type="${params.type}" onclick="$.Drag.VisualEvent.openSwitchVariableMenu(this.parentElement.previousElementSibling.previousElementSibling);">
							<path style="stroke-width: 1px; fill: white;" d="M18,20H2c-0.6,0-1-0.4-1-1s0.4-1,1-1h16c0.6,0,1,0.4,1,1S18.6,20,18,20z"></path>
							<path style="stroke-width: 1px; fill: white;" d="M7,16H3c-0.6,0-1-0.4-1-1v-4c0-0.3,0.1-0.5,0.3-0.7l10-10c0.4-0.4,1-0.4,1.4,0l4,4c0.4,0.4,0.4,1,0,1.4l-10,10 C7.5,15.9,7.3,16,7,16z M4,14h2.6l9-9L13,2.4l-9,9V14z"></path>
						</svg>
					</div>
				` : ''}
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
		return negrgb.map(value => Drag.VisualEvent.lerp(0, 255, (value + 255) / 510));
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
	
	Drag.VisualEvent.getEmptyInputField = function(params, index, controller = null) {
		return ``;
	};
	
// })();