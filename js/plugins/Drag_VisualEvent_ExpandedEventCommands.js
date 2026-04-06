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
		Drag.VisualEvent.loadInputData('expanded_event_commands/input_data.js');
		Drag.VisualEvent.loadInteractiveInputData('expanded_event_commands/interactive_input_data.js');
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
		const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		$gameScreen.replacePicture(pictureId, params[2]);
		return true;
	};
	
	Game_Screen.prototype.replacePicture = function(pictureId, name = "") {
		const picture = $gameScreen.picture(pictureId);
		if (picture)
			this.showPicture(pictureId, name, picture._origin, picture._x, picture._y, picture._scaleX, picture._scaleY, picture._opacity, picture._blendMode);
	};
	
	// Rotate Picture (deg)
	Game_Interpreter.prototype.command_rotate_picture_deg = function(params) {
		const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		const picture = $gameScreen.picture(pictureId);
		if (picture) {
			if (params[4] > 0) {
				picture._rotationDegreeSteps = params[4];
				picture._rotationDegreeAngle = params[2] === 0 ? (params[3] - picture._angle) / params[4] : ($gameVariables.value(params[3]) - picture._angle) / params[4];
			} else
				picture._angle = params[2] === 0 ? params[3] : $gameVariables.value(params[3]);
			
			if (params[5] && params[4])
				this.wait(params[4]);
		}
		
		return true;
	};
	
	Drag.VisualEvent_ExpandedEventCommands.alias._GamePicture_update = Game_Picture.prototype.update;
	Game_Picture.prototype.update = function() {
		Drag.VisualEvent_ExpandedEventCommands.alias._GamePicture_update.apply(this, arguments);
		this.updateDegreeRotation();
	};
	
	Game_Picture.prototype.updateDegreeRotation = function() {
		if (!this._rotationDegreeSteps || !this._rotationDegreeAngle)
			return;
			
		this._angle += this._rotationDegreeAngle;
		this._rotationDegreeSteps--;
	};
	
	// Move Picture (Position)
	Game_Interpreter.prototype.command_move_picture_position = function(params) {
		const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		const picture = $gameScreen.picture(pictureId);
		if (picture) {
			const x = params[2] === 0 ? picture._x : params[2] === 1 ? params[3] : $gameVariables.value(params[3]);
			const y = params[4] === 0 ? picture._y : params[4] === 1 ? params[5] : $gameVariables.value(params[5]);
			const duration = params[6] !== 0 ? params[6] : 1;
			picture.move(picture._origin, x, y, picture._scaleX, picture._scaleY, picture._opacity, picture._blendMode, duration, params[8]);
			if (params[7] && params[6])
				this.wait(params[6]);
		}
		return true;
	};
	
	// Get Picture Data 
	Game_Interpreter.prototype.command_get_picture_data = function(params) {
		if (params[2]) {
			const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
			const picture = $gameScreen.picture(pictureId);
			if (picture && picture.hasOwnProperty(params[2]))
				$gameVariables.setValue(params[3], picture[params[2]]);
		}
		return true;
	};
	
	// Resize Picture
	Game_Interpreter.prototype.command_resize_picture = function(params) {
		const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		const picture = $gameScreen.picture(pictureId);
		if (picture) {
			const width = params[2] === 0 ? picture._scaleX : params[2] === 1 ? params[3] : $gameVariables.value(params[3]);
			const height = params[5] === 0 ? picture._scaleY : params[5] === 1 ? params[6] : $gameVariables.value(params[6]);
			const [initialWidth, initialHeight] = Drag.VisualEvent_ExpandedEventCommands.getPictureSize(pictureId, false);
			const scaleX = params[4] === 0 ? width : width / initialWidth * 100;
			const scaleY = params[7] === 0 ? height : height / initialHeight * 100;
			const duration = params[8] !== 0 ? params[8] : 1;
			picture.move(picture._origin, picture._x, picture._y, scaleX, scaleY, picture._opacity, picture._blendMode, duration, params[10]);
			if (params[9] && params[8])
				this.wait(params[8]);
		}
		return true;
	};	
	
	Drag.VisualEvent_ExpandedEventCommands.getPictureSize = function(pictureId = 0, scaled = true) {
		const scene = SceneManager._scene;
		if (!scene)
			return [0, 0];
		
		const spriteset = scene._spriteset;
		if (!spriteset)
			return [0, 0];
		
		const pictureContainer = spriteset._pictureContainer;
		if (!pictureContainer)
			return [0, 0];
		
		const picture = pictureContainer.children[pictureId - 1];
		if (!picture)
			return [0, 0];
		
		return scaled ? [picture.width * picture.scale.x, picture.height * picture.scale.y] : [picture.width, picture.height];
	};
	
	// Change Picture Opacity
	Game_Interpreter.prototype.command_change_opacity_picture = function(params) {
		const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		const picture = $gameScreen.picture(pictureId);
		if (picture) {
			const opacity = params[2] === 0 ? params[3] : $gameVariables.value(params[3]);
			const duration = params[4] !== 0 ? params[4] : 1;
			picture.move(picture._origin, picture._x, picture._y, picture._scaleX, picture._scaleY, opacity, picture._blendMode, duration, params[6]);
			if (params[5] && params[4])
				this.wait(params[4]);
		}
		return true;
	};	
	
	// Change Picture Blend Mode
	Game_Interpreter.prototype.command_change_picture_blend_mode = function(params) {
		const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		const picture = $gameScreen.picture(pictureId);
		if (picture)
			picture.move(picture._origin, picture._x, picture._y, picture._scaleX, picture._scaleY, picture._opacity, params[2], picture._duration, picture._easingType);
		return true;
	};	
	
	// Is Picture Shown
	Game_Interpreter.prototype.command_picture_shown = function(params) {
		const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		const picture = $gameScreen.picture(pictureId);
		
		const result = !!picture;
		this._branch[this._indent] = result;
		if (this._branch[this._indent] === false)
			this.skipBranch();
			
		return true;
	};
	
	Game_Interpreter.prototype.command_picture_not_shown = function(params) {
		if (this._branch[this._indent] !== false) {
			this.skipBranch();
		}
		return true;
	};
	
	// Center Picture 
	Game_Interpreter.prototype.command_center_picture = function(params) {
		const pictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		const picture = $gameScreen.picture(pictureId);
		if (picture) {
			const duration = params[2] !== 0 ? params[2] : 1;
			picture.move(1, Graphics._width / 2, Graphics._height / 2, picture._scaleX, picture._scaleY, picture._opacity, picture._blendMode, duration, params[4]);
			if (params[3] && params[2])
				this.wait(params[2]);
		}
		return true;
	};
	
	// Erase Pictures In Range
	Game_Interpreter.prototype.command_erase_picture_range = function(params) {
		let startPictureId = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		const endPictureId = params[2] === 0 ? params[3] : $gameVariables.value(params[3]);
		for (startPictureId; startPictureId <= endPictureId; startPictureId++)
			$gameScreen.erasePicture(startPictureId);
		
		return true;
	};
	
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
		if (this._branch[this._indent] === false)
			this.skipBranch();
		
		return true;
	};
	
	// For Loop
	Game_Interpreter.prototype.command_for_loop = function(params) {
		// const startIndex = $gameVariables.value(params[0]);
		// const endIndex = $gameVariables.value(params[2]);
		// let result = false;
		// switch (params[1]) {
			// case 0:
				// result = startIndex < endIndex;
				// break;
			// case 1:
				// result = startIndex <= endIndex;
				// break;
			// case 2:
				// result = startIndex >= endIndex;
				// break;
			// case 3:
				// result = startIndex > endIndex;
				// break;
		// };

		// this._branch[this._indent] = result;
		// if (this._branch[this._indent] === false)
			// this.skipBranch();
		console.log(this._list);
		return true;
	};
	
	// End For Loop
	Game_Interpreter.prototype.command_end_for_loop = function(params) {
		let index = $gameVariables.value(params[0]);
		index += params[3];
		$gameVariables.setValue(params[0], index);
		
		const endIndex = $gameVariables.value(params[2]);
		let result = false;
		switch (params[1]) {
			case 0:
				result = index < endIndex;
				break;
			case 1:
				result = index <= endIndex;
				break;
			case 2:
				result = index >= endIndex;
				break;
			case 3:
				result = index > endIndex;
				break;
		};
		
		if (result) {
			console.log(this._index);
			do {
				this._index--;
			} while (this.currentCommand().indent !== this._indent);
			console.log(this._index);
			// this._index--;
		}

		return true;
	};

	
	
	
	
	
	// Control Variable Text 
	Game_Interpreter.prototype.command_control_variable_text = function(params) {
		if (params[0] > 0)
			$gameVariables.setValue(params[0], params[1]);
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
	Game_Interpreter.prototype.command_set_gold = function(params) {
		const value = params[0] === 0 ? params[1] : $gameVariables.value(params[1]);
		$gameParty._gold = Math.min(Math.max(value, 0), $gameParty.maxGold());
		return true;
	};
	
	// Open Item Screen
	Game_Interpreter.prototype.command_open_item_screen = function(params) {
		SceneManager.push(Scene_Item);
		return true;
	};
	
	// Open Item Screen
	Game_Interpreter.prototype.command_open_options_screen = function(params) {
		SceneManager.push(Scene_Options);
		return true;
	};
	
	// Open Item Screen
	Game_Interpreter.prototype.command_open_load_screen = function(params) {
		SceneManager.push(Scene_Load);
		return true;
	};
	
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