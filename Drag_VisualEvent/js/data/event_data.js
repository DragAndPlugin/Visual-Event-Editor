module.exports = function(VisualEvent, RPGMAKER_NAME) {
	VisualEvent.emptyList = {
		code: 0, 
		indent: 0, 
		parameters: []
	};
	
	VisualEvent.getEmptyList = function() {
		return {...VisualEvent.emptyList};
	};
	
	VisualEvent.defaultCommonEvent = {
		id: 0,
		list: [VisualEvent.getEmptyList()],
		name: "",
		switchId: 1,
		trigger: 0
	};
	
	VisualEvent.defaultMapEventPage = {
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
		list: [VisualEvent.getEmptyList()],
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
	
	VisualEvent.defaultTroopEventPage = {
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
		list: [VisualEvent.getEmptyList()],
		span: 0
	};
	
	VisualEvent.getDefaultEventPage = function(type) {
		if (type === "Map Event")
			return JSON.parse(JSON.stringify(VisualEvent.defaultMapEventPage)); 
		else if (type === "Troop Event")
			return JSON.parse(JSON.stringify(VisualEvent.defaultTroopEventPage)); 
		else
			return {};
	};
	
	VisualEvent.defaultTroopEvent = {
		id: 0,
		members: [],
		name: "",
		pages: [VisualEvent.getDefaultEventPage("Troop Event")]
	};
	
	VisualEvent.defaultMapEvent = {
		id: 0,
		name: "EV000",
		note: "",
		pages: [VisualEvent.getDefaultEventPage("Map Event")],
		x: 0,
		y: 0
	};
	
	VisualEvent.getDefaultCommonEvent = function() {
		return VisualEvent.deepCopyJSON(VisualEvent.defaultCommonEvent);
	};
	
	VisualEvent.getDefaultMapEvent = function() {
		return VisualEvent.deepCopyJSON(VisualEvent.defaultMapEvent);
	};
	
	VisualEvent.getDefaultTroopEvent = function() {
		return VisualEvent.deepCopyJSON(VisualEvent.defaultTroopEvent);
	};
	
	VisualEvent.getDefaultEvent = function(type) {
		switch (type) {
			case "Common Event":
				return VisualEvent.getDefaultCommonEvent();
			case "Map Event":
				return VisualEvent.getDefaultMapEvent();
			case "Troop Event":
				return VisualEvent.getDefaultTroopEvent();
			default: 
				return null;
		};
	};
};