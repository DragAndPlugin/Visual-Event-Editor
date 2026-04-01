module.exports = function(RPGMAKER_NAME) {
	return {
		arrayVariable: {type: "variable", default: 1, name: "Variable Array"},
		weight: {type: "integer", default: 1, name: "Weight"},
		arrayIndex: {type: "integer", default: 0, name: "Index"},
		arrayLength: {type: "integer", default: 1, min: 0, name: "Length"},
		angle: {type: "integer", default: 0, name: "Angle"},
		mapId: {type: "integer", default: 0, name: "Map ID"},
		eventId: {type: "integer", default: 0, name: "Event ID"},
		itemList: {type: "text", name: "Items", default: "", isList: true},
		arrayItem: {type: "text", name: "Item", default: ""},
		fillArrayItem: {type: "text", name: "Fill Item", default: ""},
		separator: {type: "text", name: "Separator", default: ""},
		arrayGetMode: {type: "select", options: ["Specify Index", "Random"], name: "Get Mode", data: "data-dataType='number'", default: 0},
		arrayItemVariable: {type: "select", options: ["Specify", "Variable"], name: "Item", data: "data-dataType='number'", default: 0},
		selectLoopWait: {type: "select", options: ["None", "Loop", "Wait for completion"], name: "Option", data: "data-dataType='number'", default: 0},
		selectKeepDirectVariable: {type: "select", options: ["Current", "Direct Designation", "Variable"], name: "Position", data: "data-dataType='number'", default: 0},
		selectPictureData: {type: "select", options: ["Picture filename", "Origin", "x", "y", "Width", "Height", "Opacity", "Blend Mode", "Rotation Angle", "Rotation Speed", "Easing Type"], values: ["_name", "_origin", "_x", "_y", "_scaleX", "_scaleY", "_opacity", "_blendMode", "_angle", "_rotationSpeed", "_easingType"], name: "Picture Data", data: "data-dataType='string'", default: 0},
		selectPercentPixel: {type: "select", options: ["%", "px"], name: "", data: "data-dataType='number'", default: 0},
		removeArrayItem: {type: "checkbox", name: "Remove Item From Array", default: false, showName: true},
		noDuplicateArrayItems: {type: "checkbox", name: "No Duplicate Items", default: false, showName: true},
	}
};