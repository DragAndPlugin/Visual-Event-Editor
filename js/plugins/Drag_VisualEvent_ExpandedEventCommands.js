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
	
	if (Imported.Drag_VisualEvent) {
		Drag.VisualEvent.loadInputData('Drag_VisualEvent_ExpandedEventCommands_InputData');
		Drag.VisualEvent.loadInteractiveInputData('Drag_VisualEvent_ExpandedEventCommands_InteractiveInputData');
	}
	
	// Wait Variable
	Game_Interpreter.prototype.command_wait_variable = function(params) {
		if (params[0] > 0)
			this.wait($gameVariables.value(params[0]));
		return true;
	};
	
	// Wait Script
	Game_Interpreter.prototype.command_wait_script = function(params) {
		if (params[0])
			this.wait(eval(params[0]));
		return true;
	};
	
	// Replace Picture
	Game_Interpreter.prototype.command_replace_picture = function(params) {
		$gameScreen.replacePicture(params[0], params[1]);
		return true;
	};
	
	Game_Screen.prototype.replacePicture = function(pictureId, name = "") {
		const picture = $gameScreen._pictures[pictureId];
		if (picture)
			this.showPicture(pictureId, name, picture._origin, picture._x, picture._y, picture._scaleX, picture._scaleY, picture._opacity, picture._blendMode);
	};
	
	// Rotate Picture (deg)
	
	
	
	// Common Event (variable)
	Game_Interpreter.prototype.command_common_event_variable = function(params) {
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
	
	// Control Event Self Switch
	Game_Interpreter.prototype.command_control_event_self_switch = function(params) {
		if (params[0] > 0 && params[1] > 0 && params.length > 3) {
			const key = [params[0], params[1], params[2]];
			$gameSelfSwitches.setValue(key, params[3]);
		}
		return true;
	};
	
	// Set Variable Random With Weight
	Game_Interpreter.prototype.command_set_variable_random_with_weight = function(params) {
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
	
	// Set Gold 
	
	
	
	// --------------------------------------------------------------------------------------------------------------------------------
	// Variable Array
	
	Game_Interpreter.prototype.command_create_variable_array = function(params) {
		if (params[0] > 0 && params.length > 1)
			$gameVariables.setValue(params[0], params.slice(1));
		
		return true;
	};
	
	Game_Interpreter.prototype.command_set_item_variable_array = function(params) {
		if (params[0] > 0 && params.length > 3) {
			const array = $gameVariables.value(params[0]);
			const index = params[1] >= 0 ? Math.min(params[1], array.length - 1) : Math.max(array.length + params[1], 0);
			const value = params[2] === 0 ? params[3] : $gameVariables.value(params[3]);
			if (Array.isArray(array))
				array[index] = value;
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_add_item_variable_array = function(params) {
		if (params[0] > 0 && params.length > 4) {
			const array = $gameVariables.value(params[0]);
			const index = params[1] >= 0 ? Math.min(params[1], array.length - 1) : Math.max(array.length + params[1] + 1, 0);
			const value = params[2] === 0 ? params[3] : $gameVariables.value(params[3]);
			if (Array.isArray(array) && (!params[4] || !array.includes(value)))
				array.splice(index, 0, value);
				
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_get_item_variable_array = function(params) {
		if (params[0] > 0 && params[2] > 0 && params.length > 3) {
			const array = $gameVariables.value(params[0]);
			const index = params[1] >= 0 ? Math.min(params[1], array.length - 1) : Math.max(array.length + params[1], 0);
			if (Array.isArray(array)) {
				const value = array[index];
				$gameVariables.setValue(params[2], value);
				if (params[3])
					array.splice(index, 1);
			}
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_get_random_item_variable_array = function(params) {
		if (params[0] > 0 && params[1] > 0 && params.length > 2) {
			const array = $gameVariables.value(params[0]);
			if (Array.isArray(array)) {
				const index = array[Math.floor(Math.random() * array.length)];
				const value = array[index];
				$gameVariables.setValue(params[1], value);
				if (params[2])
					array.splice(index, 1);
			}
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_shuffle_items_variable_array = function(params) {
		if (params[0] > 0) {
			const array = $gameVariables.value(params[0]);
			if (Array.isArray(array))
				array.sort(() => Math.random() - 0.5);
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_sort_items_variable_array = function(params) {
		if (params[0] > 0) {
			const array = $gameVariables.value(params[0]);
			if (Array.isArray(array))
				array.sort();
		}
		return true;
	};	
	
	Game_Interpreter.prototype.command_merge_variable_array = function(params) {
		if (params[0] > 0 && params[1] > 0 && params.length > 2) {
			const array1 = $gameVariables.value(params[0]);
			const array2 = $gameVariables.value(params[1]);
			if (Array.isArray(array1) && Array.isArray(array2)) {
				if (!params[2])
					$gameVariables.setValue(params[0], array1.concat(array2));
				else 
					for (const item in array2)
						if (!array1.includes(item))
							array2.push(item);
			}
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_reverse_items_variable_array = function(params) {
		if (params[0] > 0) {
			const array = $gameVariables.value(params[0]);
			if (Array.isArray(array))
				array.reverse();
		}
		return true;
	};	
	
	Game_Interpreter.prototype.command_variable_array_includes_item = function(params) {
		if (params[0] > 0 && params.length > 3 && params[3] > 0) {
			const array = $gameVariables.value(params[0]);
			const value = params[1] === 0 ? params[2] : $gameVariables.value(params[2]);
			if (Array.isArray(array))
				$gameSwitches.setValue(params[3], array.includes(value));
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_variable_array_includes_item_exec = function(params) {
		if (params[0] > 0 && params.length > 2) {
			const array = $gameVariables.value(params[0]);
			const value = params[1] === 0 ? params[2] : $gameVariables.value(params[2]);
			const result = array.includes(value);
			
			this._branch[this._indent] = result;
			if (this._branch[this._indent] === false)
				this.skipBranch();
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_variable_array_not_includes_item_exec = function(params) {
		if (this._branch[this._indent] !== false) {
			this.skipBranch();
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_replace_item_variable_array = function(params) {
		if (params[0] > 0 && params.length > 2) {
			const array = $gameVariables.value(params[0]);
			const value1 = params[1] === 0 ? params[2] : $gameVariables.value(params[2]);
			const value2 = params[3] === 0 ? params[4] : $gameVariables.value(params[4]);
			if (Array.isArray(array) && array.includes(value1))
				array.splice(array.indexOf(value1), 0, value2);
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_set_variable_array_length = function(params) {
		if (params[0] > 0 && params.length > 3) {
			const array = $gameVariables.value(params[0]);
			const length = params[1];
			const value = params[2] === 0 ? params[3] : $gameVariables.value(params[3]);
			if (Array.isArray(array)) {
				const fillArray = length > array.length ? new Array(array.length - length).fill(value) : [];
				array.length = length;
				array.concat(fillArray);
			}
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_remove_item_variable_array = function(params) {
		if (params[0] > 0 && params.length > 2) {
			const array = $gameVariables.value(params[0]);
			const value = params[1] === 0 ? params[2] : $gameVariables.value(params[2]);
			if (Array.isArray(array)) {
				const index = array.indexOf(value);
				if (index > -1)
					array.splice(index, 1);
			}
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_remove_index_variable_array = function(params) {
		if (params[0] > 0 && params.length > 1) {
			const array = $gameVariables.value(params[0]);
			if (Array.isArray(array)) {
				const index = params[1] >= 0 ? Math.min(params[1], array.length - 1) : Math.max(array.length + params[1], 0);
				array.splice(index, 1);
			}
		}
		return true;
	};
	
	Game_Interpreter.prototype.command_join_items_variable_array = function(params) {
		if (params[0] > 0 && params[2] > 0 && params.length > 2) {
			const array = $gameVariables.value(params[0]);
			const separator = params[1];
			if (Array.isArray(array))
				$gameVariables.setValue(params[2], array.join(separator));
		}
		return true;
	};
	
})();