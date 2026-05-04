module.exports = [{
	category: "Flow Control",
	name: "Reroute",
	engine: ["MV", "MZ"],
	event_type: ["common", "map", "troop"],
	id: "custom_node_reroute",
	exec_input: true,
	exec_input_params: {
		is_list: false,
		exclusive: "exec",
	},
	exec_output: true,
	exec_output_params: {
		is_list: false,
		exclusive: "exec",
	},
	inputs: [],
	outputs: [],
	parse: (editor, command, node, behaviors, inputs, sequence) => {},
	onimport: (editor, node) => {
		
		editor.onCurveDblClick = function(curve) {
			if (!curve)
				return;
			
			const [x, y] = editor.getGraphCoordinatesFromAbsolute(event.x, event.y);
			const node = editor.addNodeFromParams({
				x: x, y: y, isPluginCommand: false, isCustom: true, commandCode: "custom_node_reroute", commandName: "Reroute", commandText: "", commandCategory: "Flow Control"
			}, false, true);
			
			if (!node)
				return;
			
			const nodeId = editor.getNodeId(node);
			const leftNodeId = editor.getCurveLeftNodeId(curve);
			const rightNodeId = editor.getCurveRightNodeId(curve);
			const leftNode = editor.getCurveLeftNode(curve);
			const rightNode = editor.getCurveRightNode(curve);
			
			const beforeConnectionsMap = [editor.getGraphNodeFromCache(node).connectionsMap, editor.getGraphNodeFromCache(leftNode).connectionsMap, editor.getGraphNodeFromCache(rightNode).connectionsMap];
			
			curve.isPending = true;
			editor._pendingCurve = curve;
			editor.connectPendingCurve(node);
			
			editor.addToUndoHistory({type: "addNode", target: [node]});
			editor.addToUndoHistory({
				type: "connect",
				beforeNodeIds: [nodeId, leftNodeId, rightNodeId],
				beforeConnectionsMap: beforeConnectionsMap,
				afterNodeIds: [nodeId, leftNodeId, rightNodeId],
				afterConnectionsMap: [editor.getGraphNodeFromCache(node).connectionsMap, editor.getGraphNodeFromCache(leftNode).connectionsMap, editor.getGraphNodeFromCache(rightNode).connectionsMap],
			});
		};
		
		editor.getGraphSVG().addEventListener('dblclick', (event) => {
			const curve = event.path.find(elem => elem.id === "curve");
			if (!curve)
				return;
			
			event.stopPropagation();
			event.stopImmediatePropagation();
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