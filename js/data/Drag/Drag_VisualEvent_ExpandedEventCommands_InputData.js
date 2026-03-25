module.exports = function(RPGMAKER_NAME) {
	return {
		arrayVariable: {type: "variable", default: 1, name: "Variable Array"},
		weight: {type: "integer", default: 1, name: "Weight"},
		arrayIndex: {type: "integer", default: 0, name: "Index"},
		arrayLength: {type: "integer", default: 1, min: 0, name: "Length"},
		degree: {type: "integer", default: 0, name: "Degree"},
		mapId: {type: "integer", default: 0, name: "Map ID"},
		eventId: {type: "integer", default: 0, name: "Event ID"},
		itemList: {type: "text", name: "Items", default: "", isList: true},
		arrayItem: {type: "text", name: "Item", default: ""},
		fillArrayItem: {type: "text", name: "Fill Item", default: ""},
		separator: {type: "text", name: "Separator", default: ""},
		arrayGetMode: {type: "select", options: ["Specify Index", "Random"], name: "Get Mode", data: "data-dataType='number'", default: 0},
		arrayItemVariable: {type: "select", options: ["Specify", "Variable"], name: "Item", data: "data-dataType='number'", default: 0},
		selectLoopWait: {type: "select", options: ["None", "Loop", "Wait for completion"], name: "Option", data: "data-dataType='number'", default: 0},
		removeArrayItem: {type: "checkbox", name: "Remove Item From Array", default: false, showName: true},
		noDuplicateArrayItems: {type: "checkbox", name: "No Duplicate Items", default: false, showName: true},
	}
};