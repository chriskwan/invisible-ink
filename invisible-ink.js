(function () {
	var isDrawing = false;
	var pathToDraw = [];
	var colors = ["black", "red", "blue", "green"];
	var drawingArea = document.getElementById("drawingArea");
	var context = drawingArea.getContext("2d");

	var peer;

	initialize();

	function initialize() {
		setUpCanvasEvents();
		setUpUI();
		setUpPeer();
	}

	function setUpCanvasEvents(){
		drawingArea.onmousedown = function (event) {
			// Reset path
			pathToDraw = [];

			isDrawing = true;
		}

		drawingArea.onmousemove = function (event) {
			if (!isDrawing) {
				return;
			}

			var rect = drawingArea.getBoundingClientRect();
			var point = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};
			pathToDraw.push(point);
			drawPoint(point);
		}

		drawingArea.onmouseup = function (event) {
			//drawPath(pathToDraw);
			sendPathToPeers(pathToDraw);
			isDrawing = false;
		}
	}

	function sendPathToPeers(path) {
		for (var currentPeerId in peer.connections) {
			if (!peer.connections.hasOwnProperty(currentPeerId)) {
				return;
			}

			var connectionsWithCurrentPeer = peer.connections[currentPeerId];

			// It's possible to have multiple connections with the same peer,
			// so send on all of them
			for (var i=0; i<connectionsWithCurrentPeer.length; i++) {
				connectionsWithCurrentPeer[i].send(path);
			}
		}
	}

	function drawPoint(point) {
		context.fillRect(point.x, point.y, 5, 5);
	}

	function drawPath(path) {
		context.fillStyle = pickRandomColor();

		for (var i=0; i<path.length; i++) {
			var point = path[i];
			drawPoint(point);
		}
	}

	function pickRandomColor() {
		// Random number between 0 and length-1
		var index = Math.floor( ( Math.random() * colors.length ) );
		return colors[index];
	}

	function setUpUI() {
		// Button to connect to a peer
		document.getElementById("connectBtn").onclick = function () {
			var requestedPeer = document.getElementById("peerIdInput").value;
			connectToPeer(requestedPeer);
		};
	}

	// Sending a connection to a peer (i.e.: you hit the Connect button)
	function connectToPeer(peerId) {
		var conn = peer.connect(peerId);

		// Connection has been established
		conn.on('open', function () {
			setUpCanvasForConnection(conn);
		});
	}

	function setUpPeer() {
		peer = new Peer({
			key: 'lwjd5qra8257b9', //cwkTODO this is the demo api key
			debug: 3
		});

		// Initialization - ready to receive connections
		peer.on('open', function (id) {
			console.log('My peer ID is: ' + id);

			document.getElementById("mypeerid").innerHTML = id;
		});

		// Receiving a connection from a peer (i.e.: they hit the Connect button)
		peer.on('connection', function (conn) {
			console.log("Connected to by " + conn.peer);

			setUpCanvasForConnection(conn);
		});
	}

	function setUpCanvasForConnection(conn) {
		conn.on('data', function (data) {
			console.log("Received data from " + conn.peer + ": " + data);
			drawPath(data);
		});
	}

})();