(function() {
	"use strict";

	const MINIMAP_WIDTH = 240;
	const MINIMAP_HEIGHT = 150;
	const MINIMAP_PADDING = 8;
	const MINIMAP_CONTENT_INTERVAL = 50;
	const MINIMAP_GROUP_COMMENT_COMMAND_CODE = "custom_node_comment_graph";
	const requestFrame = window.requestAnimationFrame || function(callback) { return setTimeout(callback, 16); };
	const cancelFrame = window.cancelAnimationFrame || clearTimeout;

	function graphMinimapNow() {
		return window.performance && performance.now ? performance.now() : Date.now();
	};

	function getGraphMinimapState() {
		return window._graphMinimap || null;
	};

	function getGraphMinimapCache(create) {
		if (!window._cache || !window._cache.editor)
			return null;

		let cache = window._cache.editor.minimap;
		if (!cache || typeof cache !== "object") {
			if (!create)
				return null;
			cache = {};
			window._cache.editor.minimap = cache;
		}
		return cache;
	};

	function getCachedGraphMinimapVisibility() {
		const cache = getGraphMinimapCache(false);
		return cache && typeof cache.visible === "boolean" ? cache.visible : true;
	};

	function cacheGraphMinimapVisibility(visible) {
		if (!window._cacheLoaded)
			return false;
		const cache = getGraphMinimapCache(true);
		if (!cache)
			return false;
		cache.visible = !!visible;
		return true;
	};

	function restoreGraphMinimapVisibilityFromCache() {
		const state = getGraphMinimapState();
		if (!state || state.destroyed || !window._cacheLoaded)
			return false;

		if (typeof state.pendingCachedVisibility === "boolean") {
			cacheGraphMinimapVisibility(state.pendingCachedVisibility);
			setGraphMinimapVisibility(state.pendingCachedVisibility, false);
			state.pendingCachedVisibility = null;
		} else {
			const cache = getGraphMinimapCache(true);
			if (typeof cache.visible !== "boolean")
				cache.visible = true;
			setGraphMinimapVisibility(cache.visible, false);
		}

		state.cacheRestored = true;
		return true;
	};

	function makeGraphMinimapElement() {
		const root = document.createElement("div");
		root.id = "graph-minimap";
		root.setAttribute("data-open", "true");
		root.innerHTML = `
			<button id="graph-minimap-toggle" type="button" title="Toggle graph minimap" aria-label="Toggle graph minimap" aria-expanded="true">
				<svg viewBox="0 0 20 20" aria-hidden="true">
					<rect x="2" y="3" width="5" height="4"></rect>
					<rect x="12" y="4" width="5" height="4"></rect>
					<rect x="7" y="13" width="6" height="4"></rect>
					<path d="M7 5h5M14.5 8v2.5H10v2.5" style="stroke-width: 0.0625em;"></path>
				</svg>
			</button>
			<div id="graph-minimap-panel" title="Click or drag to move the graph viewport">
				<canvas id="graph-minimap-content"></canvas>
				<canvas id="graph-minimap-viewport"></canvas>
			</div>
		`;
		return root;
	};

	function setupGraphMinimap() {
		if (getGraphMinimapState())
			return true;

		const graphEditor = document.querySelector("#graphEditor");
		const graphNodes = document.querySelector("#graphNodes");
		const graphSVG = document.querySelector("#graphSVG");
		const graphCamera = document.querySelector("#graph-camera");
		if (!graphEditor || !graphNodes || !graphSVG || !graphCamera)
			return false;

		const root = makeGraphMinimapElement();
		graphEditor.appendChild(root);

		const state = {
			root: root,
			panel: root.querySelector("#graph-minimap-panel"),
			toggle: root.querySelector("#graph-minimap-toggle"),
			contentCanvas: root.querySelector("#graph-minimap-content"),
			viewportCanvas: root.querySelector("#graph-minimap-viewport"),
			graphEditor: graphEditor,
			graphNodes: graphNodes,
			graphSVG: graphSVG,
			graphCamera: graphCamera,
			visible: getCachedGraphMinimapVisibility(),
			cacheRestored: false,
			pendingCachedVisibility: null,
			pointerDown: false,
			contentDirty: true,
			contentFrame: null,
			contentTimer: null,
			viewportFrame: null,
			lastContentDraw: 0,
			width: 0,
			height: 0,
			pixelRatio: 1,
			map: null,
			bounds: null,
			viewport: null,
			snapshot: {nodes: [], curves: []},
			contentDrawCount: 0,
			viewportDrawCount: 0,
			destroyed: false
		};
		window._graphMinimap = state;

		state.toggle.addEventListener("mousedown", stopGraphMinimapEvent);
		state.toggle.addEventListener("click", function(event) {
			stopGraphMinimapEvent(event);
			toggleGraphMinimap();
		});
		state.panel.addEventListener("mousedown", onGraphMinimapPointerDown);
		state.panel.addEventListener("contextmenu", stopGraphMinimapEvent);
		state.onMouseMove = onGraphMinimapPointerMove;
		state.onMouseUp = onGraphMinimapPointerUp;
		state.onWindowResize = function() {
			scheduleGraphMinimapContent();
		};
		window.addEventListener("mousemove", state.onMouseMove);
		window.addEventListener("mouseup", state.onMouseUp);
		window.addEventListener("resize", state.onWindowResize);

		setupGraphMinimapObservers(state);
		state.sizeTimer = setInterval(checkGraphMinimapSize, 500);
		setGraphMinimapVisibility(state.visible, false);
		if (!restoreGraphMinimapVisibilityFromCache()) {
			state.cacheRestoreTimer = setInterval(function() {
				if (restoreGraphMinimapVisibilityFromCache()) {
					clearInterval(state.cacheRestoreTimer);
					state.cacheRestoreTimer = null;
				}
			}, 50);
		}
		return true;
	};

	function getGraphMinimapOwningNode(element, graphNodes) {
		if (element && element.nodeType !== 1)
			element = element.parentNode;
		while (element && element !== graphNodes) {
			if (element.getAttribute && element.getAttribute("id") === "graphNode")
				return element;
			element = element.parentNode;
		}
		return null;
	};

	function markGraphMinimapNodeTreeSizeDirty(element) {
		if (!element || element.nodeType !== 1)
			return;

		if (element.getAttribute("id") === "graphNode") {
			element._graphMinimapSizeDirty = true;
			element._graphMinimapColorDirty = true;
		}

		if (!element.querySelectorAll)
			return;
		const nodes = element.querySelectorAll('[id="graphNode"]');
		for (let i = 0; i < nodes.length; i++) {
			nodes[i]._graphMinimapSizeDirty = true;
			nodes[i]._graphMinimapColorDirty = true;
		}
	};

	function setupGraphMinimapObservers(state) {
		state.nodesObserver = new MutationObserver(function(mutations) {
			let changed = false;
			for (let i = 0; i < mutations.length; i++) {
				const mutation = mutations[i];
				const node = getGraphMinimapOwningNode(mutation.target, state.graphNodes);

				if (mutation.type === "childList") {
					if (node) {
						node._graphMinimapSizeDirty = true;
						node._graphMinimapColorDirty = true;
					}
					for (let j = 0; j < mutation.addedNodes.length; j++)
						markGraphMinimapNodeTreeSizeDirty(mutation.addedNodes[j]);
					changed = true;
				} else if (mutation.type === "characterData") {
					if (node)
						node._graphMinimapSizeDirty = true;
					changed = true;
				} else if (mutation.type === "attributes") {
					if (node) {
						if (mutation.attributeName === "style")
							node._graphMinimapSizeDirty = true;
						node._graphMinimapColorDirty = true;
					}
					changed = true;
				}
			}
			if (changed)
				scheduleGraphMinimapContent();
		});
		state.nodesObserver.observe(state.graphNodes, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ["style", "class"]
		});

		state.curvesObserver = new MutationObserver(function(mutations) {
			for (let i = 0; i < mutations.length; i++) {
				const mutation = mutations[i];
				if (mutation.type === "childList" || (mutation.target && mutation.target.getAttribute && mutation.target.getAttribute("id") === "curve")) {
					scheduleGraphMinimapContent();
					return;
				}
			}
		});
		state.curvesObserver.observe(state.graphSVG, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["d", "style", "class", "data-coords"]
		});

		state.cameraObserver = new MutationObserver(function() {
			scheduleGraphMinimapViewport();
		});
		state.cameraObserver.observe(state.graphCamera, {
			attributes: true,
			attributeFilter: ["style"]
		});
	};

	function destroyGraphMinimap() {
		const state = getGraphMinimapState();
		if (!state)
			return;

		state.destroyed = true;
		if (state.nodesObserver)
			state.nodesObserver.disconnect();
		if (state.curvesObserver)
			state.curvesObserver.disconnect();
		if (state.cameraObserver)
			state.cameraObserver.disconnect();
		if (state.contentFrame)
			cancelFrame(state.contentFrame);
		if (state.viewportFrame)
			cancelFrame(state.viewportFrame);
		if (state.contentTimer)
			clearTimeout(state.contentTimer);
		if (state.sizeTimer)
			clearInterval(state.sizeTimer);
		if (state.cacheRestoreTimer)
			clearInterval(state.cacheRestoreTimer);

		window.removeEventListener("mousemove", state.onMouseMove);
		window.removeEventListener("mouseup", state.onMouseUp);
		window.removeEventListener("resize", state.onWindowResize);
		if (state.root && state.root.parentNode)
			state.root.parentNode.removeChild(state.root);
		window._graphMinimap = null;
	};

	function stopGraphMinimapEvent(event) {
		if (!event)
			return;
		event.preventDefault();
		event.stopPropagation();
	};

	function toggleGraphMinimap(forceVisible) {
		const state = getGraphMinimapState();
		if (!state)
			return false;
		const visible = typeof forceVisible === "boolean" ? forceVisible : !state.visible;
		setGraphMinimapVisibility(visible, true);
		return visible;
	};

	function setGraphMinimapVisibility(visible, persist) {
		const state = getGraphMinimapState();
		if (!state)
			return;

		state.visible = !!visible;
		state.root.setAttribute("data-open", state.visible ? "true" : "false");
		state.toggle.setAttribute("aria-expanded", state.visible ? "true" : "false");
		state.toggle.title = state.visible ? "Hide graph minimap" : "Show graph minimap";
		if (persist !== false) {
			if (!cacheGraphMinimapVisibility(state.visible))
				state.pendingCachedVisibility = state.visible;
			else
				state.pendingCachedVisibility = null;
		}
		if (state.visible)
			scheduleGraphMinimapContent(true);
	};

	function refreshGraphMinimap(contentChanged) {
		if (contentChanged === false)
			scheduleGraphMinimapViewport();
		else
			scheduleGraphMinimapContent(true);
	};

	function scheduleGraphMinimapContent(immediate) {
		const state = getGraphMinimapState();
		if (!state || state.destroyed)
			return;

		state.contentDirty = true;
		if (!state.visible || state.contentFrame || state.contentTimer)
			return;

		const elapsed = graphMinimapNow() - state.lastContentDraw;
		const delay = immediate ? 0 : Math.max(0, MINIMAP_CONTENT_INTERVAL - elapsed);
		if (delay > 0) {
			state.contentTimer = setTimeout(function() {
				state.contentTimer = null;
				queueGraphMinimapContentFrame();
			}, delay);
		} else {
			queueGraphMinimapContentFrame();
		}
	};

	function queueGraphMinimapContentFrame() {
		const state = getGraphMinimapState();
		if (!state || state.destroyed || state.contentFrame || !state.visible)
			return;

		state.contentFrame = requestFrame(function() {
			state.contentFrame = null;
			if (!state.visible || state.destroyed)
				return;
			drawGraphMinimapContent();
		});
	};

	function scheduleGraphMinimapViewport() {
		const state = getGraphMinimapState();
		if (!state || state.destroyed || !state.visible || state.viewportFrame)
			return;

		state.viewportFrame = requestFrame(function() {
			state.viewportFrame = null;
			if (!state.visible || state.destroyed)
				return;
			drawGraphMinimapViewport();
		});
	};

	function checkGraphMinimapSize() {
		const state = getGraphMinimapState();
		if (!state || !state.visible || state.destroyed)
			return;
		const width = state.panel.clientWidth || MINIMAP_WIDTH;
		const height = state.panel.clientHeight || MINIMAP_HEIGHT;
		if (width !== state.width || height !== state.height)
			scheduleGraphMinimapContent(true);
	};

	function resizeGraphMinimapCanvases(state) {
		const width = state.panel.clientWidth || MINIMAP_WIDTH;
		const height = state.panel.clientHeight || MINIMAP_HEIGHT;
		const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
		const pixelWidth = Math.max(1, Math.round(width * ratio));
		const pixelHeight = Math.max(1, Math.round(height * ratio));
		const changed = state.width !== width || state.height !== height || state.pixelRatio !== ratio || state.contentCanvas.width !== pixelWidth || state.contentCanvas.height !== pixelHeight;

		if (changed) {
			state.width = width;
			state.height = height;
			state.pixelRatio = ratio;
			state.contentCanvas.width = pixelWidth;
			state.contentCanvas.height = pixelHeight;
			state.viewportCanvas.width = pixelWidth;
			state.viewportCanvas.height = pixelHeight;
		}
		return changed;
	};

	function prepareGraphMinimapContext(canvas, state) {
		const context = canvas.getContext("2d");
		context.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
		context.clearRect(0, 0, state.width, state.height);
		return context;
	};

	function getGraphMinimapViewportBounds(state) {
		let scale = typeof window.getGraphEditorScale === "function" ? getGraphEditorScale() : (window._graphScale || 1);
		if (!scale || !isFinite(scale))
			scale = 1;

		let cameraX = window._xGraph || 0;
		let cameraY = window._yGraph || 0;
		if (typeof window.getGraphPosition === "function") {
			const position = getGraphPosition();
			cameraX = position[0] || 0;
			cameraY = position[1] || 0;
		}

		const width = state.graphEditor.clientWidth || state.graphEditor.getBoundingClientRect().width || 1;
		const height = state.graphEditor.clientHeight || state.graphEditor.getBoundingClientRect().height || 1;
		return {
			left: -cameraX / scale,
			top: -cameraY / scale,
			right: (width - cameraX) / scale,
			bottom: (height - cameraY) / scale,
			width: width / scale,
			height: height / scale,
			scale: scale,
			cameraX: cameraX,
			cameraY: cameraY
		};
	};

	function getGraphMinimapNodePosition(node) {
		let x = parseFloat(node.style.left);
		let y = parseFloat(node.style.top);
		if (!isFinite(x) && node.data)
			x = (node.data.x || 0) + (node.xOffset || 0);
		if (!isFinite(y) && node.data)
			y = (node.data.y || 0) + (node.yOffset || 0);
		return {
			x: isFinite(x) ? x : 0,
			y: isFinite(y) ? y : 0
		};
	};

	function isGraphMinimapNodeCulled(state, node) {
		return node.isCulled === true && state.graphNodes.getAttribute("data-culling-nodes-enabled") === "true";
	};

	function isGraphMinimapNodeIgnored(node) {
		const dataCommandCode = node.data && node.data.commandCode;
		const attributeCommandCode = node.getAttribute("data-commandCode");
		return dataCommandCode === MINIMAP_GROUP_COMMENT_COMMAND_CODE || attributeCommandCode === MINIMAP_GROUP_COMMENT_COMMAND_CODE;
	};

	function measureDirtyCulledGraphMinimapNodes(state, nodeElements) {
		const measuring = [];

		for (let i = 0; i < nodeElements.length; i++) {
			const node = nodeElements[i];
			if (isGraphMinimapNodeIgnored(node) || !node._graphMinimapSizeDirty || !isGraphMinimapNodeCulled(state, node))
				continue;

			measuring.push({
				node: node,
				style: node.getAttribute("style")
			});
			node.style.setProperty("display", "block", "important");
			node.style.setProperty("visibility", "hidden", "important");
			node.style.setProperty("pointer-events", "none", "important");
		}

		for (let j = 0; j < measuring.length; j++) {
			const measuredNode = measuring[j].node;
			const width = measuredNode.offsetWidth;
			const height = measuredNode.offsetHeight;
			if (width > 0 && height > 0) {
				measuredNode._graphMinimapMeasuredWidth = width;
				measuredNode._graphMinimapMeasuredHeight = height;
				measuredNode._graphMinimapSizeDirty = false;
			}
		}

		for (let k = 0; k < measuring.length; k++) {
			const measurement = measuring[k];
			if (measurement.style === null)
				measurement.node.removeAttribute("style");
			else
				measurement.node.setAttribute("style", measurement.style);
		}

		if (measuring.length && state.nodesObserver)
			state.nodesObserver.takeRecords();
	};

	function getGraphMinimapNodeSize(node) {
		let width = node.offsetWidth;
		let height = node.offsetHeight;

		if (width > 0 && height > 0) {
			node._graphMinimapMeasuredWidth = width;
			node._graphMinimapMeasuredHeight = height;
			node._graphMinimapSizeDirty = false;
		} else {
			width = node._graphMinimapMeasuredWidth || node.width || 160;
			height = node._graphMinimapMeasuredHeight || node.height || 80;
		}

		width = parseFloat(width);
		height = parseFloat(height);
		return {
			width: isFinite(width) && width > 0 ? width : 160,
			height: isFinite(height) && height > 0 ? height : 80
		};
	};

	function isTransparentGraphMinimapColor(color) {
		if (!color || color === "transparent")
			return true;
		return /^rgba\([^)]*,\s*0(?:\.0+)?\s*\)$/i.test(color);
	};

	function getGraphMinimapGradientColor(backgroundImage) {
		if (!backgroundImage || backgroundImage === "none")
			return "";

		const colors = backgroundImage.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi) || [];
		for (let i = 0; i < colors.length; i++)
			if (!isTransparentGraphMinimapColor(colors[i]))
				return colors[i];
		return "";
	};

	function getGraphMinimapNodeColor(node) {
		if (!node._graphMinimapColorDirty && node._graphMinimapHeaderColor)
			return node._graphMinimapHeaderColor;

		let color = "";
		const header = node.querySelector('[id="node-header"]');
		if (header && window.getComputedStyle) {
			const style = getComputedStyle(header);
			color = style.backgroundColor;
			if (isTransparentGraphMinimapColor(color))
				color = getGraphMinimapGradientColor(style.backgroundImage);
		}
		if (isTransparentGraphMinimapColor(color))
			color = node.classList.contains("nodeEvent") ? "#d4b5ff" : "#9179af";

		node._graphMinimapHeaderColor = color;
		node._graphMinimapColorDirty = false;
		return color;
	};

	function collectGraphMinimapSnapshot(state) {
		const snapshot = {nodes: [], curves: []};
		const nodeElements = state.graphNodes.querySelectorAll('[id="graphNode"]');
		measureDirtyCulledGraphMinimapNodes(state, nodeElements);
		for (let i = 0; i < nodeElements.length; i++) {
			const node = nodeElements[i];
			if (node.isDummy || (node.data && node.data.isDummy) || isGraphMinimapNodeIgnored(node))
				continue;

			const position = getGraphMinimapNodePosition(node);
			const size = getGraphMinimapNodeSize(node);
			snapshot.nodes.push({
				id: node.getAttribute("data-nodeId") || (node.data ? node.data.id : i),
				x: position.x,
				y: position.y,
				width: size.width,
				height: size.height,
				color: getGraphMinimapNodeColor(node),
				selected: node.classList.contains("selected")
			});
		}

		const curveElements = state.graphSVG.querySelectorAll('path[id="curve"]');
		for (let j = 0; j < curveElements.length; j++) {
			const curve = curveElements[j];
			if (curve.isTemp)
				continue;

			let from = curve.from;
			let to = curve.to;
			if ((!from || !to) && curve.getAttribute("data-coords")) {
				const coordinates = curve.getAttribute("data-coords").split(",").map(Number);
				if (coordinates.length === 4) {
					from = [coordinates[0], coordinates[1]];
					to = [coordinates[2], coordinates[3]];
				}
			}
			if (!from || !to || !isFinite(from[0]) || !isFinite(from[1]) || !isFinite(to[0]) || !isFinite(to[1]))
				continue;

			snapshot.curves.push({
				fromX: from[0],
				fromY: from[1],
				toX: to[0],
				toY: to[1]
			});
		}
		return snapshot;
	};

	function getGraphMinimapBounds(snapshot, viewport) {
		let left = viewport.left;
		let top = viewport.top;
		let right = viewport.right;
		let bottom = viewport.bottom;
		const hasContent = snapshot.nodes.length > 0 || snapshot.curves.length > 0;

		if (hasContent) {
			left = Infinity;
			top = Infinity;
			right = -Infinity;
			bottom = -Infinity;

			for (let i = 0; i < snapshot.nodes.length; i++) {
				const node = snapshot.nodes[i];
				left = Math.min(left, node.x);
				top = Math.min(top, node.y);
				right = Math.max(right, node.x + node.width);
				bottom = Math.max(bottom, node.y + node.height);
			}
			for (let j = 0; j < snapshot.curves.length; j++) {
				const curve = snapshot.curves[j];
				left = Math.min(left, curve.fromX, curve.toX);
				top = Math.min(top, curve.fromY, curve.toY);
				right = Math.max(right, curve.fromX, curve.toX);
				bottom = Math.max(bottom, curve.fromY, curve.toY);
			}

			left = Math.min(left, viewport.left);
			top = Math.min(top, viewport.top);
			right = Math.max(right, viewport.right);
			bottom = Math.max(bottom, viewport.bottom);
		}

		const width = Math.max(right - left, 1);
		const height = Math.max(bottom - top, 1);
		const paddingX = Math.max(80, width * 0.04, viewport.width * 0.25);
		const paddingY = Math.max(80, height * 0.04, viewport.height * 0.25);
		return {
			left: left - paddingX,
			top: top - paddingY,
			right: right + paddingX,
			bottom: bottom + paddingY
		};
	};

	function makeGraphMinimapMap(state, bounds) {
		const graphWidth = Math.max(bounds.right - bounds.left, 1);
		const graphHeight = Math.max(bounds.bottom - bounds.top, 1);
		const availableWidth = Math.max(state.width - MINIMAP_PADDING * 2, 1);
		const availableHeight = Math.max(state.height - MINIMAP_PADDING * 2, 1);
		const scale = Math.min(availableWidth / graphWidth, availableHeight / graphHeight);
		const drawnWidth = graphWidth * scale;
		const drawnHeight = graphHeight * scale;
		return {
			scale: scale,
			offsetX: (state.width - drawnWidth) / 2 - bounds.left * scale,
			offsetY: (state.height - drawnHeight) / 2 - bounds.top * scale
		};
	};

	function graphMinimapToCanvas(state, graphX, graphY) {
		return {
			x: graphX * state.map.scale + state.map.offsetX,
			y: graphY * state.map.scale + state.map.offsetY
		};
	};

	function drawGraphMinimapContent() {
		const state = getGraphMinimapState();
		if (!state || state.destroyed || !state.visible)
			return;

		resizeGraphMinimapCanvases(state);
		state.viewport = getGraphMinimapViewportBounds(state);
		state.snapshot = collectGraphMinimapSnapshot(state);
		state.bounds = getGraphMinimapBounds(state.snapshot, state.viewport);
		state.map = makeGraphMinimapMap(state, state.bounds);

		const context = prepareGraphMinimapContext(state.contentCanvas, state);
		context.lineCap = "round";
		context.lineWidth = 1;
		context.strokeStyle = "rgba(205, 195, 225, 0.42)";
		context.beginPath();
		for (let i = 0; i < state.snapshot.curves.length; i++) {
			const curve = state.snapshot.curves[i];
			const from = graphMinimapToCanvas(state, curve.fromX, curve.fromY);
			const to = graphMinimapToCanvas(state, curve.toX, curve.toY);
			context.moveTo(from.x, from.y);
			context.lineTo(to.x, to.y);
		}
		context.stroke();

		for (let j = 0; j < state.snapshot.nodes.length; j++) {
			const node = state.snapshot.nodes[j];
			const topLeft = graphMinimapToCanvas(state, node.x, node.y);
			const width = Math.max(node.width * state.map.scale, 1);
			const height = Math.max(node.height * state.map.scale, 1);
			context.fillStyle = node.color;
			context.fillRect(topLeft.x, topLeft.y, width, height);
			if (node.selected && width >= 3 && height >= 3) {
				context.strokeStyle = "rgba(255, 221, 160, 0.95)";
				context.lineWidth = 1;
				context.strokeRect(Math.round(topLeft.x) + 0.5, Math.round(topLeft.y) + 0.5, Math.max(Math.round(width) - 1, 1), Math.max(Math.round(height) - 1, 1));
			}
		}

		if (!state.snapshot.nodes.length) {
			context.fillStyle = "rgba(220, 215, 230, 0.48)";
			context.font = "12px sans-serif";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillText("No graph nodes", state.width / 2, state.height / 2);
		}

		state.contentDirty = false;
		state.lastContentDraw = graphMinimapNow();
		state.contentDrawCount++;
		drawGraphMinimapViewport();
	};

	function isGraphMinimapViewportInsideBounds(viewport, bounds) {
		return viewport.left >= bounds.left && viewport.top >= bounds.top && viewport.right <= bounds.right && viewport.bottom <= bounds.bottom;
	};

	function drawGraphMinimapViewport() {
		const state = getGraphMinimapState();
		if (!state || state.destroyed || !state.visible)
			return;
		if (!state.map || !state.bounds) {
			scheduleGraphMinimapContent(true);
			return;
		}
		if (resizeGraphMinimapCanvases(state)) {
			scheduleGraphMinimapContent(true);
			return;
		}

		const viewport = getGraphMinimapViewportBounds(state);
		state.viewport = viewport;
		if (!isGraphMinimapViewportInsideBounds(viewport, state.bounds))
			scheduleGraphMinimapContent();

		const context = prepareGraphMinimapContext(state.viewportCanvas, state);
		const topLeft = graphMinimapToCanvas(state, viewport.left, viewport.top);
		const bottomRight = graphMinimapToCanvas(state, viewport.right, viewport.bottom);
		const width = Math.max(bottomRight.x - topLeft.x, 3);
		const height = Math.max(bottomRight.y - topLeft.y, 3);

		context.fillStyle = "rgba(105, 180, 255, 0.12)";
		context.fillRect(topLeft.x, topLeft.y, width, height);
		context.strokeStyle = "rgba(135, 205, 255, 0.95)";
		context.lineWidth = 1.5;
		context.strokeRect(Math.round(topLeft.x) + 0.5, Math.round(topLeft.y) + 0.5, Math.max(Math.round(width) - 1, 2), Math.max(Math.round(height) - 1, 2));
		state.viewportDrawCount++;
	};

	function onGraphMinimapPointerDown(event) {
		if (event.which && event.which !== 1)
			return;
		const state = getGraphMinimapState();
		if (!state || !state.visible)
			return;
		state.pointerDown = true;
		stopGraphMinimapEvent(event);
		moveGraphFromMinimapEvent(event);
	};

	function onGraphMinimapPointerMove(event) {
		const state = getGraphMinimapState();
		if (!state || !state.pointerDown)
			return;
		stopGraphMinimapEvent(event);
		moveGraphFromMinimapEvent(event);
	};

	function onGraphMinimapPointerUp(event) {
		const state = getGraphMinimapState();
		if (!state || !state.pointerDown)
			return;
		state.pointerDown = false;
		stopGraphMinimapEvent(event);
	};

	function moveGraphFromMinimapEvent(event) {
		const state = getGraphMinimapState();
		if (!state || !state.map)
			return;

		const rect = state.viewportCanvas.getBoundingClientRect();
		if (!rect.width || !rect.height)
			return;
		const canvasX = (event.clientX - rect.left) * state.width / rect.width;
		const canvasY = (event.clientY - rect.top) * state.height / rect.height;
		const graphX = (canvasX - state.map.offsetX) / state.map.scale;
		const graphY = (canvasY - state.map.offsetY) / state.map.scale;
		centerGraphMinimapOn(graphX, graphY);
	};

	function centerGraphMinimapOn(graphX, graphY) {
		const state = getGraphMinimapState();
		if (!state || !isFinite(graphX) || !isFinite(graphY))
			return;

		const scale = typeof window.getGraphEditorScale === "function" ? getGraphEditorScale() : (window._graphScale || 1);
		const width = state.graphEditor.clientWidth || state.graphEditor.getBoundingClientRect().width || 1;
		const height = state.graphEditor.clientHeight || state.graphEditor.getBoundingClientRect().height || 1;
		const cameraX = width / 2 - graphX * scale;
		const cameraY = height / 2 - graphY * scale;

		if (typeof window.setGraphPosition === "function")
			setGraphPosition(cameraX, cameraY);
		else {
			window._xGraph = cameraX;
			window._yGraph = cameraY;
			state.graphCamera.style.transform = `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${scale})`;
		}

		if (typeof window.refreshAllNodesCull === "function")
			refreshAllNodesCull();
		if (typeof window.refreshAllCurvesCull === "function")
			refreshAllCurvesCull();
		scheduleGraphMinimapViewport();
	};

	function autoSetupGraphMinimap() {
		let attempts = 0;
		function trySetup() {
			if (setupGraphMinimap())
				return;
			attempts++;
			if (attempts < 120)
				setTimeout(trySetup, 250);
		};
		trySetup();
	};

	window.setupGraphMinimap = setupGraphMinimap;
	window.destroyGraphMinimap = destroyGraphMinimap;
	window.toggleGraphMinimap = toggleGraphMinimap;
	window.refreshGraphMinimap = refreshGraphMinimap;
	window.centerGraphMinimapOn = centerGraphMinimapOn;

	if (document.readyState === "complete" || document.readyState === "interactive")
		setTimeout(autoSetupGraphMinimap, 0);
	else
		window.addEventListener("DOMContentLoaded", autoSetupGraphMinimap);
})();
