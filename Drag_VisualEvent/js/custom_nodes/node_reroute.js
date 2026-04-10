module.exports = [{
	category: "Flow Control", //string, category in node list 
	name: "Reroute", //string, name of the node
	engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
	event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
	id: "custom_node_reroute", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
	exec_input: true, //boolean, default true, define if node have input execution connection
	exec_input_params: {
		is_list: false, //boolean, default false, define if list buttons are added to let user add/remove inputs
		exclusive: "exec", //string, default "exec", define what kind of connections the input accept
	},
	exec_output: true, //boolean, default true, define if node have output execution connection
	exec_output_params: {
		is_list: false,
		exclusive: "exec",
	},
	inputs: [], //array of string, list of inputs of the node
	outputs: [], //array of string, list of outputs of the node
	parse: (editor, command, node, behaviors, inputs, sequence) => {}, //function, define what the node do when parsed within an event
	onimport: (editor, node) => {
		
		editor.onCurveDblClick = function(curve) {
			// event.preventDefault();
			
			// const curve = event.target;
			if (!curve)
				return;
			
			// const reroute = editor.getCustomNodeData('custom_node_reroute');
			// if (!reroute)
				// return;
			
			const [x, y] = editor.getGraphCoordinatesFromAbsolute(event.x, event.y);
			const node = editor.addNodeFromParams({
				x: x, y: y, isPluginCommand: false, isCustom: true, commandCode: "custom_node_reroute", commandName: "Reroute", commandText: "", commandCategory: "Flow Control"
			}, true, true);
			
			if (!node)
				return;
			
			curve.setAttribute('data-_pending', 'true');
			editor.connectPendingCurve(node);
		};
		
		editor.getGraphSVG().addEventListener('dblclick', (event) => {
			const curve = event.path.find(elem => elem.id === "curve");
			if (!curve)
				return;
			
			event.preventDefault();
			editor.onCurveDblClick(curve);
			return false;
		});
	},
	stylesheet: `
		#graphNode[data-commandCode="custom_node_reroute"] > #node-header {
			background: none;
			min-height: 0;
			padding: 0;
			height: 1.5em;
			border-bottom: transparent;
			color: transparent;
			text-shadow: none;
		}

		#graphNode[data-commandCode="custom_node_reroute"] > div {
			height: 1.5em;
			overflow: hidden;
			margin-top: -2.1em;
			pointer-events: none;
			max-width: 15em;
		}

		#graphNode[data-commandCode="custom_node_reroute"] #input-container, #graphNode[data-commandCode="custom_node_reroute"] #node-input,  #graphNode[data-commandCode="custom_node_reroute"] #output-container, #graphNode[data-commandCode="custom_node_reroute"] #nodeOutput{
			min-width: min-content;
			margin: 0 0 0 0.25em;
		}

		#graphNode[data-commandCode="custom_node_reroute"] .exec.outputConnection, #graphNode[data-commandCode="custom_node_reroute"] .exec.inputConnection {
			pointer-events: all;
		}
	`
}];