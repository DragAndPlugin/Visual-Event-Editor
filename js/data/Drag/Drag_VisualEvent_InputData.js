module.exports = function(Drag, RPGMAKER_NAME) {
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
					type: "interactive", name: "Game Data", behavior: RPGMAKER_NAME === "MZ" ? [0, 1, 2, [3, 4], [5, 6], [7, 8], 9, 10, 11] : [0, 1, 2, [3, 4], [5, 6], [7, 8], 9, 10],
					controller: RPGMAKER_NAME === "MZ" ? Drag.VisualEvent.inputs.selectMZGameDataType : Drag.VisualEvent.inputs.selectMVGameDataType, 
					dependances: RPGMAKER_NAME === "MZ" ? [
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
					dependancesStyle: RPGMAKER_NAME === "MZ" ? [1, 1, 1, [0.5, 0.5], [0.5, 0.5], [0.5, 0.5], 1, 1, 1] : [1, 1, 1, [0.5, 0.5], [0.5, 0.5], [0.5, 0.5], 1, 1]
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
		selectConditional: RPGMAKER_NAME === "MZ" ? {
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
			type: "interactive", name: "Location", behavior: RPGMAKER_NAME === "MZ" ? [0, [1, 2], 3] : [0, [1, 2]],
			controller: RPGMAKER_NAME === "MZ" ? Drag.VisualEvent.inputs.selectMZInfoTypeLocationDesignation : Drag.VisualEvent.inputs.selectMVInfoTypeLocationDesignation,
			dependances: RPGMAKER_NAME === "MZ" ? 
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
};