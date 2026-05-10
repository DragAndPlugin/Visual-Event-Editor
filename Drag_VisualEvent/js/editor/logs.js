window._logs = {
	maxLogFiles: 10,
	maxArgLength: 10000,
	initialized: false,
	isWriting: false,
	sessionLogPath: null,
	alias: {
		log: console.log.bind(console),
		warn: console.warn.bind(console),
		error: console.error.bind(console)
	}
};

function logsShouldIgnore(level, message) {
	if (!message)
		return false;

	return (
		message.includes("ResizeObserver loop limit exceeded") ||
		message.includes("ResizeObserver loop completed with undelivered notifications")
	);
};

function getLogsDirectory() {
	const path = $.Drag.VisualEvent.modules.path;
	const projectRoot = $.Drag.VisualEvent.getProjectRoot ? $.Drag.VisualEvent.getProjectRoot() : process.cwd();

	return path.join(projectRoot, "Drag_VisualEvent", "logs");
};

function getLogsFileName() {
	const date = new Date();
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}-${String(date.getSeconds()).padStart(2, "0")}.log`;
};

function initLogs() {
	if (window._logs.initialized)
		return;

	try {
		const fs = $.Drag.VisualEvent.modules.fs;
		const path = $.Drag.VisualEvent.modules.path;

		if (!fs || !path)
			return;

		const logsDir = getLogsDirectory();
		$.Drag.VisualEvent.ensureDirectoryExistence(path.join(logsDir, "logs.txt"));

		window._logs.sessionLogPath = path.join(logsDir, `VisualEventEditor-log-${getLogsFileName()}`);
		window._logs.initialized = true;

		writeLogsToFile("info", [`\n===== SESSION INFO =====\n\nLogs successfully initialized.\nVisual Event Editor v${$.Drag.VisualEvent.version}\nRPG Maker ${$.Utils.RPGMAKER_NAME} Corescript v${$.Utils.RPGMAKER_VERSION}\nChromium v${process.versions["chromium"]}\nNodeJS v${process.versions["node"]}\nNWJS v${process.versions["nw"]}\nPIXI v${$.PIXI.VERSION}\n\n===== LOGS =====\n\n`], false);
		deleteOldLogs();
	} catch (error) {
		window._logs.alias.error("Failed to initialize Visual Event Editor logs:", error);
	}
};

function deleteOldLogs() {
	try {
		const fs = $.Drag.VisualEvent.modules.fs;
		const path = $.Drag.VisualEvent.modules.path;
		const logsDir = getLogsDirectory();

		if (!fs.existsSync(logsDir))
			return;

		const files = fs.readdirSync(logsDir)
			.filter(file => file.startsWith("VisualEventEditor-log-") && file.endsWith(".log"))
			.map(file => ({
				name: file,
				path: path.join(logsDir, file),
				mtime: fs.statSync(path.join(logsDir, file)).mtimeMs
			}))
			.sort((a, b) => b.mtime - a.mtime);

		for (const file of files.slice(window._logs.maxLogFiles))
			fs.unlinkSync(file.path);
	} catch (error) {
		window._logs.alias.warn("Failed to delete old log files:", error);
	}
};

function formatLogsArg(arg) {
	try {
		if (arg instanceof Error)
			return `${arg.name}: ${arg.message}\n${arg.stack || ""}`;

		if (typeof arg === "string")
			return arg;

		if (typeof arg === "undefined")
			return "undefined";

		if (arg === null)
			return "null";

		if (typeof arg === "function")
			return `[Function ${arg.name || "anonymous"}]`;

		if (typeof arg === "object") {
			try {
				return JSON.stringify(arg, safeJsonReplacer(), 2);
			} catch (_) {
				return Object.prototype.toString.call(arg);
			}
		}

		return String(arg);
	} catch (error) {
		return "[Unformattable log argument]";
	}
};

function safeJsonReplacer() {
	const seen = [];

	return function(key, value) {
		if (typeof value === "object" && value !== null) {
			if (seen.includes(value))
				return "[Circular]";
			seen.push(value);
		}

		if (value instanceof HTMLElement)
			return `[HTMLElement ${value.tagName}${value.id ? "#" + value.id : ""}]`;

		if (typeof value === "function")
			return `[Function ${value.name || "anonymous"}]`;

		return value;
	};
};

function formatLogsArgs(args) {
	const text = Array.from(args).map(arg => formatLogsArg(arg)).join(" ");

	if (text.length > window._logs.maxArgLength)
		return text.slice(0, window._logs.maxArgLength) + "\n[Log truncated]";

	return text;
};

function getLogsContext() {
	try {
		return {
			targetType: window.data.targetType || null,
			targetId: window.data.targetId || null,
			pageId: window.data.pageId || null,
			mapTargetId: window.data.mapTargetId || null,
			nodeCount: Array.isArray(window.nodes) ? window.nodes.length : null,
			curveCount: typeof getAllCurves === "function" ? Array.from(getAllCurves()).length : null
		};
	} catch (error) {
		return {};
	}
};

function writeLogsToFile(level, args, addContext = true) {
	if (window._logs.isWriting)
		return;

	if (!window._logs.initialized || !window._logs.sessionLogPath)
		return;

	try {
		window._logs.isWriting = true;

		const fs = $.Drag.VisualEvent.modules.fs;
		const message = formatLogsArgs(args);

		if (logsShouldIgnore(level, message))
			return;

		const entry = `[${new Date().toISOString()}][${level}]: ${message}${addContext ? "\n" : "\n\n"}`;
		fs.appendFileSync(window._logs.sessionLogPath, entry);
		if (addContext)
			fs.appendFileSync(window._logs.sessionLogPath, JSON.stringify(getLogsContext()) + "\n\n");
	} catch (error) {
		window._logs.alias.error("Failed to write logs :", error);
	} finally {
		window._logs.isWriting = false;
	}
};

function updateLogsIcon(level, args) {
	const message = formatLogsArgs(args);

	if (logsShouldIgnore(level, message))
		return;

	if (level === "error") {
		if (!window._logErrors)
			window._logErrors = [];

		window._logErrors.push(message);

		const logError = document.querySelector("#log-error");
		if (logError) {
			logError.style.display = "flex";
			const counter = logError.querySelector("span");
			if (counter)
				counter.innerHTML = `${window._logErrors.length}`;
		}
	} else if (level === "warn") {
		if (!window._logs)
			window._logs = [];

		window._logs.push(message);

		const log = document.querySelector("#log");
		if (log) {
			log.style.display = "flex";
			const counter = log.querySelector("span");
			if (counter)
				counter.innerHTML = `${window._logs.length}`;
		}
	}
};

function handleLogs(level, args) {
	updateLogsIcon(level, args);
	writeLogsToFile(level, args);
};

console.log = function() {
	writeLogsToFile("log", arguments);
	window._logs.alias.log.apply(console, arguments);
};

console.warn = function() {
	handleLogs("warn", arguments);
	window._logs.alias.warn.apply(console, arguments);
};

console.error = function() {
	handleLogs("error", arguments);
	window._logs.alias.error.apply(console, arguments);
};

window.addEventListener("error", function(event) {
	handleLogs("error", [event.type, event.message, event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : "", event.error || ""]);
});

window.addEventListener("unhandledrejection", function(event) {
	handleLogs("error", ["unhandledrejection", event.reason || ""]);
});