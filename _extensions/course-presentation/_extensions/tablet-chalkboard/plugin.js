/*****************************************************************
 ** Author: Kendra Burbank
 **
 ** A plugin for reveal.js adding a chalkboard, modified to work well with a stylus
 **
 ** Version: 1.0.0
 **
 ** License: MIT license (see LICENSE.md)
 **
 ** Credits:
 ** Forked from work by Asvin Goel.
 ** Chalkboard effect by Mohamed Moustafa https://github.com/mmoustafa/Chalkboard
 ** Multi color support initially added by Kurt Rinnert https://github.com/rinnert
 ** Compatibility with reveal.js v4 by Hakim El Hattab https://github.com/hakimel
 ******************************************************************/

/* Only works if the fontawesome extension is installed and used at least once */

window.RevealTabletChalkboard = window.RevealTabletChalkboard || {
	id: 'RevealTabletChalkboard',
	init: function (deck) {
		initChalkboard(deck);
	},
	configure: function (config) {
		configure(config);
	},
	toggleNotesCanvas: function () {
		toggleNotesCanvas();
	},
	toggleChalkboard: function () {
		toggleChalkboard();
	},
	colorIndex: function () {
		colorIndex();
	},
	colorNext: function () {
		colorNext();
	},
	colorPrev: function () {
		colorPrev();
	},
	clear: function () {
		clear();
	},
	reset: function () {
		reset();
	},
	resetAll: function () {
		resetAll();
	},
	updateStorage: function () {
		updateStorage();
	},
	getData: function () {
		return getData();
	},
	download: function () {
		download();
	},
};

function scriptPath() {
	// obtain plugin path from the script element
	var src;
	if (document.currentScript) {
		src = document.currentScript.src;
	} else {
		var sel = document.querySelector('script[src$="/tablet-chalkboard/plugin.js"]')
		if (sel) {
			src = sel.src;
		}
	}
	var path = (src === undefined) ? "" : src.slice(0, src.lastIndexOf("/") + 1);
	//console.log("Path: " + path);
	return path;
}
var path = scriptPath();

const initChalkboard = function (Reveal) {
	//console.warn(path);
	/* Feature detection for passive event handling*/
	var passiveSupported = false;

	try {
		window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
			get: function () {
				passiveSupported = true;
			}
		}));
	} catch (err) { }


	/*****************************************************************
	 ** Configuration
	 ******************************************************************/
	var background, pen, draw, color;
	var grid = false;
	var boardmarkerWidth = 3;
	var chalkWidth = 7;
	var chalkEffect = 1.0;
	var rememberColor = [true, false];
	var eraser = {
		src: "",
		radius: 20
	};
	var boardmarkers = [
		{
			color: 'rgba(220,20,60,1)',
			cursor: ""
		},
		{
		color: 'rgba(100,100,100,1)',
		cursor: ""
	},
	{
		color: 'rgba(30,144,255, 1)',
		cursor: ""
	},
	
	{
		color: 'rgba(50,205,50,1)',
		cursor: ""
	},
	{
		color: 'rgba(255,140,0,1)',
		cursor: ""
	},
	{
		color: 'rgba(150,0,20150,1)',
		cursor: ""
	},
	{
		color: 'rgba(255,220,0,1)',
		cursor: ""
	},
	{
		color: 'rgba(255,255,255,1)',
		cursor: ""
	}
	];
	var chalks = [{
		color: 'rgba(255,255,255,0.5)',
		cursor: ""
	},
	{
		color: 'rgba(96, 154, 244, 0.5)',
		cursor: ""
	},
	{
		color: 'rgba(237, 20, 28, 0.5)',
		cursor: ""
	},
	{
		color: 'rgba(20, 237, 28, 0.5)',
		cursor: ""
	},
	{
		color: 'rgba(220, 133, 41, 0.5)',
		cursor: ""
	},
	{
		color: 'rgba(220,0,220,0.5)',
		cursor: ""
	},
	{
		color: 'rgba(255,220,0,0.5)',
		cursor: ""
	}
	];
	var keyBindings = {
		toggleNotesCanvas: {
			keyCode: 67,
			key: 'C',
			description: 'Toggle notes canvas'
		},
		toggleChalkboard: {
			keyCode: 66,
			key: 'B',
			description: 'Toggle chalkboard'
		},
		clear: {
			keyCode: 46,
			key: 'DEL',
			description: 'Clear drawings on slide'
		},
		/*
				reset: {
					keyCode: 173,
					key: '-',
					description: 'Reset drawings on slide'
				},
		*/
		resetAll: {
			keyCode: 8,
			key: 'BACKSPACE',
			description: 'Reset all drawings'
		},
		colorNext: {
			keyCode: 88,
			key: 'X',
			description: 'Next color'
		},
		colorPrev: {
			keyCode: 89,
			key: 'Y',
			description: 'Previous color'
		},
		download: {
			keyCode: 68,
			key: 'D',
			description: 'Download drawings'
		}
	};


	var theme = 'whiteboard';
	var color = [0, 0];
	var toggleChalkboardButton = false;
	var toggleNotesButton = false;
	var colorButtons = true;
	var boardHandle = true;
	var transition = 800;

	var readOnly = false;
	var messageType = 'broadcast';

	var config = configure({});
	if (config.keyBindings) {
		for (var key in config.keyBindings) {
			keyBindings[key] = config.keyBindings[key];
		};
	}

	function configure(config) {
		config.chalkboard = true;

		if (config.boardmarkerWidth || config.penWidth) boardmarkerWidth = config.boardmarkerWidth || config.penWidth;
		if (config.chalkWidth) chalkWidth = config.chalkWidth;
		if (config.chalkEffect) chalkEffect = config.chalkEffect;
		if (config.rememberColor) rememberColor = config.rememberColor;
		if (config.eraser) eraser = config.eraser;
		if (config.boardmarkers) boardmarkers = config.boardmarkers;
		if (config.chalks) chalks = config.chalks;

		if (config.theme) theme = config.theme;
		switch (theme) {
			case 'whiteboard':
				background = ['rgba(127,127,127,.1)', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAAAAACo4kLRAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfoAwYXDx9H8bKMAAAAAW9yTlQBz6J3mgAAAKdJREFUGNNNUAEOxDAI8v+fvFXUfeNAbTKztI6ioJYRWcVDgQhkpREkEAqdAC9jUlVkeYLRDGtKVriAZmNAvR7AfyKGd0/1OmC7/DCVe5+C8hXY6eM5LXl5g9R5IAciqhyt81Km3comy1P1BRwxr0+M4mWFxowNjT46A2Ipw6Vsq2voE/w2bAbi0mhrF7blUCFmgcAy12I/cuMWrt+SLq4Ru/k1y875B3BlZGnSP0QAAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI0LTAzLTA2VDIzOjE1OjE0KzAwOjAw4xyC1QAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNC0wMy0wNlQyMzoxNToxNCswMDowMJJBOmkAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjQtMDMtMDZUMjM6MTU6MzErMDA6MDDVSTNsAAAAAElFTkSuQmCC"];
				draw = [drawWithBoardmarker, drawWithBoardmarker];
				pens = [boardmarkers, boardmarkers];
				grid = {
					color: 'rgb(127,127,255,0.1)',
					distance: 40,
					width: 2
				};
				break;
			case 'chalkboard':
			default:
				background = ['rgba(127,127,127,.1)', path + 'img/blackboard.png'];
				draw = [drawWithBoardmarker, drawWithChalk];
				pens = [boardmarkers, chalks];
				grid = {
					color: 'rgb(50,50,10,0.5)',
					distance: 80,
					width: 2
				};
		}

		if (config.background) background = config.background;
		if (config.grid != undefined) grid = config.grid;

		config.toggleChalkboardButton = true;
		config.toggleNotesButton = true;
		config.colorButtons = true;
		config.boardHandle = true;

		if (config.toggleChalkboardButton != undefined) toggleChalkboardButton = config.toggleChalkboardButton;

		if (config.toggleNotesButton != undefined) toggleNotesButton = config.toggleNotesButton;
		if (config.colorButtons != undefined) colorButtons = config.colorButtons;
		if (config.boardHandle != undefined) boardHandle = config.boardHandle;
		if (config.transition) transition = config.transition;

		if (config.readOnly != undefined) readOnly = config.readOnly;
		if (config.messageType) messageType = config.messageType;

		if (drawingCanvas && (config.theme || config.background || config.grid)) {
			var canvas = document.getElementById(drawingCanvas[1].id);
			canvas.style.background = 'url("' + background[1] + '") repeat';
			clearCanvas(1);
			drawGrid();
		}

		return config;
	}
	/*****************************************************************
	 ** Setup
	 ******************************************************************/

	function whenReady(callback) {
		// wait for markdown to be parsed and code to be highlighted
		if (!document.querySelector('section[data-markdown]:not([data-markdown-parsed])')
			&& !document.querySelector('code[data-line-numbers*="|"]')
		) {
			callback();
		} else {
			console.log("Wait for markdown to be parsed and code to be highlighted");
			setTimeout(whenReady, 500, callback)
		}
	}

	function whenLoaded(callback) {
		// wait for drawings to be loaded and markdown to be parsed
		if (loaded !== null) {
			callback();
		} else {
			console.log("Wait for drawings to be loaded");
			setTimeout(whenLoaded, 500, callback)
		}
	}

	if (toggleChalkboardButton) {
		console.warn("toggleChalkboardButton is deprecated, use customcontrols plugin instead!");
		//console.log("toggleChalkboardButton")
		var button = document.createElement('div');
		button.className = "chalkboard-button";
		button.id = "toggle-chalkboard";
		button.style.visibility = "visible";
		button.style.position = "absolute";
		button.style.zIndex = 30;
		button.style.fontSize = "30px";

		button.style.left = toggleChalkboardButton.left || "45px";
		button.style.bottom = toggleChalkboardButton.bottom || "3px";
		button.style.top = toggleChalkboardButton.top || "auto";
		button.style.right = toggleChalkboardButton.right || "auto";

		button.innerHTML = '<a href="#" title="Toggle chalkboard (' + keyBindings.toggleChalkboard.key + ')" onclick="RevealTabletChalkboard.toggleChalkboard(); return false;"><i></i><svg aria-hidden="true" focusable="false" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 612" width="1em" height="1em"><!-- Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path fill="#86878f" d="M96 32C60.7 32 32 60.7 32 96V384H96V96l384 0V384h64V96c0-35.3-28.7-64-64-64H96zM224 384v32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H416V384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32z"/></svg></a>'
		document.querySelector(".reveal").appendChild(button);
	}
	if (toggleNotesButton) {
		console.warn("toggleNotesButton is deprecated, use customcontrols plugin instead!");
		//console.log("toggleNotesButton")
		var button = document.createElement('div');
		button.className = "chalkboard-button";
		button.id = "toggle-notes";
		button.style.position = "absolute";
		button.style.zIndex = 30;
		button.style.fontSize = "20px";
		button.style.color = "gray";

		button.style.left = toggleNotesButton.left || "80px";
		button.style.bottom = toggleNotesButton.bottom || "12px";
		button.style.top = toggleNotesButton.top || "auto";
		button.style.right = toggleNotesButton.right || "auto";

		button.innerHTML = '<a href="#" title="Toggle slide annotation (' + keyBindings.toggleNotesCanvas.key + ')" onclick="RevealTabletChalkboard.toggleNotesCanvas(); return false;"><i></i><svg aria-hidden="true" focusable="false" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em"><!-- Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path fill="#86878f" d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg></a>';
		document.querySelector(".reveal").appendChild(button);
	}

	var drawingCanvas = [{
		id: 'notescanvas'
	}, {
		id: 'chalkboard'
	}];
	setupDrawingCanvas(0);
	setupDrawingCanvas(1);

	var mode = 0; // 0: notes canvas, 1: chalkboard
	var board = 0; // board index (only for chalkboard)

	var mouseX = 0;
	var mouseY = 0;
	var lastX = null;
	var lastY = null;

	var drawing = false;
	var erasing = false;

	var slideStart = Date.now();
	var slideIndices = {
		h: 0,
		v: 0
	};

	var timeouts = [
		[],
		[]
	];
	var touchTimeout = null;
	var slidechangeTimeout = null;
	var updateStorageTimeout = null;
	var playback = false;

	function createPalette(colors, length,id) {
		var revealFooter = document.querySelector('.reveal-footer')

		if (!revealFooter) {
			revealFooter = revealDiv;
		}
		if (length === true || length > colors.length) {
			length = colors.length;
		}

		var palette = document.createElement('div')
		revealFooter.appendChild(palette);
		palette.classList.add('palette');
		palette.classList.add('id'+id)
		var list = document.createElement('ul');
		// color pickers
		for (var i = 0; i < length; i++) {
			var colorButton = document.createElement('li');
			colorButton.setAttribute('data-color', i);
			colorButton.innerHTML = '<i class="fa fa-square"></i>';
			colorButton.style.color = colors[i].color;
			colorButton.addEventListener('click', function (e) {
				var element = e.target;
				while (!element.hasAttribute('data-color')) {
					element = element.parentElement;
				}
				colorIndex(parseInt(element.getAttribute('data-color')));
			});
			colorButton.addEventListener('touchstart', function (e) {
				var element = e.target;
				while (!element.hasAttribute('data-color')) {
					element = element.parentElement;
				}
				colorIndex(parseInt(element.getAttribute('data-color')));
			});
			list.appendChild(colorButton);
		}
		palette.appendChild(list);
		return palette;
	};

	function switchBoard(boardIdx) {
		selectBoard(boardIdx, true);
		// broadcast
		var message = new CustomEvent(messageType);
		message.content = {
			sender: 'chalkboard-plugin',
			type: 'selectboard',
			timestamp: Date.now() - slideStart,
			mode,
			board
		};
		document.dispatchEvent(message);
	}

	function setupDrawingCanvas(id) {
		var container = document.createElement('div');
		container.id = drawingCanvas[id].id;
		container.classList.add('overlay');
		container.setAttribute('data-prevent-swipe', 'true');
		container.oncontextmenu = function () {
			return false;
		}


		var revealDiv = document.querySelector('.reveal');
		


		drawingCanvas[id].width = revealDiv.clientWidth;
		drawingCanvas[id].height = revealDiv.clientHeight;
		drawingCanvas[id].scale = 1;
		drawingCanvas[id].xOffset = revealDiv.offsetLeft;
		drawingCanvas[id].yOffset = revealDiv.offsetTop;

		//	drawingCanvas[ id ].width = window.innerWidth;
		//	drawingCanvas[ id ].height = window.innerHeight;
		//	drawingCanvas[ id ].scale = 1;
		//	drawingCanvas[ id ].xOffset = 0;
		//	drawingCanvas[ id ].yOffset = 0;

		if (id == "0") {
			container.style.background = 'rgba(0,0,0,0)';
			container.style.zIndex = 24;
			container.style.opacity = 1;
			container.style.visibility = 'visible';
			container.style.pointerEvents = 'none';

			var slides = document.querySelector('.slides');
			var aspectRatio = Reveal.getConfig().width / Reveal.getConfig().height;
			if (drawingCanvas[id].width > drawingCanvas[id].height * aspectRatio) {
				drawingCanvas[id].xOffset = (drawingCanvas[id].width - drawingCanvas[id].height * aspectRatio) / 2 - revealDiv.offsetLeft;
			} else if (drawingCanvas[id].height > drawingCanvas[id].width / aspectRatio) {
				drawingCanvas[id].yOffset = (drawingCanvas[id].height - drawingCanvas[id].width / aspectRatio) / 2 - revealDiv.offsetTop;
			}

			if (colorButtons) {
				var palette = createPalette(boardmarkers, colorButtons,id);
				palette.style.visibility = 'hidden'; // only show palette in drawing mode
				palette.style.display = 'none';
			//	container.appendChild(palette);
			}
		} else {
			container.style.background = 'url("' + background[id] + '") repeat';
			container.style.zIndex = 26;
			container.style.opacity = 0;
			container.style.visibility = 'hidden';

			if (colorButtons) {
				var palette = createPalette(chalks, colorButtons,id);
			//	container.appendChild(palette);
			palette.style.visibility='hidden'
			palette.style.display='block'
			}
			if (boardHandle) {
				var handle = document.createElement('div');
				handle.classList.add('boardhandle');
				handle.innerHTML = '<ul><li><a id="previousboard" href="#" title="Previous board"><i class="fas fa-chevron-up"></i></a></li><li><a id="nextboard" href="#" title="Next board"><i class="fas fa-chevron-down"></i></a></li></ul>';
				handle.querySelector('#previousboard').addEventListener('click', function (e) {
					e.preventDefault();
					switchBoard(board - 1);
				});
				handle.querySelector('#nextboard').addEventListener('click', function (e) {
					e.preventDefault();
					switchBoard(board + 1);
				});
				handle.querySelector('#previousboard').addEventListener('touchstart', function (e) {
					e.preventDefault();
					switchBoard(board - 1);
				});
				handle.querySelector('#nextboard').addEventListener('touchstart', function (e) {
					e.preventDefault();
					switchBoard(board + 1);
				});

				container.appendChild(handle);
			}
		}


		var sponge = document.createElement('img');
		sponge.src = "data:image/png;base64,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"
		sponge.id = 'sponge';
		sponge.style.visibility = 'visible';
		sponge.style.position = 'absolute';
		container.appendChild(sponge);
		drawingCanvas[id].sponge = sponge;

		var canvas = document.createElement('canvas');
		canvas.width = drawingCanvas[id].width;
		canvas.height = drawingCanvas[id].height;
		canvas.setAttribute('data-chalkboard', id);
		//	canvas.style.cursor = pens[ id ][ color[ id ] ].cursor;
		$('canvas').awesomeCursor('pencil', { flip: 'vertical', color: pens[id][color[id]].color });

		container.appendChild(canvas);
		drawingCanvas[id].canvas = canvas;

		drawingCanvas[id].context = canvas.getContext('2d');

		setupCanvasEvents(container);

		document.querySelector('.reveal').appendChild(container);
		drawingCanvas[id].container = container;
	}


	/*****************************************************************
	 ** Storage
	 ******************************************************************/

	var storage = [{
		width: Reveal.getConfig().width,
		height: Reveal.getConfig().height,
		data: []
	},
	{
		width: Reveal.getConfig().width,
		height: Reveal.getConfig().height,
		data: []
	}
	];

	var loaded = null;

	if (config.storage) {
		// Get chalkboard drawings from session storage
		loaded = initStorage(sessionStorage.getItem(config.storage));
	}

	if (!loaded && config.src != null) {
		// Get chalkboard drawings from the given file
		loadData(config.src);
	}

	/**
	 * Initialize storage.
	 */
	function initStorage(json) {
		var revealDiv = document.querySelector('.reveal');
		var success = false;
		try {
			var data = JSON.parse(json);
			for (var id = 0; id < data.length; id++) {
				if (drawingCanvas[id].width != data[id].width || drawingCanvas[id].height != data[id].height) {
					drawingCanvas[id].scale = Math.min(drawingCanvas[id].width / data[id].width, drawingCanvas[id].height / data[id].height);
					drawingCanvas[id].xOffset = (drawingCanvas[id].width - data[id].width * drawingCanvas[id].scale) / 2;
					drawingCanvas[id].yOffset = (drawingCanvas[id].height - data[id].height * drawingCanvas[id].scale) / 2;
				}
				if (config.readOnly) {
					drawingCanvas[id].container.style.cursor = 'default';
					drawingCanvas[id].canvas.style.cursor = 'default';
				}
			}
			success = true;
			storage = data;
		} catch (err) {
			console.warn("Cannot initialise storage!");
		}
		return success;
	}


	/**
	 * Load data.
	 */
	function loadData(filename) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			if (xhr.readyState === 4 && xhr.status != 404) {
				loaded = initStorage(xhr.responseText);
				updateStorage();
				console.log("Drawings loaded from file");
			} else {
				config.readOnly = undefined;
				readOnly = undefined;
				console.warn('Failed to get file ' + filename + '. ReadyState: ' + xhr.readyState + ', Status: ' + xhr.status);
				loaded = false;
			}
		};

		xhr.open('GET', filename, true);
		try {
			xhr.send();
		} catch (error) {
			config.readOnly = undefined;
			readOnly = undefined;
			console.warn('Failed to get file ' + filename + '. Make sure that the presentation and the file are served by a HTTP server and the file can be found there. ' + error);
			loaded = false;
		}
	}


	function storageChanged(now) {
		if (!now) {
			// create or update timer
			if (updateStorageTimeout) {
				clearTimeout(updateStorageTimeout);
			}
			updateStorageTimeout = setTimeout(storageChanged, 1000, true);
		}
		else {
			// console.log("Update storage", updateStorageTimeout,  Date.now());
			updateStorage();
			updateStorageTimeout = null;
		}
	}

	function updateStorage() {
		var json = JSON.stringify(storage)
		if (config.storage) {
			sessionStorage.setItem(config.storage, json)
		}
		return json;
	}

	function recordEvent(event) {
		//	console.log(event);
		event.time = Date.now() - slideStart;
		if (mode == 1) event.board = board;
		var slideData = getSlideData();
		var i = slideData.events.length;
		while (i > 0 && event.time < slideData.events[i - 1].time) {
			i--;
		}
		slideData.events.splice(i, 0, event);
		slideData.duration = Math.max(slideData.duration, Date.now() - slideStart) + 1;

		storageChanged();
	}

	/**
	 * Get data as json string.
	 */
	function getData() {
		// cleanup slide data without events
		for (var id = 0; id < 2; id++) {
			for (var i = storage[id].data.length - 1; i >= 0; i--) {
				if (storage[id].data[i].events.length == 0) {
					storage[id].data.splice(i, 1);
				}
			}
		}

		return updateStorage();
	}

	/**
	 * Download data.
	 */
	function downloadData() {
		var a = document.createElement('a');
		document.body.appendChild(a);
		try {
			a.download = 'chalkboard.json';
			var blob = new Blob([getData()], {
				type: 'application/json'
			});
			a.href = window.URL.createObjectURL(blob);
		} catch (error) {
			// https://stackoverflow.com/a/6234804
			// escape data for proper handling of quotes and line breaks
			// in case malicious gets a chance to craft the exception message
			error = String(error).replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");

			a.innerHTML += ' (' + error + ')';
		}
		a.click();
		document.body.removeChild(a);
	}

	/**
	 * Returns data object for the slide with the given indices, including events from all fragments before and up to the current one.
	 */

	function getSlideDataRange(indices, id, timeInterval) {
		if (id == undefined) id = mode;
		if (!indices) indices = slideIndices;
	
		var beforeEvents = storage[id].data
			.filter(item => 
				item.slide.h === indices.h && 
				item.slide.v === indices.v && 
				item.slide.f >= -1 && item.slide.f <= indices.f
				)
			.reduce((acc, item) => acc.concat(item.events.filter(event =>  event.time < timeInterval)), []);
		var eraseEvents = storage[id].data
		.filter(item => 
			item.slide.h === indices.h && 
			item.slide.v === indices.v 
			)
		.reduce((acc, item) => acc.concat(item.events.filter(event =>  event.time < timeInterval&&event.type==='erase')), []);
	
		var combinedEvents = Array.from(new Set(beforeEvents.concat(eraseEvents)));

		var data = storage[id].data.find(item => 
			item.slide.h === indices.h && 
			item.slide.v === indices.v && 
			item.slide.f === indices.f
		);
	
		if (data) {
			data = {...data, events: combinedEvents};
		} else {
			var page = Number(Reveal.getCurrentSlide().getAttribute('data-pdf-page-number'));
			//console.log( indices, Reveal.getCurrentSlide() );
			storage[id].data.push({
				slide: indices,
				page,
				events: [],
				duration: 0
			});
			data = storage[id].data[storage[id].data.length - 1];
			data = {...data, events: combinedEvents};
		}
	
		return data;
	}


	/**
	 * Returns data object for the slide with the given indices.
	 */



	function getSlideData(indices, id) {
		if (id == undefined) id = mode;
		if (!indices) indices = slideIndices;
		var data;
		for (var i = 0; i < storage[id].data.length; i++) {
			//console.log(indices)

			if (storage[id].data[i].slide.h === indices.h && storage[id].data[i].slide.v === indices.v && storage[id].data[i].slide.f === indices.f) {
				data = storage[id].data[i];
				return data;
			}
		}
		var page = Number(Reveal.getCurrentSlide().getAttribute('data-pdf-page-number'));
		//console.log( indices, Reveal.getCurrentSlide() );
		storage[id].data.push({
			slide: indices,
			page,
			events: [],
			duration: 0
		});
		data = storage[id].data[storage[id].data.length - 1];
		return data;
	}

	/**
	 * Returns maximum duration of slide playback for both modes
	 */
	function getSlideDuration(indices) {
		if (!indices) indices = slideIndices;
		var duration = 0;
		for (var id = 0; id < 2; id++) {
			for (var i = 0; i < storage[id].data.length; i++) {
				if (storage[id].data[i].slide.h === indices.h && storage[id].data[i].slide.v === indices.v && storage[id].data[i].slide.f === indices.f) {
					duration = Math.max(duration, storage[id].data[i].duration);
					break;
				}
			}
		}
		//console.log( duration );
		return duration;
	}

	/*****************************************************************
	 ** Print
	 ******************************************************************/
	var printMode = (/print-pdf/gi).test(window.location.search);
	//console.log("createPrintout" + printMode)

	function addPageNumbers() {
		// determine page number for printouts with fragments serialised
		var slides = Reveal.getSlides();
		var page = 0;
		for (var i = 0; i < slides.length; i++) {
			slides[i].setAttribute('data-pdf-page-number', page.toString());
			// add number of fragments without fragment indices
			var count = slides[i].querySelectorAll('.fragment:not([data-fragment-index])').length;
			var fragments = slides[i].querySelectorAll('.fragment[data-fragment-index]');
			for (var j = 0; j < fragments.length; j++) {
				// increasenumber of fragments by highest fragment index (which start at 0)
				if (Number(fragments[j].getAttribute('data-fragment-index')) + 1 > count) {
					count = Number(fragments[j].getAttribute('data-fragment-index')) + 1;
				}
			}
			//console.log(count,fragments.length,( slides[i].querySelector('h1,h2,h3,h4')||{}).innerHTML, page); 
			page += count + 1;
		}
	}

	function createPrintout() {
		//console.warn(Reveal.getTotalSlides(),Reveal.getSlidesElement());
		if (storage[1].data.length == 0) return;
		console.log('Create printout(s) for ' + storage[1].data.length + " slides");
		drawingCanvas[0].container.style.opacity = 0; // do not print notes canvas
		drawingCanvas[0].container.style.visibility = 'hidden';

		var patImg = new Image();
		patImg.onload = function () {
			var slides = Reveal.getSlides();
			//console.log(slides);
			for (var i = storage[1].data.length - 1; i >= 0; i--) {
				console.log('Create printout for slide ' + storage[1].data[i].slide.h + '.' + storage[1].data[i].slide.v);
				var slideData = getSlideData(storage[1].data[i].slide, 1);
				var drawings = createDrawings(slideData, patImg);
				//console.log("Page:", storage[ 1 ].data[ i ].page );
				//console.log("Slide:", slides[storage[ 1 ].data[ i ].page] );
				addDrawings(slides[storage[1].data[i].page], drawings);

			}
			//			Reveal.sync();
		};
		patImg.src = background[1];
	}


	function cloneCanvas(oldCanvas) {
		//create a new canvas
		var newCanvas = document.createElement('canvas');
		var context = newCanvas.getContext('2d');
		//set dimensions
		newCanvas.width = oldCanvas.width;
		newCanvas.height = oldCanvas.height;
		//apply the old canvas to the new one
		context.drawImage(oldCanvas, 0, 0);
		//return the new canvas
		return newCanvas;
	}

	function getCanvas(template, container, board) {
		var idx = container.findIndex(element => element.board === board);
		if (idx === -1) {
			var canvas = cloneCanvas(template);
			if (!container.length) {
				idx = 0;
				container.push({
					board,
					canvas
				});
			} else if (board < container[0].board) {
				idx = 0;
				container.unshift({
					board,
					canvas
				});
			} else if (board > container[container.length - 1].board) {
				idx = container.length;
				container.push({
					board,
					canvas
				});
			}
		}

		return container[idx].canvas;
	}

	function createDrawings(slideData, patImg) {
		var width = Reveal.getConfig().width;
		var height = Reveal.getConfig().height;
		var revealDiv = document.querySelector('.reveal');
		var scale = 1;
		var xOffset = 0;
		var yOffset = 0;
		if (width != storage[1].width || height != storage[1].height) {
			scale = Math.min(width / storage[1].width, height / storage[1].height);
			xOffset = (width - storage[1].width * scale) / 2;
			yOffset = (height - storage[1].height * scale) / 2;
		}
		mode = 1;
		board = 0;
		//		console.log( 'Create printout(s) for slide ', slideData );

		var drawings = [];
		var template = document.createElement('canvas');
		template.width = width;
		template.height = height;

		var imgCtx = template.getContext('2d');
		imgCtx.fillStyle = imgCtx.createPattern(patImg, 'repeat');
		imgCtx.rect(0, 0, width, height);
		imgCtx.fill();

		for (var j = 0; j < slideData.events.length; j++) {
			switch (slideData.events[j].type) {
				case 'draw':
					draw[1](getCanvas(template, drawings, board).getContext('2d'),
						xOffset + slideData.events[j].x1 * scale,
						yOffset + slideData.events[j].y1 * scale,
						xOffset + slideData.events[j].x2 * scale,
						yOffset + slideData.events[j].y2 * scale,
						yOffset + slideData.events[j].color
					);
					break;
				case 'erase':
					eraseWithSponge(getCanvas(template, drawings, board).getContext('2d'),
						xOffset + slideData.events[j].x * scale,
						yOffset + slideData.events[j].y * scale
					);
					break;
				case 'selectboard':
					selectBoard(slideData.events[j].board);
					break;
				case 'clear':
					getCanvas(template, drawings, board).getContext('2d').clearRect(0, 0, width, height);
					getCanvas(template, drawings, board).getContext('2d').fill();
					break;
				default:
					break;
			}
		}

		drawings = drawings.sort((a, b) => a.board > b.board && 1 || -1);

		mode = 0;

		return drawings;
	}

	function addDrawings(slide, drawings) {
		var parent = slide.parentElement.parentElement;
		var nextSlide = slide.parentElement.nextElementSibling;

		for (var i = 0; i < drawings.length; i++) {
			var newPDFPage = document.createElement('div');
			newPDFPage.classList.add('pdf-page');
			newPDFPage.style.height = Reveal.getConfig().height;
			newPDFPage.append(drawings[i].canvas);
			//console.log("Add drawing", newPDFPage);
			if (nextSlide != null) {
				parent.insertBefore(newPDFPage, nextSlide);
			} else {
				parent.append(newPDFPage);
			}
		}
	}

	/*****************************************************************
	 ** Drawings
	 ******************************************************************/

	function drawWithBoardmarker(context, fromX, fromY, toX, toY, colorIdx) {
		if (colorIdx == undefined) colorIdx = color[mode];
		context.lineWidth = boardmarkerWidth;
		context.lineCap = 'round';
		context.strokeStyle = boardmarkers[colorIdx].color;
		context.beginPath();
		context.moveTo(fromX, fromY);
		context.lineTo(toX, toY);
		context.stroke();
	}

	function drawWithChalk(context, fromX, fromY, toX, toY, colorIdx) {
		if (colorIdx == undefined) colorIdx = color[mode];
		var brushDiameter = chalkWidth;
		context.lineWidth = brushDiameter;
		context.lineCap = 'round';
		context.fillStyle = chalks[colorIdx].color; // 'rgba(255,255,255,0.5)';
		context.strokeStyle = chalks[colorIdx].color;
		/*var opacity = Math.min(0.8, Math.max(0,color[1].replace(/^.*,(.+)\)/,'$1') - 0.1)) + Math.random()*0.2;*/
		var opacity = 1.0;
		context.strokeStyle = context.strokeStyle.replace(/[\d\.]+\)$/g, opacity + ')');
		context.beginPath();
		context.moveTo(fromX, fromY);
		context.lineTo(toX, toY);
		context.stroke();
		// Chalk Effect
		var length = Math.round(Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)) / (5 / brushDiameter));
		var xUnit = (toX - fromX) / length;
		var yUnit = (toY - fromY) / length;
		for (var i = 0; i < length; i++) {
			if (chalkEffect > (Math.random() * 0.9)) {
				var xCurrent = fromX + (i * xUnit);
				var yCurrent = fromY + (i * yUnit);
				var xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
				var yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
				context.clearRect(xRandom, yRandom, Math.random() * 2 + 2, Math.random() + 1);
			}
		}
	}

	function eraseWithSponge(context, x, y) {
		context.save();
		context.beginPath();
		context.arc(x, y, eraser.radius, 0, 2 * Math.PI, false);
		context.clip();
		context.clearRect(x - eraser.radius - 1, y - eraser.radius - 1, eraser.radius * 2 + 2, eraser.radius * 2 + 2);
		context.restore();
		if (mode == 1 && grid) {
			redrawGrid(x, y, eraser.radius);
		}
	}


	/**
	 * Show an overlay for the chalkboard.
	 */
	function showChalkboard() {
		//console.log("showChalkboard");
		clearTimeout(touchTimeout);
		touchTimeout = null;
		drawingCanvas[0].sponge.style.visibility = 'hidden'; // make sure that the sponge from touch events is hidden
		drawingCanvas[1].sponge.style.visibility = 'hidden'; // make sure that the sponge from touch events is hidden
		drawingCanvas[1].container.style.opacity = 1;
		drawingCanvas[1].container.style.visibility = 'visible';
		mode = 1;
	}


	/**
	 * Closes open chalkboard.
	 */
	function closeChalkboard() {
		clearTimeout(touchTimeout);
		touchTimeout = null;
		drawingCanvas[0].sponge.style.visibility = 'hidden'; // make sure that the sponge from touch events is hidden
		drawingCanvas[1].sponge.style.visibility = 'hidden'; // make sure that the sponge from touch events is hidden
		drawingCanvas[1].container.style.opacity = 0;
		drawingCanvas[1].container.style.visibility = 'hidden';
		lastX = null;
		lastY = null;
		mode = 0;
	}

	/**
	 * Clear current canvas.
	 */
	function clearCanvas(id) {
		if (id == 0) clearTimeout(slidechangeTimeout);
		drawingCanvas[id].context.clearRect(0, 0, drawingCanvas[id].width, drawingCanvas[id].height);
		if (id == 1 && grid) drawGrid();
	}

	/**
	 * Draw grid on background
	 */
	function drawGrid() {
		var revealDiv = document.querySelector('.reveal');
		var context = drawingCanvas[1].context;

		drawingCanvas[1].scale = Math.min(drawingCanvas[1].width / storage[1].width, drawingCanvas[1].height / storage[1].height);
		drawingCanvas[1].xOffset = (drawingCanvas[1].width - storage[1].width * drawingCanvas[1].scale) / 2;
		drawingCanvas[1].yOffset = (drawingCanvas[1].height - storage[1].height * drawingCanvas[1].scale) / 2;

		var scale = drawingCanvas[1].scale;
		var xOffset = drawingCanvas[1].xOffset;
		var yOffset = drawingCanvas[1].yOffset;

		var distance = grid.distance * scale;

		var fromX = drawingCanvas[1].width / 2 - distance / 2 - Math.floor((drawingCanvas[1].width - distance) / 2 / distance) * distance;
		for (var x = fromX; x < drawingCanvas[1].width; x += distance) {
			context.beginPath();
			context.lineWidth = grid.width * scale;
			context.lineCap = 'round';
			context.fillStyle = grid.color;
			context.strokeStyle = grid.color;
			context.moveTo(x, 0);
			context.lineTo(x, drawingCanvas[1].height);
			context.stroke();
		}
		var fromY = drawingCanvas[1].height / 2 - distance / 2 - Math.floor((drawingCanvas[1].height - distance) / 2 / distance) * distance;

		for (var y = fromY; y < drawingCanvas[1].height; y += distance) {
			context.beginPath();
			context.lineWidth = grid.width * scale;
			context.lineCap = 'round';
			context.fillStyle = grid.color;
			context.strokeStyle = grid.color;
			context.moveTo(0, y);
			context.lineTo(drawingCanvas[1].width, y);
			context.stroke();
		}
	}

	function redrawGrid(centerX, centerY, diameter) {
		var context = drawingCanvas[1].context;
		var revealDiv = document.querySelector('.reveal');
		drawingCanvas[1].scale = Math.min(drawingCanvas[1].width / storage[1].width, drawingCanvas[1].height / storage[1].height);
		drawingCanvas[1].xOffset = (drawingCanvas[1].width - storage[1].width * drawingCanvas[1].scale) / 2;
		drawingCanvas[1].yOffset = (drawingCanvas[1].height - storage[1].height * drawingCanvas[1].scale) / 2;

		var scale = drawingCanvas[1].scale;
		var xOffset = drawingCanvas[1].xOffset;
		var yOffset = drawingCanvas[1].yOffset;

		var distance = grid.distance * scale;

		var fromX = drawingCanvas[1].width / 2 - distance / 2 - Math.floor((drawingCanvas[1].width - distance) / 2 / distance) * distance;

		for (var x = fromX + distance * Math.ceil((centerX - diameter - fromX) / distance); x <= fromX + distance * Math.floor((centerX + diameter - fromX) / distance); x += distance) {
			context.beginPath();
			context.lineWidth = grid.width * scale;
			context.lineCap = 'round';
			context.fillStyle = grid.color;
			context.strokeStyle = grid.color;
			context.moveTo(x, centerY - Math.sqrt(diameter * diameter - (centerX - x) * (centerX - x)));
			context.lineTo(x, centerY + Math.sqrt(diameter * diameter - (centerX - x) * (centerX - x)));
			context.stroke();
		}
		var fromY = drawingCanvas[1].height / 2 - distance / 2 - Math.floor((drawingCanvas[1].height - distance) / 2 / distance) * distance;
		for (var y = fromY + distance * Math.ceil((centerY - diameter - fromY) / distance); y <= fromY + distance * Math.floor((centerY + diameter - fromY) / distance); y += distance) {
			context.beginPath();
			context.lineWidth = grid.width * scale;
			context.lineCap = 'round';
			context.fillStyle = grid.color;
			context.strokeStyle = grid.color;
			context.moveTo(centerX - Math.sqrt(diameter * diameter - (centerY - y) * (centerY - y)), y);
			context.lineTo(centerX + Math.sqrt(diameter * diameter - (centerY - y) * (centerY - y)), y);
			context.stroke();
		}
	}

	/**
	 * Set the  color
	 */
	function setColor(index, record) {
		// protect against out of bounds (this could happen when
		// replaying events recorded with different color settings).
		if (index >= pens[mode].length) index = 0;
		color[mode] = index;
		//	drawingCanvas[ mode ].canvas.style.cursor = pens[ mode ][ color[ mode ] ].cursor;
		if (index == 7){
			$('canvas').awesomeCursor('eraser', { color: 'rgba(0,0,0,0.5)' });
		} else {
		$('canvas').awesomeCursor('pencil', { flip: 'vertical', color: pens[mode][color[mode]].color });
	}
	}

	/**
	 * Set the  board
	 */
	function selectBoard(boardIdx, record) {
		//console.log("Set board",boardIdx);
		if (board == boardIdx) return;

		board = boardIdx;
		redrawChalkboard(boardIdx);
		if (record) {
			recordEvent({ type: 'selectboard' });
		}
	}

	function redrawChalkboard(boardIdx) {
		clearCanvas(1);
		let timeInterval = Date.now() - slideStart
		var slideData = getSlideDataRange(slideIndices,boardIdx,timeInterval)
		slideData.events.sort((a, b) => (a.type === 'erase') - (b.type === 'erase'));

		slideData.events.forEach(thisEvent => {
			playEvent(boardIdx,thisEvent, timeInterval);
		});
	}


	/**
	 * Forward cycle color
	 */
	function cycleColorNext() {
		color[mode] = (color[mode] + 1) % pens[mode].length;
		return color[mode];
	}

	/**
	 * Backward cycle color
	 */
	function cycleColorPrev() {
		color[mode] = (color[mode] + (pens[mode].length - 1)) % pens[mode].length;
		return color[mode];
	}

	/*****************************************************************
	 ** Broadcast
	 ******************************************************************/

	var eventQueue = [];

	document.addEventListener('received', function (message) {
		if (message.content && message.content.sender == 'chalkboard-plugin') {
			// add message to queue
			eventQueue.push(message);
			console.log(JSON.stringify(message));
		}
		if (eventQueue.length == 1) processQueue();
	});

	function processQueue() {
		// take first message from queue
		var message = eventQueue.shift();

		// synchronize time with seminar host
		slideStart = Date.now() - message.content.timestamp;
		// set status
		if (mode < message.content.mode) {
			// open chalkboard
			showChalkboard();
		} else if (mode > message.content.mode) {
			// close chalkboard
			closeChalkboard();
		}
		if (board != message.content.board) {
			board = message.content.board;
			redrawChalkboard(board);
		};

		switch (message.content.type) {
			case 'showChalkboard':
				showChalkboard();
				break;
			case 'closeChalkboard':
				closeChalkboard();
				break;
			case 'erase':
				erasePoint(message.content.x, message.content.y);
				break;
			case 'draw':
				drawSegment(message.content.fromX, message.content.fromY, message.content.toX, message.content.toY, message.content.color);
				break;
			case 'clear':
				clearSlide();
				break;
			case 'selectboard':
				selectBoard(message.content.board, true);
				break;
			case 'resetSlide':
				resetSlideDrawings();
				break;
			case 'init':
				storage = message.content.storage;
				var revealDiv = document.querySelector('.reveal');
				for (var id = 0; id < 2; id++) {
					drawingCanvas[id].scale = Math.min(drawingCanvas[id].width / storage[id].width, drawingCanvas[id].height / storage[id].height);
					drawingCanvas[id].xOffset = (drawingCanvas[id].width - storage[id].width * drawingCanvas[id].scale) / 2;
					drawingCanvas[id].yOffset = (drawingCanvas[id].height - storage[id].height * drawingCanvas[id].scale) / 2;
				}
				clearCanvas(0);
				clearCanvas(1);
				if (!playback) {
					slidechangeTimeout = setTimeout(startPlayback, transition, getSlideDuration(), 0);
				}
				if (mode == 1 && message.content.mode == 0) {
					setTimeout(closeChalkboard, transition + 50);
				}
				if (mode == 0 && message.content.mode == 1) {
					setTimeout(showChalkboard, transition + 50);
				}
				mode = message.content.mode;
				board = message.content.board;
				break;
			default:
				break;
		}

		// continue with next message if queued
		if (eventQueue.length > 0) {
			processQueue();
		} else {
			storageChanged();
		}
	}

	document.addEventListener('welcome', function (user) {
		// broadcast storage
		var message = new CustomEvent(messageType);
		message.content = {
			sender: 'chalkboard-plugin',
			recipient: user.id,
			type: 'init',
			timestamp: Date.now() - slideStart,
			storage: storage,
			mode,
			board
		};
		document.dispatchEvent(message);
	});

	/*****************************************************************
	 ** Playback
	 ******************************************************************/

	document.addEventListener('seekplayback', function (event) {
		//console.log('event seekplayback ' + event.timestamp);
		stopPlayback();
		if (!playback || event.timestamp == 0) {
			// in other cases startplayback fires after seeked
			startPlayback(event.timestamp);
		}
		//console.log('seeked');
	});


	document.addEventListener('startplayback', function (event) {
		//console.log('event startplayback ' + event.timestamp);
		stopPlayback();
		playback = true;
		startPlayback(event.timestamp);
	});

	document.addEventListener('stopplayback', function (event) {
		//console.log('event stopplayback ' + (Date.now() - slideStart) );
		playback = false;
		stopPlayback();
	});

	document.addEventListener('startrecording', function (event) {
		//console.log('event startrecording ' + event.timestamp);
		startRecording();
	});


	function startRecording() {
		resetSlide(true);
		slideStart = Date.now();
	}

	function startPlayback(timestamp, finalMode) {
		//console.log("playback " + timestamp );
		slideStart = Date.now() - timestamp;
		closeChalkboard();
		mode = 0;
		board = 0;
		for (var id = 0; id < 2; id++) {
			clearCanvas(id);

	
		var slideData = getSlideDataRange(slideIndices,id,slideStart);
	
		slideData.events.forEach(thisEvent => {
			playEvent(id,thisEvent, timestamp);
	//	timeouts[id].push(setTimeout(playEvent,0, id, thisEvent, timestamp));
		});

			
		//console.log("Mode: " + finalMode + "/" + mode );
		if (finalMode != undefined) {
			mode = finalMode;
		}
		if (mode == 1) showChalkboard();
		//console.log("playback (ok)");
	}
	};

	function stopPlayback() {
		//console.log("stopPlayback");
		//console.log("Timeouts: " + timeouts[0].length + "/"+ timeouts[1].length);
		for (var id = 0; id < 2; id++) {
			for (var i = 0; i < timeouts[id].length; i++) {
				clearTimeout(timeouts[id][i]);
			}
			timeouts[id] = [];
		}
	};

	function playEvent(id, event, timestamp) {
		//console.log( timestamp +" / " + JSON.stringify(event));
		//console.log( id + ": " + timestamp +" / " +  event.time +" / " + event.type +" / " + mode );
		switch (event.type) {
			case 'open':
				if (timestamp <= event.time) {
					showChalkboard();
				} else {
					mode = 1;
				}

				break;
			case 'close':
				if (timestamp < event.time) {
					closeChalkboard();
				} else {
					mode = 0;
				}
				break;
			case 'clear':
				clearCanvas(id);
				break;
			case 'selectboard':
				selectBoard(event.board);
				break;
			case 'draw':
				drawLine(id, event, timestamp);
				break;
			case 'erase':
				eraseCircle(id, event, timestamp);
				break;
		}
	};

	function drawLine(id, event, timestamp) {
		var ctx = drawingCanvas[id].context;
		var scale = drawingCanvas[id].scale;
		var xOffset = drawingCanvas[id].xOffset;
		var yOffset = drawingCanvas[id].yOffset;
		draw[id](ctx, xOffset + event.x1 * scale, yOffset + event.y1 * scale, xOffset + event.x2 * scale, yOffset + event.y2 * scale, event.color);
	};

	function eraseCircle(id, event, timestamp) {
		var ctx = drawingCanvas[id].context;
		var scale = drawingCanvas[id].scale;
		var xOffset = drawingCanvas[id].xOffset;
		var yOffset = drawingCanvas[id].yOffset;

		eraseWithSponge(ctx, xOffset + event.x * scale, yOffset + event.y * scale);
	};

	function startErasing(x, y) {
		drawing = false;
		erasing = true;
		drawingCanvas[mode].sponge.style.visibility = 'visible';
		erasePoint(x, y);
	}

	function erasePoint(x, y) {
		var ctx = drawingCanvas[mode].context;
		var scale = drawingCanvas[mode].scale;
		var xOffset = drawingCanvas[mode].xOffset;
		var yOffset = drawingCanvas[mode].yOffset;

		// move sponge image
		drawingCanvas[mode].sponge.style.left = (x * scale + xOffset - eraser.radius) + 'px';
		drawingCanvas[mode].sponge.style.top = (y * scale + yOffset - 2 * eraser.radius) + 'px';

		recordEvent({
			type: 'erase',
			x,
			y
		});

		if (
			x * scale + xOffset > 0 &&
			y * scale + yOffset > 0 &&
			x * scale + xOffset < drawingCanvas[mode].width &&
			y * scale + yOffset < drawingCanvas[mode].height
		) {
			eraseWithSponge(ctx, x * scale + xOffset, y * scale + yOffset);
		}
	}

	function stopErasing() {
		erasing = false;
		// hide sponge
		drawingCanvas[mode].sponge.style.visibility = 'hidden';
	}

	function startDrawing(x, y) {
		drawing = true;

		var ctx = drawingCanvas[mode].context;
		var scale = drawingCanvas[mode].scale;
		var xOffset = drawingCanvas[mode].xOffset;
		var yOffset = drawingCanvas[mode].yOffset;
		lastX = x * scale + xOffset;
		lastY = y * scale + yOffset;
	}

	function nonDrawSegment(xdiff) {
		the_x_diff = xdiff;
	}

	function saveInitial(xdown, ydown) {
		x_down = xdown;
		y_down = ydown;

	}

	function drawSegment(fromX, fromY, toX, toY, colorIdx) {
		var ctx = drawingCanvas[mode].context;
		var scale = drawingCanvas[mode].scale;
		var xOffset = drawingCanvas[mode].xOffset;
		var yOffset = drawingCanvas[mode].yOffset;

		recordEvent({
			type: 'draw',
			color: colorIdx,
			x1: fromX,
			y1: fromY,
			x2: toX,
			y2: toY
		});

		if (
			fromX * scale + xOffset > 0 &&
			fromY * scale + yOffset > 0 &&
			fromX * scale + xOffset < drawingCanvas[mode].width &&
			fromY * scale + yOffset < drawingCanvas[mode].height &&
			toX * scale + xOffset > 0 &&
			toY * scale + yOffset > 0 &&
			toX * scale + xOffset < drawingCanvas[mode].width &&
			toY * scale + yOffset < drawingCanvas[mode].height
		) {
			draw[mode](ctx, fromX * scale + xOffset, fromY * scale + yOffset, toX * scale + xOffset, toY * scale + yOffset, colorIdx);
		}
	}

	function stopDrawing() {
		drawing = false;
	}


	/*****************************************************************
	 ** User interface
	 ******************************************************************/

	function setupCanvasEvents(canvas) {
		var revealDiv = document.querySelector('.reveal');

		// TODO: check all touchevents
		canvas.addEventListener('touchstart', function (evt) {
			if (evt.touches[0].touchType === 'stylus') {
				evt.preventDefault();
			}
			//	console.log("Touch start");
			if (!readOnly && evt.target.getAttribute('data-chalkboard') == mode) {
				var scale = drawingCanvas[mode].scale;
				var xOffset = drawingCanvas[mode].xOffset;
				var yOffset = drawingCanvas[mode].yOffset;

				var touch = evt.touches[0];
				mouseX = touch.pageX - revealDiv.offsetLeft;
				mouseY = touch.pageY - revealDiv.offsetTop;
				saveInitial(mouseX, mouseY);
				if (color[mode] == 7) {
					startErasing((mouseX - xOffset) / scale, (mouseY - yOffset) / scale);
				} else {
				startDrawing((mouseX - xOffset) / scale, (mouseY - yOffset) / scale);
				touchTimeout = setTimeout(startErasing, 1000, (mouseX - xOffset) / scale, (mouseY - yOffset) / scale);
				}
			}
		}, passiveSupported ? {
			passive: false
		} : false);

		canvas.addEventListener('touchmove', function (evt) {
			if (evt.touches[0].touchType === 'stylus') {
				evt.preventDefault();
				//console.log("Touch move");
				var touch = evt.touches[0];
				if (((lastX - touch.pageX + revealDiv.offsetLeft) * (lastX - touch.pageX + revealDiv.offsetLeft) + (lastY - touch.pageY + revealDiv.offsetTop) * (lastY - touch.pageY + revealDiv.offsetTop)) > 50) {
					clearTimeout(touchTimeout);
					touchTimeout = null;
				}
				if (drawing || erasing) {
					var scale = drawingCanvas[mode].scale;
					var xOffset = drawingCanvas[mode].xOffset;
					var yOffset = drawingCanvas[mode].yOffset;


					mouseX = touch.pageX - revealDiv.offsetLeft;
					mouseY = touch.pageY - revealDiv.offsetTop;
					if (mouseY < drawingCanvas[mode].height && mouseX < drawingCanvas[mode].width) {
						// move sponge
						if (event.type == 'erase') {
							drawingCanvas[mode].sponge.style.left = (mouseX - eraser.radius) + 'px';
							drawingCanvas[mode].sponge.style.top = (mouseY - eraser.radius) + 'px';
						}
					}
				}

				if (drawing) {
					drawSegment((lastX - xOffset) / scale, (lastY - yOffset) / scale, (mouseX - xOffset) / scale, (mouseY - yOffset) / scale, color[mode]);
					// broadcast
					var message = new CustomEvent(messageType);
					message.content = {
						sender: 'chalkboard-plugin',
						type: 'draw',
						timestamp: Date.now() - slideStart,
						mode,
						board,
						fromX: (lastX - xOffset) / scale,
						fromY: (lastY - yOffset) / scale,
						toX: (mouseX - xOffset) / scale,
						toY: (mouseY - yOffset) / scale,
						color: color[mode]
					};
					document.dispatchEvent(message);

					lastX = mouseX;
					lastY = mouseY;
				} else {
					erasePoint((mouseX - xOffset) / scale, (mouseY - yOffset) / scale);
					// broadcast
					var message = new CustomEvent(messageType);
					message.content = {
						sender: 'chalkboard-plugin',
						type: 'erase',
						timestamp: Date.now() - slideStart,
						mode,
						board,
						x: (mouseX - xOffset) / scale,
						y: (mouseY - yOffset) / scale
					};
					document.dispatchEvent(message);

				}
				nonDrawSegment(0);
			} else {
				var touch = evt.touches[0];
				var xUp = touch.pageX - revealDiv.offsetTop;
				var yUp = touch.pageY - revealDiv.offsetTop;
				var xDiff = x_down - xUp;
				var yDiff = y_down - yUp;
				nonDrawSegment(xDiff);
				//		console.log(xDiff)
				//		console.log(yDiff)


			}
		}, false);


		canvas.addEventListener('touchend', function (evt) {
			evt.preventDefault();
			clearTimeout(touchTimeout);
			touchTimeout = null;
			// hide sponge image
			drawingCanvas[mode].sponge.style.visibility = 'hidden';
			stopDrawing();
			console.log(the_x_diff)
			if (the_x_diff > 150) {
				Reveal.next();
			} else if (the_x_diff < -150) {
				Reveal.prev();
			}
		}, false);


		canvas.addEventListener('swiped', function (e) {
			console.log(e.target); // the element that was swiped
			console.log(e.detail.dir); // swiped direction
		});

		canvas.addEventListener('mousedown', function (evt) {
			// this is the one that matters on the computer
			console.log(evt.touch)
			evt.preventDefault();
			if (!readOnly && evt.target.getAttribute('data-chalkboard') == mode) {
				//console.log( "mousedown: " + evt.button );
				var scale = drawingCanvas[mode].scale;
				var xOffset = drawingCanvas[mode].xOffset;
				var yOffset = drawingCanvas[mode].yOffset;

				mouseX = evt.pageX - revealDiv.offsetLeft;
				mouseY = evt.pageY - revealDiv.offsetTop;
				console.log(color[mode]);
				if (evt.button == 2 || evt.button == 1 || evt.shiftKey|| (color[mode] == 7)) {
					startErasing((mouseX - xOffset) / scale, (mouseY - yOffset) / scale);
					// broadcast
					var message = new CustomEvent(messageType);
					message.content = {
						sender: 'chalkboard-plugin',
						type: 'erase',
						timestamp: Date.now() - slideStart,
						mode,
						board,
						x: (mouseX - xOffset) / scale,
						y: (mouseY - yOffset) / scale
					};
					document.dispatchEvent(message);
				} else {
					startDrawing((mouseX - xOffset) / scale, (mouseY - yOffset) / scale);
				}
			}
		});

		canvas.addEventListener('mousemove', function (evt) {
			evt.preventDefault();
			//console.log("Mouse move");
			if (drawing || erasing) {
				var scale = drawingCanvas[mode].scale;
				var xOffset = drawingCanvas[mode].xOffset;
				var yOffset = drawingCanvas[mode].yOffset;

				mouseX = evt.pageX - revealDiv.offsetLeft;
				mouseY = evt.pageY - revealDiv.offsetTop;

				if (drawing) {
					drawSegment((lastX - xOffset) / scale, (lastY - yOffset) / scale, (mouseX - xOffset) / scale, (mouseY - yOffset) / scale, color[mode]);
					// broadcast
					var message = new CustomEvent(messageType);
					message.content = {
						sender: 'chalkboard-plugin',
						type: 'draw',
						timestamp: Date.now() - slideStart,
						mode,
						board,
						fromX: (lastX - xOffset) / scale,
						fromY: (lastY - yOffset) / scale,
						toX: (mouseX - xOffset) / scale,
						toY: (mouseY - yOffset) / scale,
						color: color[mode]
					};
					document.dispatchEvent(message);

					lastX = mouseX;
					lastY = mouseY;
				} else {
					erasePoint((mouseX - xOffset) / scale, (mouseY - yOffset) / scale);
					// broadcast
					var message = new CustomEvent(messageType);
					message.content = {
						sender: 'chalkboard-plugin',
						type: 'erase',
						timestamp: Date.now() - slideStart,
						mode,
						board,
						x: (mouseX - xOffset) / scale,
						y: (mouseY - yOffset) / scale
					};
					document.dispatchEvent(message);
				}

			}
		});


		canvas.addEventListener('mouseup', function (evt) {
			evt.preventDefault();
			//		drawingCanvas[ mode ].canvas.style.cursor = pens[ mode ][ color[ mode ] ].cursor;
			$('canvas').awesomeCursor('pencil', { flip: 'vertical', color: pens[mode][color[mode]].color });

			if (drawing || erasing) {
				stopDrawing();
				stopErasing();
			}
		});
	}

	function resize() {
		//console.log("resize");
		// Resize the canvas and draw everything again
		var timestamp = Date.now() - slideStart;
		if (!playback) {
			timestamp = getSlideDuration();
		}

		//console.log( drawingCanvas[0].scale + "/" + drawingCanvas[0].xOffset + "/" +drawingCanvas[0].yOffset );
		for (var id = 0; id < 2; id++) {
			drawingCanvas[id].width = window.innerWidth;
			drawingCanvas[id].height = window.innerHeight;
			drawingCanvas[id].canvas.width = drawingCanvas[id].width;
			drawingCanvas[id].canvas.height = drawingCanvas[id].height;
			drawingCanvas[id].context.canvas.width = drawingCanvas[id].width;
			drawingCanvas[id].context.canvas.height = drawingCanvas[id].height;

			drawingCanvas[id].scale = Math.min(drawingCanvas[id].width / storage[id].width, drawingCanvas[id].height / storage[id].height);
			drawingCanvas[id].xOffset = (drawingCanvas[id].width - storage[id].width * drawingCanvas[id].scale) / 2;
			drawingCanvas[id].yOffset = (drawingCanvas[id].height - storage[id].height * drawingCanvas[id].scale) / 2;
			//console.log( drawingCanvas[id].scale + "/" + drawingCanvas[id].xOffset + "/" +drawingCanvas[id].yOffset );
		}
		//console.log( window.innerWidth + "/" + window.innerHeight);
		startPlayback(timestamp, mode, true);
	}

	Reveal.addEventListener('pdf-ready', function (evt) {
		//		console.log( "Create printouts when ready" );
		whenLoaded(createPrintout);
	});

	Reveal.addEventListener('ready', function (evt) {
		//console.log('ready');
		if (!printMode) {
			window.addEventListener('resize', resize);

			slideStart = Date.now() - getSlideDuration();
			slideIndices = Reveal.getIndices();
			if (!playback) {
				startPlayback(getSlideDuration(), 0);
			}
			if (Reveal.isAutoSliding()) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent(event);
			}
			updateStorage();
			whenReady(addPageNumbers);
		}
	});
	Reveal.addEventListener('slidechanged', function (evt) {
		//		clearTimeout( slidechangeTimeout );
		console.log('slidechanged');
		if (!printMode) {
			slideStart = Date.now() - getSlideDuration();
			slideIndices = Reveal.getIndices();
			closeChalkboard();
			board = 0;
			clearCanvas(0);
			clearCanvas(1);
			if (!playback) {
				slidechangeTimeout = setTimeout(startPlayback, transition, getSlideDuration(), 0);
			}
			if (Reveal.isAutoSliding()) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent(event);
			}
		}
	});
	Reveal.addEventListener('fragmentshown', function (evt) {
		//		clearTimeout( slidechangeTimeout );
		console.log('fragmentshown');
		if (!printMode) {
			slideStart = Date.now() - getSlideDuration();
			slideIndices = Reveal.getIndices();
			closeChalkboard();
			board = 0;
			clearCanvas(0);
			clearCanvas(1);
			if (Reveal.isAutoSliding()) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent(event);
			} else if (!playback) {
				startPlayback(getSlideDuration(), 0);
				closeChalkboard();
			}
		}
	});
	Reveal.addEventListener('fragmenthidden', function (evt) {
		//		clearTimeout( slidechangeTimeout );
		//console.log('fragmenthidden');
		if (!printMode) {
			slideStart = Date.now() - getSlideDuration();
			slideIndices = Reveal.getIndices();
			closeChalkboard();
			board = 0;
			clearCanvas(0);
			clearCanvas(1);
			if (Reveal.isAutoSliding()) {
				document.dispatchEvent(new CustomEvent('stopplayback'));
			} else if (!playback) {
				startPlayback(getSlideDuration());
				closeChalkboard();
			}
		}
	});

	Reveal.addEventListener('autoslideresumed', function (evt) {
		//console.log('autoslideresumed');
		var event = new CustomEvent('startplayback');
		event.timestamp = 0;
		document.dispatchEvent(event);
	});
	Reveal.addEventListener('autoslidepaused', function (evt) {
		//console.log('autoslidepaused');
		document.dispatchEvent(new CustomEvent('stopplayback'));

		// advance to end of slide
		//		closeChalkboard();
		startPlayback(getSlideDuration(), 0);
	});

	function toggleNotesCanvas() {
		if (!readOnly) {
			if (mode == 1) {
				toggleChalkboard();
				notescanvas.style.background = background[0]; //'rgba(255,0,0,0.5)';
				notescanvas.style.pointerEvents = 'auto';
			}
			else {
				if (notescanvas.style.pointerEvents != 'none') {
					// hide notes canvas
					if (colorButtons) {
						document.querySelector('.palette.id0').style.visibility = 'hidden';
						document.querySelector('.palette.id0').style.display = 'none';
					}
					notescanvas.style.background = 'rgba(0,0,0,0)';
					notescanvas.style.pointerEvents = 'none';
				}
				else {
					// show notes canvas
					if (colorButtons) {
						document.querySelector('.palette.id0').style.visibility = 'visible';
						document.querySelector('.palette.id0').style.display = 'block';
					}
					notescanvas.style.background = background[0]; //'rgba(255,0,0,0.5)';
					notescanvas.style.pointerEvents = 'auto';

					var idx = 0;
					if (color[mode]) {
						idx = color[mode];
					}

					setColor(idx, true);
				}
			}
		}
	};

	function toggleChalkboard() {
		//console.log("toggleChalkboard " + mode);
		if (mode == 1) {
			if (!readOnly) {
				recordEvent({ type: 'close' });
			}
			closeChalkboard();

			// broadcast
			var message = new CustomEvent(messageType);
			message.content = {
				sender: 'chalkboard-plugin',
				type: 'closeChalkboard',
				timestamp: Date.now() - slideStart,
				mode: 0,
				board
			};
			document.dispatchEvent(message);


		} else {
			showChalkboard();
			if (!readOnly) {
				recordEvent({ type: 'open' });
				// broadcast
				var message = new CustomEvent(messageType);
				message.content = {
					sender: 'chalkboard-plugin',
					type: 'showChalkboard',
					timestamp: Date.now() - slideStart,
					mode: 1,
					board
				};
				document.dispatchEvent(message);

				var idx = 0;

				if (rememberColor[mode]) {
					idx = color[mode];
				}

				setColor(idx, true);
			}
		}
	};

	function clearSlide() {
		recordEvent({ type: 'clear' });
		clearCanvas(mode);
	}

	function clear() {
		if (!readOnly) {
			clearSlide();
			// broadcast
			var message = new CustomEvent(messageType);
			message.content = {
				sender: 'chalkboard-plugin',
				type: 'clear',
				timestamp: Date.now() - slideStart,
				mode,
				board
			};
			document.dispatchEvent(message);
		}
	};

	function colorIndex(idx) {
		if (!readOnly) {
			setColor(idx, true);
		}
	}

	function colorNext() {
		if (!readOnly) {
			let idx = cycleColorNext();
			setColor(idx, true);
		}
	}

	function colorPrev() {
		if (!readOnly) {
			let idx = cycleColorPrev();
			setColor(idx, true);
		}
	}

	function resetSlideDrawings() {
		slideStart = Date.now();
		closeChalkboard();

		clearCanvas(0);
		clearCanvas(1);

		mode = 1;
		var slideData = getSlideData();
		slideData.duration = 0;
		slideData.events = [];
		mode = 0;
		var slideData = getSlideData();
		slideData.duration = 0;
		slideData.events = [];

		updateStorage();
	}

	function resetSlide(force) {
		var ok = force || confirm("Please confirm to delete chalkboard drawings on this slide!");
		if (ok) {
			//console.log("resetSlide ");
			stopPlayback();
			resetSlideDrawings();
			// broadcast
			var message = new CustomEvent(messageType);
			message.content = {
				sender: 'chalkboard-plugin',
				type: 'resetSlide',
				timestamp: Date.now() - slideStart,
				mode,
				board
			};
			document.dispatchEvent(message);
		}
	};

	function resetStorage(force) {
		var ok = force || confirm("Please confirm to delete all chalkboard drawings!");
		if (ok) {
			stopPlayback();
			slideStart = Date.now();
			clearCanvas(0);
			clearCanvas(1);
			if (mode == 1) {
				closeChalkboard();
			}

			storage = [{
				width: Reveal.getConfig().width,
				height: Reveal.getConfig().height,
				data: []
			},
			{
				width: Reveal.getConfig().width,
				height: Reveal.getConfig().height,
				data: []
			}
			];

			if (config.storage) {
				sessionStorage.setItem(config.storage, null)
			}
			// broadcast
			var message = new CustomEvent(messageType);
			message.content = {
				sender: 'chalkboard-plugin',
				type: 'init',
				timestamp: Date.now() - slideStart,
				storage,
				mode,
				board
			};
			document.dispatchEvent(message);
		}
	};

	this.toggleNotesCanvas = toggleNotesCanvas;
	this.toggleChalkboard = toggleChalkboard;
	this.colorIndex = colorIndex;
	this.colorNext = colorNext;
	this.colorPrev = colorPrev;
	this.clear = clear;
	this.reset = resetSlide;
	this.resetAll = resetStorage;
	this.download = downloadData;
	this.updateStorage = updateStorage;
	this.getData = getData;
	this.configure = configure;


	for (var key in keyBindings) {
		if (keyBindings[key]) {
			Reveal.addKeyBinding(keyBindings[key], RevealTabletChalkboard[key]);
		}
	};

	return this;
};
