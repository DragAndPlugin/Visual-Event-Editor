//=============================================================================
// Drag_VisualEvent_ExpandedEventCommands.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc
 * @author Drag
 *
 * @url
 *
 * @help 
 *
*/


var Imported = Imported || {};
Imported.Drag_VisualEvent_ExpandedEventCommands = true;

var Drag = Drag || {};
Drag.VisualEvent_ExpandedEventCommands = {};
Drag.VisualEvent_ExpandedEventCommands.alias = {};
Drag.VisualEvent_ExpandedEventCommands.version = "1.0.0";

(function() {
	
	Object.assign(Drag.VisualEvent.inputs, {
		arrayVariable: {type: "variable", default: 1, name: "Variable Array"},
		weight: {type: "integer", default: 1, name: "Weight"},
		arrayIndex: {type: "integer", default: 0, name: "Index"},
		arrayLength: {type: "integer", default: 1, min: 0, name: "Length"},
		itemList: {type: "text", name: "Items", default: "", isList: true},
		arrayItem: {type: "text", name: "Item", default: ""},
		fillArrayItem: {type: "text", name: "Fill Item", default: ""},
		arrayGetMode: {type: "select", options: ["Specify Index", "Random"], name: "Get Mode", data: "data-dataType='number'", default: 0},
		arrayItemVariable: {type: "select", options: ["Specify", "Variable"], name: "Item", data: "data-dataType='number'", default: 0},
		removeArrayItem: {type: "checkbox", name: "Remove Item From Array", default: false, showName: true},
	});
	
	Object.assign(Drag.VisualEvent.interactiveInputs, {
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
	});
	
	// Wait Variable
	Game_Interpreter.prototype.command1001 = function(params) {
		if (params[0] > 0)
			this.wait($gameVariables.value(params[0]));
		return true;
	};
	
	// Wait Script
	Game_Interpreter.prototype.command1004 = function(params) {
		if (params[0])
			this.wait(eval(params[0]));
		return true;
	};
	
	// Replace Picture
	Game_Interpreter.prototype.command1002 = function(params) {
		$gameScreen.replacePicture(params[0], params[1]);
		return true;
	};
	
	Game_Screen.prototype.replacePicture = function(pictureId, name = "") {
		const picture = $gameScreen._pictures[pictureId];
		if (picture)
			this.showPicture(pictureId, name, picture._origin, picture._x, picture._y, picture._scaleX, picture._scaleY, picture._opacity, picture._blendMode);
	};
	
	// Common Event (variable)
	Game_Interpreter.prototype.command1003 = function(params) {
		const varId = params[0];
		if (varId > 0) {
			const varValue = $gameVariables.value(varId);
			if (params[1])
				$gameVariables.setValue(varId, 0);
			this.command117([varValue]);
		}
		return true;
	};
	
	// Switch
	Game_Interpreter.prototype.command_custom_node_switch = function(params) {
		const value = $gameVariables.value(params[0]);
		const result = value === params[1];
		this._branch[this._indent] = result;
		if (this._branch[this._indent] === false) {
			this.skipBranch();
		}
		return true;
	};
	
	// Set Variable Random With Weight
	Game_Interpreter.prototype.command_custom_node_set_variable_random_with_weight = function(params) {
		if (params[0]) {
			const varId = params.shift();
			const values = params.filter((param, i) => i % 2 === 0);
			const weights = params.filter((param, i) => i % 2 !== 0);
			$gameVariables.setValue(varId, Drag.VisualEvent_ExpandedEventCommands.randomValueFromWeights(values, weights));
			
		}
		return true;
	};
	
	Drag.VisualEvent_ExpandedEventCommands.randomValueFromWeights = function(values, weights) {
		const totalWeight = weights.reduce((sum, a) => sum + a, 0);
		const roll = Math.floor(Math.random() * totalWeight);
		
		let weightedValues = []
		for (const [i, value] of values.entries())
			weightedValues = weightedValues.concat(new Array(weights[i]).fill(value));
		
		return weightedValues[roll];
	};
})();