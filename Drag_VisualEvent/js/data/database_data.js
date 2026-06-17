module.exports = function(RPGMAKER_NAME) {
	return {
		Actors: {
			dataFile: "Actors.json",
			displayName: "Actors",
			hasEntryList: true,
			content: {
				"General Settings": {
					inputs: [
						["name", "nickname"], 
						["class", "initialLevel", "maxLevel"], 
						["profile"]
					],
					values: [
						["name", "nickname"], 
						["classId", "initialLevel", "maxLevel"], 
						["profile"]
					],
					widths: [
						[0.5, 0.5], 
						[0.5, 0.25, 0.25], 
						[1]
					],
				},
				"Images": {
					inputs: [
						["face", "characterSheet", "svbattler"]
					],
					values: [
						[["faceName", "faceIndex"], ["characterName", "characterIndex"], "battlerName"]
					],
					widths: [
						[0.33, 0.33, 0.33]
					],
				},
				"Initial Equipment": {
					inputs: [
						["initialEquipments"]
					],
					values: [
						["equips"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Traits": {
					inputs: [
						["traits"]
					],
					values: [
						["traits"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Note": {
					inputs: [
						["text"]
					],
					values: [
						["note"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
			},
			layout: {
				cols: 2,
				colWidths: [0.5, 0.5],
				rows: {
					"General Settings": 	{col: 1, row: 1, width: 1, height: 0.4},
					"Images": 				{col: 1, row: 2, width: 1, height: 0.2},
					"Initial Equipment": 	{col: 1, row: 3, width: 1, height: 0.4},
					"Traits": 				{col: 2, row: 1, width: 1, height: 0.66},
					"Note": 				{col: 2, row: 2, width: 1, height: 0.33}
				},
			},
		},
		Classes: {
			dataFile: "Classes.json",
			displayName: "Classes",
			hasEntryList: true,
			content: {
				"General Settings": {
					inputs: [
						["name", "expCurve"]
					],
					values: [
						["name", "expParams"]
					],
					widths: [
						[0.5, 0.5]
					],
				},
				"Parameter Curves": {
					inputs: [
						["classParameterCurves"]
					],
					values: [
						["params"]
					],
					widths: [
						[1]
					],
				},
				"Learnable Skills": {
					inputs: [
						["learnableSkills"]
					],
					values: [
						["learnings"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Traits": {
					inputs: [
						["traits"]
					],
					values: [
						["traits"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Note": {
					inputs: [
						["text"]
					],
					values: [
						["note"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
			},
			layout: {
				cols: 2,
				colWidths: [0.5, 0.5],
				rows: {
					"General Settings": 	{col: 1, row: 1, width: 1, height: 0.15},
					"Parameter Curves": 	{col: 1, row: 2, width: 1, height: 0.3},
					"Learnable Skills": 	{col: 1, row: 3, width: 1, height: 0.55},
					"Traits": 				{col: 2, row: 1, width: 1, height: 0.66},
					"Note": 				{col: 2, row: 2, width: 1, height: 0.33}
				},
			},
		},
		Skills: {
			dataFile: "Skills.json",
			displayName: "Skills",
			hasEntryList: true,
			content: {
				"General Settings": {
					inputs: [
						["name", "icon"],
						["description"],
						["skillType", "mp", "tp"],
						["scope", "occasion"],
					],
					values: [
						["name", "iconIndex"],
						["description"],
						["stypeId", "mpCost", "tpCost"],
						["scope", "occasion"],
					],
					widths: [
						[0.75, 0.25],
						[1],
						[0.5, 0.25, 0.25],
						[0.5, 0.5]
					],
				},
				"Invocation": {
					inputs: [
						["speed", "success", "repeat", "tpGain"],
						["hitType", "animation"]
					],
					values: [
						["speed", "successRate", "repeats", "tpGain"],
						["hitType", "animationId"]
					],
					widths: [
						[0.25, 0.25, 0.25, 0.25],
						[0.5, 0.5]
					],
				},
				"Message": {
					inputs: [
						["string"], 
						["string"]
					],
					values: [
						["message1"], 
						["message2"]
					],
					widths: [
						[1],
						[1]
					],
				},
				"Required Weapon": {
					inputs: [
						["weaponType", "weaponType"]
					],
					values: [
						["requiredWtypeId1", "requiredWtypeId2"]
					],
					widths: [
						[0.5, 0.5]
					],
				},
				"Damage": {
					inputs: [
						["damageType", "elementType"],
						["formula"],
						["variance", "criticalHit"],
					],
					values: [
						["damage.type", "damage.elementId"],
						["damage.formula"],
						["damage.variance", "damage.critical"],
					],
					widths: [
						[0.5, 0.5],
						[1],
						[0.5, 0.5]
					],
				},
				"Effects": {
					inputs: [
						["effects"]
					],
					values: [
						["effects"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Note": {
					inputs: [
						["text"]
					],
					values: [
						["note"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
			},
			layout: {
				cols: 2,
				colWidths: [0.5, 0.5],
				rows: {
					"General Settings": 	{col: 1, row: 1, width: 1, height: 0.4},
					"Invocation": 			{col: 1, row: 2, width: 1, height: 0.2},
					"Message": 				{col: 1, row: 3, width: 1, height: 0.2},
					"Required Weapon": 		{col: 1, row: 4, width: 1, height: 0.2},
					"Damage": 				{col: 2, row: 1, width: 1, height: 0.33},
					"Effects": 				{col: 2, row: 2, width: 1, height: 0.33},
					"Note": 				{col: 2, row: 3, width: 1, height: 0.33}
				},
			},
		},
		Items: {
			dataFile: "Items.json",
			displayName: "Items",
			hasEntryList: true,
			content: {
				"General Settings": {
					inputs: [
						["name", "icon"],
						["description"],
						["itemType", "price", "consumable"],
						["scope", "occasion"],
					],
					values: [
						["name", "iconIndex"],
						["description"],
						["itypeId", "price", "consumable"],
						["scope", "occasion"],
					],
					widths: [
						[0.75, 0.25],
						[1],
						[0.5, 0.25, 0.25],
						[0.5, 0.5]
					],
				},
				"Invocation": {
					inputs: [
						["speed", "success", "repeat", "tpGain"],
						["hitType", "animation"]
					],
					values: [
						["speed", "successRate", "repeats", "tpGain"],
						["hitType", "animationId"]
					],
					widths: [
						[0.25, 0.25, 0.25, 0.25],
						[0.5, 0.5]
					],
				},
				"Damage": {
					inputs: [
						["damageType", "elementType"],
						["formula"],
						["variance", "criticalHit"],
					],
					values: [
						["damage.type", "damage.elementId"],
						["damage.formula"],
						["damage.variance", "damage.critical"],
					],
					widths: [
						[0.5, 0.5],
						[1],
						[0.5, 0.5]
					],
				},
				"Effects": {
					inputs: [
						["effects"]
					],
					values: [
						["effects"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Note": {
					inputs: [
						["text"]
					],
					values: [
						["note"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
			},
			layout: {
				cols: 2,
				colWidths: [0.5, 0.5],
				rows: {
					"General Settings": 	{col: 1, row: 1, width: 1, height: 0.4},
					"Invocation": 			{col: 1, row: 2, width: 1, height: 0.2},
					"Damage": 				{col: 2, row: 1, width: 1, height: 0.33},
					"Effects": 				{col: 2, row: 2, width: 1, height: 0.33},
					"Note": 				{col: 2, row: 3, width: 1, height: 0.33}
				},
			},
		},
		Weapons: {
			dataFile: "Weapons.json",
			displayName: "Weapons",
			hasEntryList: true,
			content: {
				"General Settings": {
					inputs: [
						["name", "icon"],
						["description"],
						["weaponType", "price"],
						["animation"],
					],
					values: [
						["name", "iconIndex"],
						["description"],
						["etypeId", "price"],
						["animationId"],
					],
					widths: [
						[0.75, 0.25],
						[1],
						[0.5, 0.5],
						[1]
					],
				},
				"Parameter Changes": {
					inputs: [
						["attack", "defense", "mAttack", "mDefense"],
						["agility", "luck", "maxHp", "maxMp"],
					],
					values: [
						["params[0]", "params[1]", "params[2]", "params[3]"],
						["params[4]", "params[5]", "params[6]", "params[7]"],
					],
					widths: [
						[0.25, 0.25, 0.25, 0.25],
						[0.25, 0.25, 0.25, 0.25],
					],
				},
				"Traits": {
					inputs: [
						["traits"]
					],
					values: [
						["traits"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Note": {
					inputs: [
						["text"]
					],
					values: [
						["note"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
			},
			layout: {
				cols: 2,
				colWidths: [0.5, 0.5],
				rows: {
					"General Settings": 	{col: 1, row: 1, width: 1, height: 0.4},
					"Parameter Changes": 	{col: 1, row: 2, width: 1, height: 0.2},
					"Traits": 				{col: 2, row: 2, width: 1, height: 0.66},
					"Note": 				{col: 2, row: 3, width: 1, height: 0.33}
				},
			},
		},
		Armors: {
			dataFile: "Armors.json",
			displayName: "Armors",
			hasEntryList: true,
			content: {
				"General Settings": {
					inputs: [
						["name", "icon"],
						["description"],
						["armorType", "price"],
						["equipmentType"],
					],
					values: [
						["name", "iconIndex"],
						["description"],
						["atypeId", "price"],
						["etypeId"],
					],
					widths: [
						[0.75, 0.25],
						[1],
						[0.5, 0.5],
						[1]
					],
				},
				"Parameter Changes": {
					inputs: [
						["attack", "defense", "mAttack", "mDefense"],
						["agility", "luck", "maxHp", "maxMp"],
					],
					values: [
						["params[0]", "params[1]", "params[2]", "params[3]"],
						["params[4]", "params[5]", "params[6]", "params[7]"],
					],
					widths: [
						[0.25, 0.25, 0.25, 0.25],
						[0.25, 0.25, 0.25, 0.25],
					],
				},
				"Traits": {
					inputs: [
						["traits"]
					],
					values: [
						["traits"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Note": {
					inputs: [
						["text"]
					],
					values: [
						["note"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
			},
			layout: {
				cols: 2,
				colWidths: [0.5, 0.5],
				rows: {
					"General Settings": 	{col: 1, row: 1, width: 1, height: 0.4},
					"Parameter Changes": 	{col: 1, row: 2, width: 1, height: 0.2},
					"Traits": 				{col: 2, row: 2, width: 1, height: 0.66},
					"Note": 				{col: 2, row: 3, width: 1, height: 0.33}
				},
			},
		},
		Enemies: {
			dataFile: "Enemies.json",
			displayName: "Enemies",
			hasEntryList: true,
			content: {
				"General Settings": {
					inputs: [
						["name"],
						["svenemy", "hue"],
						["maxHp", "maxmP", "attack", "defense"],
						["mAttack", "mDefense", "agility", "luck"],
					],
					values: [
						["name"],
						["battlerName", "battlerHue"],
						["params[0]", "params[1]", "params[2]", "params[3]"],
						["params[4]", "params[5]", "params[6]", "params[7]"],
					],
					widths: [
						[1],
						[0.5, 0.5],
						[0.25, 0.25, 0.25, 0.25],
						[0.25, 0.25, 0.25, 0.25],
					],
				},
				"Rewards": {
					inputs: [
						["exp"],
						["gold"],
					],
					values: [
						["exp"],
						["gold"],
					],
					widths: [
						[1],
						[1],
					],
				},
				"Drop Items": {
					inputs: [
						["selectEnemyDropItem"],
						["selectEnemyDropItem"],
						["selectEnemyDropItem"],
					],
					values: [
						["dropItems[0]"],
						["dropItems[1]"],
						["dropItems[2]"],
					],
					widths: [
						[1],
						[1],
						[1],
					],
				},
				"Action Patterns": {
					inputs: [
						["actionPatterns"]
					],
					values: [
						["actions"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Traits": {
					inputs: [
						["traits"]
					],
					values: [
						["traits"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Note": {
					inputs: [
						["text"]
					],
					values: [
						["note"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
			},
			layout: {
				cols: 2,
				colWidths: [0.5, 0.5],
				rows: {
					"General Settings": 	{col: 1, row: 1, width: 1, height: 0.4},
					"Rewards": 				{col: 1, row: 2, width: 0.25, height: 0.3},
					"Drop Items": 			{col: 1, row: 2, width: 0.75, height: 0.3},
					"Action Patterns": 		{col: 1, row: 3, width: 1, height: 0.3},
					"Traits": 				{col: 2, row: 1, width: 1, height: 0.66},
					"Note": 				{col: 2, row: 2, width: 1, height: 0.33}
				},
			},
		},
		States: {
			dataFile: "States.json",
			displayName: "States",
			hasEntryList: true,
			content: {
				"General Settings": {
					inputs: [
						["name", "icon"],
						["restriction", "priority"],
						["svmotion", "svoverlay"],
					],
					values: [
						["name", "iconIndex"],
						["restriction", "priority"],
						["motion", "overlay"],
					],
					widths: [
						[0.75, 0.25],
						[0.5, 0.5],
						[0.5, 0.5],
					],
				},
				"Removal Conditions": {
					inputs: [
						["removeBattleEnd", "removeRestriction"],
						["removeTimling"],
						["removeDamage"],
						["removeWalking"],
					],
					values: [
						["removeAtBattleEnd", "removeByRestriction"],
						["autoRemovalTiming"],
						["removeByDamage"],
						["removeByWalking"],
					],
					widths: [
						[0.5, 0.5],
						[1],
						[1],
						[1],
					],
				},
				"Messages": {
					inputs: [
						["message"],
						["message"],
						["message"],
						["message"],
					],
					values: [
						["message1"],
						["message2"],
						["message3"],
						["message4"],
					],
					widths: [
						[1],
						[1],
						[1],
						[1],
					],
				},
				"Traits": {
					inputs: [
						["traits"]
					],
					values: [
						["traits"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
				"Note": {
					inputs: [
						["text"]
					],
					values: [
						["note"]
					],
					widths: [
						[1]
					],
					showTitle: [
						[false]
					],
				},
			},
			layout: {
				cols: 2,
				colWidths: [0.5, 0.5],
				rows: {
					"General Settings": 	{col: 1, row: 1, width: 1, height: 0.3},
					"Removal Conditions": 	{col: 1, row: 2, width: 1, height: 0.35},
					"Messages": 			{col: 1, row: 3, width: 1, height: 0.35},
					"Traits": 				{col: 2, row: 1, width: 1, height: 0.66},
					"Note": 				{col: 2, row: 2, width: 1, height: 0.33}
				},
			},
		},
	};
};