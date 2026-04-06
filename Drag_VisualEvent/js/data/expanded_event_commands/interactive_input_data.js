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
		selectPictureId: {
			type: "interactive", name: "Picture ID", behavior: [0, 1],
			controller: Drag.VisualEvent.inputs.selectDirectVariable, 
			dependances: [Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.variable],
		},
		startPictureId: {
			type: "interactive", name: "Start Picture ID", behavior: [0, 1],
			controller: Drag.VisualEvent.inputs.selectDirectVariable, 
			dependances: [(() => {const input = {...Drag.VisualEvent.inputs.int}; input.default = 1; return input;})(), Drag.VisualEvent.inputs.variable],
		},
		endPictureId: {
			type: "interactive", name: "End Picture ID", behavior: [0, 1],
			controller: Drag.VisualEvent.inputs.selectDirectVariable, 
			dependances: [(() => {const input = {...Drag.VisualEvent.inputs.int}; input.default = 100; return input;})(), Drag.VisualEvent.inputs.variable],
		},
		xPicturePosition: {
			type: "interactive", name: "x", behavior: [-1, 0, 1],
			controller: Drag.VisualEvent.inputs.selectKeepDirectVariable, 
			dependances: [Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.variable],
		},
		yPicturePosition: {
			type: "interactive", name: "y", behavior: [-1, 0, 1],
			controller: Drag.VisualEvent.inputs.selectKeepDirectVariable, 
			dependances: [Drag.VisualEvent.inputs.int, Drag.VisualEvent.inputs.variable],
		},
		anglePicture: {
			type: "interactive", name: "Angle", behavior: [0, 1],
			controller: Drag.VisualEvent.inputs.selectDirectVariable, 
			dependances: [Drag.VisualEvent.inputs.angle, Drag.VisualEvent.inputs.variable],
		},
		widthPicture: {
			type: "interactive", name: "Width", behavior: [-1, [0, 1], [2, 3]],
			controller: Drag.VisualEvent.inputs.selectKeepDirectVariable, 
			dependances: [{type: 'integer', min: 0, default: 0}, Drag.VisualEvent.inputs.selectPercentPixel, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.selectPercentPixel],
			dependancesStyle: [[0.5, 0.5], [0.5, 0.5]]
		},
		heightPicture: {
			type: "interactive", name: "Height", behavior: [-1, [0, 1], [2, 3]],
			controller: Drag.VisualEvent.inputs.selectKeepDirectVariable, 
			dependances: [{type: 'integer', min: 0, default: 0}, Drag.VisualEvent.inputs.selectPercentPixel, Drag.VisualEvent.inputs.variable, Drag.VisualEvent.inputs.selectPercentPixel],
			dependancesStyle: [[0.5, 0.5], [0.5, 0.5]]
		},
		opacityPicture: {
			type: "interactive", name: "Opacity", behavior: [0, 1],
			controller: Drag.VisualEvent.inputs.selectDirectVariable, 
			dependances: [Drag.VisualEvent.inputs.opacity, Drag.VisualEvent.inputs.variable],
		}
	};
};