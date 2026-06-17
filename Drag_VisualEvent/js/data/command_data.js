module.exports = function(VisualEvent, RPGMAKER_NAME) {
	VisualEvent.commandsCategories = {
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
	
	VisualEvent.flatCommandsName = [
		"Show Text", "Show Choices", "Input Number", "Select Item", "Show Scrolling Text", "Comment", 
		"Conditional Branch", "Loop", "Break Loop",
		"Exit Event Processing", "Common Event", "Label", "Jump to Label",
		"Control Switches", "Control Variables", "Control Self Switch", "Control Timer",
		"Change Gold", "Change Items", "Change Weapons", "Change Armors", "Change Party Member",
		"Change Battle BGM", "Change Victory ME", "Change Save Access", "Change Menu Access",
		"Change Encounter", "Change Formation Access", "Change Window Color", "Change Defeat ME", "Change Vehicle BGM",
		"Transfer Player", "Set Vehicle Location", "Set Event Location", "Scroll Map", "Set Movement Route", "Get On/Off Vehicle",
		"Change Transparency", "Show Animation", "Show Balloon Icon", "Erase Event", "Change Player Followers", "Gather Followers",
		"Fade Out Screen", "Fade In Screen", "Tint Screen", "Flash Screen", "Shake Screen",
		"Wait", "Show Picture", "Move Picture", "Rotate Picture", "Tint Picture", "Erase Picture",
		"Set Weather Effect", "Play BGM", "Fadeout BGM", "Save BGM", "Replay BGM", "Play BGS", "Fadeout BGS",
		"Play ME", "Play SE", "Stop SE", "Play Movie", "Change Map Name Display", "Change Tileset",
		"Change Battle Background", "Change Parallax", "Get Location Info", "Battle Processing",
		"Shop Processing", "Name Input Processing", "Change HP", "Change MP", "Change TP", "Change State", "Recover All",
		"Change EXP", "Change Level", "Change Parameter", "Change Skill", "Change Equipment", "Change Name", "Change Class",
		"Change Actor Images", "Change Vehicle Image", "Change Nickname", "Change Profile", "Change Enemy HP", "Change Enemy MP",
		"Change Enemy TP", "Change Enemy State", "Enemy Recover All", "Enemy Appear", "Enemy Transform", "Show Battle Animation",
		"Force Action", "Abort Battle", "Open Menu Screen", "Open Save Screen", "Game Over", "Return to Title Screen", 
		"Script",
	];
	
	VisualEvent.commandsName = {
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
	
	VisualEvent.commandsDescription = {
		command101: "Displays one or more messages in a dialogue window.",
		command102: "Shows a list of choices and branches execution depending on the player's selection.",
		command103: "Prompts the player to enter a number and stores the result in a variable.",
		command104: "Lets the player choose an item from the inventory and stores the result in a variable.",
		command105: "Displays text that scrolls automatically on the screen.",
		command108: "Adds a comment to the event. Comments do not affect execution and are mainly used for organization or plugin commands.",
		command111: "Checks whether a condition is met and branches execution accordingly.",
		command112: "Starts a loop that repeats until a Break Loop command or another interruption stops it.",
		command113: "Exits the current loop and continues execution after it.",
		command115: "Stops the current event immediately and ends its execution.",
		command117: "Runs the specified common event.",
		command118: "Creates a label that can be used as a jump target within the same event.",
		command119: "Jumps execution to the specified label within the same event.",
		command121: "Turns one or more switches on or off.",
		command122: "Changes the value of one or more variables using a constant, another variable, random values, game data, or a script.",
		command123: "Turns the current event's self switch on or off.",
		command124: "Starts, stops, or changes the value of the timer.",
		command125: "Increases or decreases the party's gold.",
		command126: "Adds or removes items from the party's inventory.",
		command127: "Adds or removes weapons from the party's inventory, optionally including equipped ones.",
		command128: "Adds or removes armors from the party's inventory, optionally including equipped ones.",
		command129: "Adds an actor to the party or removes one from it.",
		command132: "Changes the background music played during battles.",
		command133: "Changes the music effect played after winning a battle.",
		command134: "Enables or disables access to the save command.",
		command135: "Enables or disables access to the menu.",
		command136: "Enables or disables random encounters.",
		command137: "Enables or disables access to party formation changes.",
		command138: "Changes the color tone of window backgrounds.",
		command139: "Changes the music effect played after being defeated in battle.",
		command140: "Changes the background music used by a vehicle.",
		command201: "Transfers the player to a specified map and coordinates, with optional direction and fade settings.",
		command202: "Sets the location of a vehicle to a specified map and position.",
		command203: "Moves an event to a specified location or exchanges positions with another event.",
		command204: "Scrolls the map automatically in a specified direction at a chosen speed.",
		command205: "Assigns a custom movement route to a character or event.",
		command206: "Makes the player board or disembark from a vehicle.",
		command211: "Changes the player's transparency, making them visible or invisible.",
		command212: "Displays an animation on a specified character or event.",
		command213: "Displays a balloon icon above a specified character or event.",
		command214: "Erases the current event until the map is reloaded.",
		command216: "Shows or hides the player's followers.",
		command217: "Gathers all followers to the player's current position.",
		command221: "Gradually fades the screen to black.",
		command222: "Gradually fades the screen in from black.",
		command223: "Applies a color tint to the screen over a specified duration.",
		command224: "Flashes the screen with a specified color and intensity.",
		command225: "Shakes the screen with a specified power and duration.",
		command230: "Pauses event execution for a specified duration.",
		command231: "Displays a picture on the screen.",
		command232: "Moves a displayed picture to a new position with optional transformations.",
		command233: "Rotates a displayed picture at a specified speed.",
		command234: "Applies a color tint to a displayed picture.",
		command235: "Removes a picture from the screen.",
		command236: "Changes the weather effect, such as rain, storm, or snow.",
		command241: "Plays background music (BGM).",
		command242: "Gradually fades out the currently playing BGM.",
		command243: "Saves the current BGM for later playback.",
		command244: "Replays the previously saved BGM.",
		command245: "Plays background sounds (BGS).",
		command246: "Gradually fades out the currently playing BGS.",
		command249: "Plays a music effect (ME), typically used for victory or fanfare.",
		command250: "Plays a sound effect (SE).",
		command251: "Stops all currently playing sound effects.",
		command261: "Plays a movie file on the screen.",
		command281: "Shows or hides the map name display.",
		command282: "Changes the current map's tileset.",
		command283: "Changes the battle background.",
		command284: "Changes the map's parallax background.",
		command285: "Retrieves location data from the map and stores it in a variable.",
		command301: "Starts a battle against a specified troop, with options for escape and defeat handling.",
		command302: "Opens the shop interface, allowing the player to buy and sell goods.",
		command303: "Prompts the player to enter a name for the specified actor.",
		command311: "Increases or decreases an actor's HP, optionally allowing knockout.",
		command312: "Increases or decreases an actor's MP.",
		command326: "Increases or decreases an actor's TP.",
		command313: "Adds or removes states from an actor.",
		command314: "Fully restores an actor's HP, MP, and removes all states.",
		command315: "Increases or decreases an actor's experience points.",
		command316: "Changes an actor's level.",
		command317: "Changes an actor's parameters such as Max HP, Max MP, Attack, Defense, and others.",
		command318: "Teaches or removes skills from an actor.",
		command319: "Changes an actor's equipment.",
		command320: "Changes an actor's name.",
		command321: "Changes an actor's class.",
		command322: "Changes an actor's face, character sprite, and battler images.",
		command323: "Changes a vehicle's character sprite.",
		command324: "Changes an actor's nickname.",
		command325: "Changes an actor's profile description.",
		command331: "Increases or decreases an enemy's HP during battle.",
		command332: "Increases or decreases an enemy's MP during battle.",
		command342: "Increases or decreases an enemy's TP during battle.",
		command333: "Adds or removes states from an enemy during battle.",
		command334: "Fully restores an enemy's HP, MP, and removes all states.",
		command335: "Makes a hidden enemy appear in battle.",
		command336: "Transforms an enemy into another enemy.",
		command337: "Displays a battle animation on a target.",
		command339: "Forces a battler to perform a specified action.",
		command340: "Immediately ends the current battle.",
		command351: "Opens the main menu screen.",
		command352: "Opens the save screen.",
		command353: "Triggers the game over screen.",
		command354: "Returns to the title screen.",
		command355: "Executes JavaScript code.",
		command356: "Executes a plugin command using the RPG Maker MV format.",
		command357: "Executes a plugin command using the RPG Maker MZ format with structured arguments.",
	};
	
	VisualEvent.commandsEngine = {
		command356: "MV",
		command357: "MZ"
	};
	
	//command added here won't have their own nodes and will be ignored. their inputs, if they have any will be added to their parent/associated command. 
	//ie : command 401 will be ignored, its text input will be added to command101
	VisualEvent.associatedCommands = {
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
	
	VisualEvent.flatAssociatedCommandsCode = [401, 402, 403, 404, 405, 408, 411, 412, 413, 505, 601, 602, 603, 604, 605, 655, 657];
	
	VisualEvent.commandsParametersIndex = {
		command102: [0, 4, 3, 2, 1],
		command111: [RPGMAKER_NAME === "MZ" ? 
			{controller: 0, dependances: [1, 2, 1, 4, {controller: 2, dependances: [3, 3]}, 1, 2, 2, 1, 1, 1, {controller: 2, dependances: [3, 3, 3, 3, 3, 3]}, 1, {controller: 2, dependances: [3]}, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1]}
			:
			{controller: 0, dependances: [1, 2, 1, 4, {controller: 2, dependances: [3, 3]}, 1, 2, 2, 1, 1, 1, {controller: 2, dependances: [3, 3, 3, 3, 3, 3]}, 1, {controller: 2, dependances: [3]}, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1]}
		],
		command122: [{controller: -1, dependances: [0, 1]}, 2, {controller: 3, dependances: [4, 4, 4, 5, {controller: 4, dependances: RPGMAKER_NAME === "MZ" ? [5, 5, 5, 5, 6, 5, 6, 5, 6, 5, 5, 5] : [5, 5, 5, 5, 6, 5, 6, 5, 6, 5, 5,]}, 4]}],
	};
	
	VisualEvent.commandsParameters = {		
		command101: RPGMAKER_NAME === "MZ" ? [VisualEvent.inputs.face, VisualEvent.inputs.selectWindowBackground, VisualEvent.inputs.selectVerticalPosition, VisualEvent.inputs.name] : [VisualEvent.inputs.face, VisualEvent.inputs.selectWindowBackground, VisualEvent.inputs.selectVerticalPosition],
		command401: [VisualEvent.inputs.text],
		command102: [VisualEvent.inputs.choicesOutput, VisualEvent.inputs.cancelOutput, VisualEvent.inputs.selectWindowBackground, VisualEvent.inputs.selectHorizontalPosition, VisualEvent.inputs.defaultChoice, VisualEvent.inputs.cancelChoice],
		command402: [],
		command403: [],
		command404: [],
		command103: [VisualEvent.inputs.variable, VisualEvent.inputs.digits],
		command104: [VisualEvent.inputs.variable, VisualEvent.inputs.selectItemType],
		command105: [VisualEvent.inputs.scrollingSpeed, VisualEvent.inputs.fastForward],
		command405: [VisualEvent.inputs.text],
		command108: [VisualEvent.inputs.text],
		command408: [VisualEvent.inputs.text],
		command111: [VisualEvent.interactiveInputs.selectConditional, VisualEvent.inputs.ifOutput, VisualEvent.inputs.elseOutput],
		command411: [],
		command112: [VisualEvent.inputs.loopOutput],
		command412: [],
		command413: [],
		command113: [],
		command115: [],
		command117: [VisualEvent.inputs.commonEvent],
		command118: [VisualEvent.inputs.label],
		command119: [VisualEvent.inputs.label],
		command121: [VisualEvent.interactiveInputs.selectSwitchWithRange, VisualEvent.inputs.radioOnOff],
		command122: [VisualEvent.interactiveInputs.selectVariableWithRange, VisualEvent.inputs.radioOperation, VisualEvent.interactiveInputs.selectVariableOperand],
		command123: [VisualEvent.inputs.selectSelfSwitch, VisualEvent.inputs.radioOnOff],
		command124: [VisualEvent.interactiveInputs.selectTimerAction],
		command125: [VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand],
		command126: [VisualEvent.inputs.item, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand],
		command127: [VisualEvent.inputs.weapon, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand, VisualEvent.inputs.includeEquipment],
		command128: [VisualEvent.inputs.armor, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand, VisualEvent.inputs.includeEquipment],
		command129: [VisualEvent.inputs.actor, VisualEvent.inputs.radioOperation3, VisualEvent.inputs.initialize],
		command132: [VisualEvent.inputs.bgm, VisualEvent.inputs.volume, VisualEvent.inputs.pitch, VisualEvent.inputs.pan, VisualEvent.inputs.play, VisualEvent.inputs.stop],
		command133: [VisualEvent.inputs.victoryme, VisualEvent.inputs.volume, VisualEvent.inputs.pitch, VisualEvent.inputs.pan, VisualEvent.inputs.play, VisualEvent.inputs.stop],
		command134: [VisualEvent.inputs.radioEnabledDisabled],
		command135: [VisualEvent.inputs.radioEnabledDisabled],
		command136: [VisualEvent.inputs.radioEnabledDisabled],
		command137: [VisualEvent.inputs.radioEnabledDisabled],
		command138: [VisualEvent.inputs.rgba],
		command139: [VisualEvent.inputs.defeatme, VisualEvent.inputs.volume, VisualEvent.inputs.pitch, VisualEvent.inputs.pan, VisualEvent.inputs.play, VisualEvent.inputs.stop],
		command140: [VisualEvent.inputs.selectVehicle, VisualEvent.inputs.bgm, VisualEvent.inputs.volume, VisualEvent.inputs.pitch, VisualEvent.inputs.pan, VisualEvent.inputs.play, VisualEvent.inputs.stop],
		command201: [VisualEvent.interactiveInputs.selectLocationWithDesignation, VisualEvent.inputs.selectDirectionRetain, VisualEvent.inputs.selectFade],
		command202: [VisualEvent.inputs.selectVehicle, VisualEvent.interactiveInputs.selectLocationWithDesignation],
		command203: [VisualEvent.inputs.mapEventWithThis, VisualEvent.interactiveInputs.selectEventLocationWithDesignation, VisualEvent.inputs.selectDirectionRetain], //remove mapID value since it use current map
		command204: [VisualEvent.inputs.selectDirection, VisualEvent.inputs.distance, VisualEvent.inputs.selectSpeed, VisualEvent.inputs.waitForCompletion],
		command205: [VisualEvent.inputs.moveRoute],
		command505: [],
		command206: [],
		command211: [VisualEvent.inputs.radioTransparency],
		command212: [VisualEvent.inputs.mapEventWithThisAndPlayer, VisualEvent.inputs.animation, VisualEvent.inputs.waitForCompletion],
		command213: [VisualEvent.inputs.mapEventWithThisAndPlayer, VisualEvent.inputs.selectBalloonIcon, VisualEvent.inputs.waitForCompletion],
		command214: [],
		command216: [VisualEvent.inputs.radioFollowers],
		command217: [],
		command221: [],
		command222: [],
		command223: [VisualEvent.inputs.rgbg, VisualEvent.inputs.normalTint, VisualEvent.inputs.darkTint, VisualEvent.inputs.sepiaTint, VisualEvent.inputs.sunsetTint, VisualEvent.inputs.nightTint, VisualEvent.inputs.durationFrame, VisualEvent.inputs.waitForCompletion],
		command224: [VisualEvent.inputs.rgbi, VisualEvent.inputs.durationFrame, VisualEvent.inputs.waitForCompletion], 
		command225: [VisualEvent.inputs.rangePower, VisualEvent.inputs.rangeSpeed, VisualEvent.inputs.durationFrame, VisualEvent.inputs.waitForCompletion],
		command230: [VisualEvent.inputs.durationFrame],
		command231: [VisualEvent.inputs.pictureID, VisualEvent.inputs.picture, VisualEvent.inputs.selectOrigin, VisualEvent.interactiveInputs.directVariablePosition, VisualEvent.inputs.width, VisualEvent.inputs.height, VisualEvent.inputs.opacity, VisualEvent.inputs.selectBlendMode, VisualEvent.inputs.pictureGridPlacement],
		command232: [VisualEvent.inputs.pictureID, VisualEvent.inputs.empty, VisualEvent.inputs.selectOrigin, VisualEvent.interactiveInputs.directVariablePosition, VisualEvent.inputs.width, VisualEvent.inputs.height, VisualEvent.inputs.opacity, VisualEvent.inputs.selectBlendMode, VisualEvent.inputs.durationFrame, VisualEvent.inputs.waitForCompletion, RPGMAKER_NAME === "MZ" ? VisualEvent.inputs.selectEasingType : VisualEvent.inputs.empty],
		command233: [VisualEvent.inputs.pictureID, VisualEvent.inputs.speed],
		command234: [VisualEvent.inputs.pictureNumber, VisualEvent.inputs.rgbg, VisualEvent.inputs.normalTint, VisualEvent.inputs.darkTint, VisualEvent.inputs.sepiaTint, VisualEvent.inputs.sunsetTint, VisualEvent.inputs.nightTint, VisualEvent.inputs.durationFrame, VisualEvent.inputs.waitForCompletion],
		command235: [VisualEvent.inputs.pictureID],
		command236: [VisualEvent.inputs.selectWeather, VisualEvent.inputs.rangePower, VisualEvent.inputs.durationFrame, VisualEvent.inputs.waitForCompletion],
		command241: [VisualEvent.inputs.bgm, VisualEvent.inputs.volume, VisualEvent.inputs.pitch, VisualEvent.inputs.pan, VisualEvent.inputs.play, VisualEvent.inputs.stop],
		command242: [VisualEvent.inputs.durationSeconds],
		command243: [],
		command244: [],
		command245: [VisualEvent.inputs.bgs, VisualEvent.inputs.volume, VisualEvent.inputs.pitch, VisualEvent.inputs.pan, VisualEvent.inputs.play, VisualEvent.inputs.stop],
		command246: [VisualEvent.inputs.durationSeconds],
		command249: [VisualEvent.inputs.me, VisualEvent.inputs.volume, VisualEvent.inputs.pitch, VisualEvent.inputs.pan, VisualEvent.inputs.play, VisualEvent.inputs.stop],
		command250: [VisualEvent.inputs.se, VisualEvent.inputs.volume, VisualEvent.inputs.pitch, VisualEvent.inputs.pan, VisualEvent.inputs.play, VisualEvent.inputs.stop],
		command251: [],
		command261: [VisualEvent.inputs.movie],
		command281: [VisualEvent.inputs.radioOnOff],
		command282: [VisualEvent.inputs.tileset],
		command283: [VisualEvent.inputs.battlebacks],
		command284: [VisualEvent.inputs.parallax, VisualEvent.inputs.horizontalLoop, VisualEvent.inputs.verticalLoop, VisualEvent.inputs.horizontalScroll, VisualEvent.inputs.verticalScroll],
		command285: [VisualEvent.inputs.variable, VisualEvent.inputs.selectInfoType, VisualEvent.interactiveInputs.selectInfoLocationWithDesignation], //remove mapID value since it use current map
		command301: [VisualEvent.interactiveInputs.selectTroopDesignation, VisualEvent.inputs.canEscape, VisualEvent.inputs.canLose, VisualEvent.inputs.winOutput, VisualEvent.inputs.escapeOutput, VisualEvent.inputs.loseOutput],
		command601: [],
		command602: [],
		command603: [],
		command604: [],
		command302: [VisualEvent.inputs.shopProcessing, VisualEvent.inputs.purchaseOnly],
		command605: [VisualEvent.inputs.shopProcessing],
		command303: [VisualEvent.inputs.actor, VisualEvent.inputs.maximumCharacters],
		command311: [VisualEvent.interactiveInputs.selectActorWithRange, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand, VisualEvent.inputs.allowDeath],
		command312: [VisualEvent.interactiveInputs.selectActorWithRange, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand],
		command326: [VisualEvent.interactiveInputs.selectActorWithRange, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand],
		command313: [VisualEvent.interactiveInputs.selectActorWithRange, VisualEvent.inputs.radioOperation3, VisualEvent.inputs.state],
		command314: [VisualEvent.interactiveInputs.selectActorWithRange],
		command315: [VisualEvent.interactiveInputs.selectActorWithRange, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand, VisualEvent.inputs.showLevelUp],
		command316: [VisualEvent.interactiveInputs.selectActorWithRange, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand, VisualEvent.inputs.showLevelUp],
		command317: [VisualEvent.interactiveInputs.selectActorWithRange, VisualEvent.inputs.selectParameter, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand],
		command318: [VisualEvent.interactiveInputs.selectActorWithRange, VisualEvent.inputs.radioLearnForget, VisualEvent.inputs.skill],
		command319: [VisualEvent.inputs.actor, VisualEvent.interactiveInputs.selectEquipmentWithType],
		command320: [VisualEvent.inputs.actor, VisualEvent.inputs.name],
		command321: [VisualEvent.inputs.actor, VisualEvent.inputs.class, VisualEvent.inputs.saveExp],
		command322: [VisualEvent.inputs.actor, VisualEvent.inputs.face, VisualEvent.inputs.characterSheet, VisualEvent.inputs.svbattler], //make face character battler update on change actor
		command323: [VisualEvent.inputs.selectVehicle, VisualEvent.inputs.characterSheet], //make vehicle image update on change vehicle
		command324: [VisualEvent.inputs.actor, VisualEvent.inputs.name],
		command325: [VisualEvent.inputs.actor, VisualEvent.inputs.text],
		command331: [VisualEvent.inputs.selectTroopEnemy, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand, VisualEvent.inputs.allowDeath],
		command332: [VisualEvent.inputs.selectTroopEnemy, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand],
		command342: [VisualEvent.inputs.selectTroopEnemy, VisualEvent.inputs.radioOperation2, VisualEvent.interactiveInputs.selectOperand],
		command333: [VisualEvent.inputs.selectTroopEnemy, VisualEvent.inputs.radioOperation3, VisualEvent.inputs.state],
		command334: [VisualEvent.inputs.selectTroopEnemy],
		command335: [VisualEvent.inputs.selectTroopEnemy2],
		command336: [VisualEvent.inputs.selectTroopEnemy2, VisualEvent.inputs.enemy],
		command337: RPGMAKER_NAME === "MZ" ? [VisualEvent.inputs.selectTroopEnemy, VisualEvent.inputs.animation] : [VisualEvent.inputs.selectTroopEnemy, VisualEvent.inputs.animation, VisualEvent.inputs.targetAllEnemies],
		command339: [VisualEvent.interactiveInputs.selectEnemyActorSubject, VisualEvent.inputs.skill, VisualEvent.inputs.selectTarget],
		command340: [],
		command351: [],
		command352: [],
		command353: [],
		command354: [],
		command355: [VisualEvent.inputs.text],
		command655: [VisualEvent.inputs.text],
		command356: [VisualEvent.inputs.text], //Plugin Command MV, to improve, if possible
		command357: [], //plugin command MZ inputs are defined by the jsdoc parser
		command657: []
	};
	
	VisualEvent.moveRouteNames = [
		'End', 'Move Down', 'Move Left', 'Move Right', 'Move Up', 'Move Lower Left', 'Move Lower Right', 'Move Upper Left', 'Move Upper Right', 'Move at Random', 'Move Toward Player', 'Move Away from Player', 'Move Forward', 'Move Backward', 
		'Jump', 'Wait', 'Turn Down', 'Turn Left', 'Turn Right', 'Turn Up', 'Turn 90° Right', 'Turn 90° Left', 'Turn 180°', 'Turn 90° Right or Left', 'Turn at Random', 'Turn Toward Player', 'Turn Away from Player', 
		'Switch On', 'Switch Off', 'Change Speed', 'Change Frequency', 'Walking Animation On', 'Walking Animation Off', 'Stepping Animation On', 'Stepping Animation Off', 'Direction Fix On', 'Direction Fix Off', 
		'Through On', 'Through Off', 'Transparent On', 'Transparent Off', 'Change Image', 'Change Opacity', 'Change Blend Mode', 'Play SE', 'Script'
	];
	
	VisualEvent.moveRouteParameters = {
		14: [VisualEvent.inputs.x, VisualEvent.inputs.y],
		15: [VisualEvent.inputs.durationFrame],
		27: [VisualEvent.inputs.switch],
		28: [VisualEvent.inputs.switch],
		29: [VisualEvent.inputs.selectSpeed],
		30: [VisualEvent.inputs.selectFrequency],
		41: [VisualEvent.inputs.characterSheet],
		42: [VisualEvent.inputs.opacity],
		43: [VisualEvent.inputs.selectBlendMode],
		44: [VisualEvent.inputs.se],
		45: [VisualEvent.inputs.script],
	};
	
	VisualEvent.getCommandName = function(code) {
		if (typeof code === "number")
			return VisualEvent.commandsName[`command${code}`];
		else 
			return VisualEvent.commandsName[code];
	};
	
	VisualEvent.getCommandCategory = function(code) {
		for (category in VisualEvent.commandsCategories)
			if (VisualEvent.commandsCategories[category].includes(`command${code}`))
				return category;
			
		return "";
	};
	
	VisualEvent.getCommandDescription = function(code) {
		if (typeof code === "number")
			return VisualEvent.commandsDescription[`command${code}`];
		else 
			return VisualEvent.commandsDescription[code];
	};
	
	VisualEvent.getAssociatedCommands = function(code) {
		if (typeof code === "number")
			return VisualEvent.associatedCommands[`command${code}`] || [];
		else
			return VisualEvent.associatedCommands[code] || [];
	};
	
	VisualEvent.getAssociatedCommandsParent = function(code) {
		if (typeof code === "number")
			code = `command${code}`;
			
		for (const key in VisualEvent.associatedCommands)
			if (VisualEvent.associatedCommands[key].indexOf(code) !== -1)
				return key;
	};
	
	VisualEvent.getCommandParameters = function(code) {
		try {
			const commandParameters = typeof code === "number" ? VisualEvent.commandsParameters[`command${code}`] : VisualEvent.commandsParameters[code];
			if (commandParameters)
				return JSON.parse(JSON.stringify(commandParameters)); //deep copy
			else 
				return {};
		} catch (error) {
			console.error(error);
			return {};
		}
	};
	
	VisualEvent.getMoveCommandParameters = function(code) {
		return VisualEvent.moveRouteParameters[parseInt(code)].map(item => {return {...item}}); 
	};

};