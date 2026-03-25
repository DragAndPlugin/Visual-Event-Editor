module.exports = function(Drag, RPGMAKER_NAME) {
	return {
		selectArrayItem: {
			type: "interactive", name: "Item", behavior: [0, 1], 
			controller: Drag.VisualEvent.inputs.arrayItemVariable, 
			dependances: [Drag.VisualEvent.inputs.arrayItem, Drag.VisualEvent.inputs.variable]
		},
		selectArrayGetMode: {
			type: "interactive", name: "Index", behavior: [0, -1], 
			controller: Drag.VisualEvent.inputs.arrayGetMode, 
			dependances: [Drag.VisualEvent.inputs.arrayIndex]
		},
	};
};