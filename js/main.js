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
	if (watth)dataToShow = wattHValue.toFixed(2)+" Wh";
	else dataToShow = wattHValue.toFixed(2)+" kCal";
	energie.innerHTML = dataToShow;
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
