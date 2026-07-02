module.exports = function(Drag, RPGMAKER_NAME) {
	return {
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
				Drag.VisualEvent.inputs.int, 
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
					dependances: [Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.variable]
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
					dependances: [Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.variable]
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
		},
		selectAdvancedSearchItem: {
			type: "interactive", name: "", behavior: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
			controller: Drag.VisualEvent.inputs.selectAdvancedSearchItemType,
			dependances: [
				Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.text,
				Drag.VisualEvent.inputs.switch, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.actor, Drag.VisualEvent.inputs.animation, Drag.VisualEvent.inputs.armor,
				Drag.VisualEvent.inputs.class, Drag.VisualEvent.inputs.commonEvent, Drag.VisualEvent.inputs.enemy, Drag.VisualEvent.inputs.item, Drag.VisualEvent.inputs.skill,
				Drag.VisualEvent.inputs.state, Drag.VisualEvent.inputs.tileset, Drag.VisualEvent.inputs.troop, Drag.VisualEvent.inputs.weapon, Drag.VisualEvent.inputs.equipmentType, Drag.VisualEvent.inputs.elementType, 
				Drag.VisualEvent.inputs.face, Drag.VisualEvent.inputs.characterSheet, Drag.VisualEvent.inputs.singleFrameCharacter, Drag.VisualEvent.inputs.svbattler, Drag.VisualEvent.inputs.parallax, Drag.VisualEvent.inputs.picture, Drag.VisualEvent.inputs.battlebacks, 
				Drag.VisualEvent.inputs.command],
		},
		selectInteractiveScope: {
			type: "interactive", name: "Scope", behavior: [-1, 0, [1, 2], -1, -1],
			controller: Drag.VisualEvent.inputs.selectScopeSide,
			dependances: [
				{
					type: "interactive", name: "Number", behavior: [-1, -1, 0], containerStyle: "align-items: center;",
					controller: Drag.VisualEvent.inputs.selectScopeEnemyNumber, 
					dependances: [Drag.VisualEvent.inputs.randomEnemy]
				},
				Drag.VisualEvent.inputs.selectScopeAllyNumber,
				Drag.VisualEvent.inputs.selectScopeStatus
			],
			dependancesStyle: [1, [0.5, 0.5]]
		},
		interactiveRemoveTiming: {
			type: "interactive", name: "Auto-Removal Timing", behavior: [-1, [0, 1], [2, 3]],
			controller: Drag.VisualEvent.inputs.selectRemoveTiming,
			dependances: [
				Drag.VisualEvent.inputs.turns, Drag.VisualEvent.inputs.turns,
				Drag.VisualEvent.inputs.turns, Drag.VisualEvent.inputs.turns
			],
			dependancesStyle: [[0.5, 0.5], [0.5, 0.5]]
		},
		interactiveRemoveDamage: {
			type: "interactive", name: "Remove by Damage", behavior: [0, -1],
			controller: Drag.VisualEvent.inputs.selectRemoveDamage,
			dependances: [
				Drag.VisualEvent.inputs.percentage,
			],
		},
		interactiveRemoveWalking: {
			type: "interactive", name: "Remove by Walking", behavior: [0, -1],
			controller: Drag.VisualEvent.inputs.selectRemoveWalking,
			dependances: [
				Drag.VisualEvent.inputs.steps,
			],
		},
		
		
	};
};