// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const inputField = document.getElementById('input');
const energie = document.getElementById('Eval');
const WH = document.getElementById('wattheure');
const KC = document.getElementById('kilocal');
//le canvas 'affichage de la puissance'
var canvas = document.getElementById('canvas');
const sizeCanvas = 300;
var ctx = canvas.getContext('2d');
var someColors = [];
someColors.push('#65C8D0');
someColors.push('#244B4E');
drawBase();

function drawBase() {
	ctx.strokeStyle = "rgb(0,0,0)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(sizeCanvas/2, sizeCanvas/2, sizeCanvas/2-1, 0, 2*Math.PI);
	ctx.stroke(); 
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(sizeCanvas/2, sizeCanvas/2, 6, 0, 2*Math.PI);
	ctx.stroke();
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(sizeCanvas/2, sizeCanvas/2, sizeCanvas/2-5, 0.75*Math.PI, 2.25*Math.PI);
	ctx.stroke(); 
	ctx.beginPath();
	ctx.arc(sizeCanvas/2, sizeCanvas/2, sizeCanvas/2-25, 0.75*Math.PI, 2.25*Math.PI);
	ctx.stroke(); 
	ctx.beginPath();
	ctx.moveTo(sizeCanvas/2+Math.cos(0.75*Math.PI)*(sizeCanvas/2-5), sizeCanvas/2+Math.sin(0.75*Math.PI)*(sizeCanvas/2-5));
	ctx.lineTo(sizeCanvas/2+Math.cos(0.75*Math.PI)*(sizeCanvas/2-25), sizeCanvas/2+Math.sin(0.75*Math.PI)*(sizeCanvas/2-25));
	ctx.stroke(); 
	ctx.beginPath();
	ctx.moveTo(sizeCanvas/2+Math.cos(2.25*Math.PI)*(sizeCanvas/2-5), sizeCanvas/2+Math.sin(2.25*Math.PI)*(sizeCanvas/2-5));
	ctx.lineTo(sizeCanvas/2+Math.cos(2.25*Math.PI)*(sizeCanvas/2-25), sizeCanvas/2+Math.sin(2.25*Math.PI)*(sizeCanvas/2-25));
	ctx.stroke(); 
	//
	//drawJauge(300, 180, 165, someColors, 0.2);
}

function drawJauge(xc, yc, r, radientColors, pourcent) {
    var partLength = (1.5 * Math.PI)*pourcent;
    const start = 0.75*Math.PI;
    var gradient = null;
    var startColor = null,
        endColor = null;

        startColor = radientColors[0];
        endColor = radientColors[1];

        // x start / end of the next arc to draw
        var xStart = xc + Math.cos(start) * r;
        var xEnd = xc + Math.cos(start + partLength) * r;
        // y start / end of the next arc to draw
        var yStart = yc + Math.sin(start) * r;
        var yEnd = yc + Math.sin(start + partLength) * r;

        ctx.beginPath();

        gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1.0, endColor);

        ctx.strokeStyle = gradient;
        ctx.arc(xc, yc, r, start, start + partLength);
        ctx.lineWidth = 19;
        ctx.stroke();
        ctx.closePath();

    ctx.strokeStyle = "rgb(0,0,0)";
	ctx.beginPath();
	ctx.moveTo(sizeCanvas/2+Math.cos(start+partLength)*10, sizeCanvas/2+Math.sin(start+partLength)*10);
	ctx.lineTo(sizeCanvas/2+Math.cos(start+partLength)*(sizeCanvas/2-30), sizeCanvas/2+Math.sin(start+partLength)*(sizeCanvas/2-30));
	ctx.lineWidth = 2;
	ctx.stroke(); 
}


var watth = true;
var prevTime;
var wattHValue = 0.0;


// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;

const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;

  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

const logToTerminal = (message, type = '') => {
  terminalContainer.insertAdjacentHTML('beforeend',
      `<div${type && ` class="${type}"`}>${message}</div>`);

  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
};

// Obtain configured instance.
const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function(data) {
  //logToTerminal(data, 'in');
	//on change lla valeur de l'energie
	var dataToShow = "";
	var maintenant = Date.now();
	var elapsedTime = maintenant - prevTime;
	if (isNaN(elapsedTime)) elapsedTime = 0;
	if (elapsedTime>500) elapsedTime = 0;
	prevTime = maintenant;
	wattHValue = wattHValue + parseFloat(data)*elapsedTime/1000./3600.;
	if (watth){
		dataToShow = wattHValue.toFixed(2)+" Wh";
	}
	else {
		var wattHTokCal = wattHValue*0.860421;
		dataToShow = wattHTokCal.toFixed(2)+" kCal";
	}
	energie.innerHTML = dataToShow;
	var pourCentPui = Math.min(1.0, parseFloat(data)/100.);
	ctx.clearRect(0, 0, 600, 300);
	drawBase();
	drawJauge(300, 180, 165, someColors, pourCentPui);
};

// Override default log method to output messages to the terminal and console.
terminal._log = function(...messages) {
  // We can't use `super._log()` here.
  messages.forEach((message) => {
    logToTerminal(message);
    console.log(message); // eslint-disable-line no-console
  });
};

// Implement own send function to log outcoming data to the terminal.
const send = (data) => {
  terminal.send(data).
      then(() => logToTerminal(data, 'out')).
      catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
  terminal.connect();
	//TODO : change start to stop button
});

/*disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  deviceNameLabel.textContent = defaultDeviceName;
});

sendForm.addEventListener('submit', (event) => {
  event.preventDefault();

  send(inputField.value);

  inputField.value = '';
  inputField.focus();
});*/

WH.addEventListener('click', (event) => {
  watth = true;
	energie.style.color = "rgb(5, 152, 152)";
});

KC.addEventListener('click', (event) => {
  watth = false;
	energie.style.color = "rgb(102, 102, 102)";
});

// Switch terminal auto scrolling if it scrolls out of bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
      terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});
