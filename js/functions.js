let spins = areSpins = 0;

const elDialog  = el('#error'  );
const elErrMsg  = el('#errMsg' );
const btnOK     = el('#ok'     );
const elZone    = el('#zone'   );
const elAverage = el('#average');
const elNumQ    = el('#numQ'   );
const chart     = el('#chart'  );
const counter   = el('#counter');

btnOK.onclick = closeDialog;

/**
 * Obtains a requested element
 * @param {string} el element to be obtained
 * @returns requested element
 */
function el(el) { return document.querySelector(el) }

/**
 * Creates a new element inside a parent element with or without content
 * @param {node} parent within the element to be created
 * @param {string} element to create
 * @param {string} content to contain the new element (optional)
 * @returns the appended element
 */
function createEl(parent, element, content = null) {
    let newEl = document.createElement(element);
    if (content) newEl.innerHTML = content;
    return parent.appendChild(newEl);
}

/**
 * Create a new basic table with the indicated headers and footers
 * @param {node} parent within the table to be created
 * @param {String} id of the table
 * @param {Array} headers list
 * @param {Array} footers list (optional)
 * @returns 'tbody' element
 */
function createTable(parent, id, headers, footers = null) {
    let table, thead, tfoot, tr, th;
    table = createEl(parent, 'table');
    table.setAttribute('id', id);
    thead = createEl(table , 'thead');
    tr    = createEl(thead , 'tr');
    for (const header of headers) {
        th = createEl(tr, 'th', header);
        th.setAttribute('scope', 'col');
    }
    if (footers) {
        tfoot = createEl(table, 'tfoot');
        tr    = createEl(tfoot, 'tr');
        for (const footer of footers) {
            createEl(tr, 'td', footer);
        } 
    }
    return createEl(table, 'tbody');
}

/**
 * Queries the API on the given address and executes the callback function
 * @param {String} address to API
 * @param {Function} _callback to be executed
 * @param {String} type of data (optional)
 */
function fetchAPI(address, _callback, type = 'json') {
    setSpin(true);
    fetch(address)
        .then(response => {
            if (!response.ok) throw Error(response.statusText);
            return type == 'json' ? response.json() : response.text();
        })
        .then(data => _callback(data))
        .catch(err => {openDialog(err); console.log(err)})
        .finally(setSpin(false));
}

/**
 * Show or hide a given element
 * @param {node} element to change
 * @param {Boolean} status show/hide
 */
function showEl(element, status) {
    element.style.display = status ? 'initial' : 'none';
}

/**
 * Changes the disabled status of a given button
 * @param {node} button to change
 * @param {Boolean} status enabled/disabled
 */
function setInactiveBtn(button, status) {
    button.disabled = status;
    button.setAttribute('aria-disabled', status);
}

/**
 * Opens the modal window with a message
 * @param {String} mensaje to show
 */
function openDialog(message) {
    elErrMsg.innerHTML = message;
    elDialog.showModal();
}

/**
 * Close the modal window
 */
function closeDialog() { elDialog.close() };

/**
 * Enable or disable spin for each asynchronous process
 * @param {Boolean} status
 */
function setSpin(status) {
    status ? spins++ : spins--;

    if (status && !areSpins) {
        areSpins = setInterval(checkSpin, 300);
        elZone.showModal();
    }
}

/**
 * Check if 'spin' has reached zero to deactivate this verification
 */
function checkSpin() {
    if (!spins) {
        clearInterval(areSpins);
        areSpins = 0;
        elZone.close(); 
    }
}

/**
 * Gets a random integer within the range.
 * @param {Number} min value of range
 * @param {Number} max value if range
 * @returns integer
 */
function getRndInt(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

/**
 * If the number given is less than 10, add a leading zero
 * @param {Number} n 
 * @returns formatted number
 */
function twoDigits(n) { return n < 10 ? '0' + n : n }

/**
 * Gets the current date and time
 * @returns formatted date and time
 */
function currentDateTime() {
    let now  = new Date();
    let date = `${twoDigits(now.getDate())}-${twoDigits(now.getMonth() + 1)}-${now.getFullYear()}`;
    let time = `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}:${twoDigits(now.getSeconds())}`;
    return date + ' ' + time;
}

/**
 * Sets the meter parameters
 * @param {Number} value sum of scores
 * @param {Number} range maximum score per quiz
 * @param {Number} numScores number of possible scores
 * @param {Number} available number of available scores
 * @returns percent
 */
function setMeter(value, range, numScores, available) {
    let max, percent;

    if (available < numScores) max = available;
    else max = numScores;
    max *= range;
    percent = (value * 100 / max);
    elAverage.setAttribute('value', value);
    elAverage.setAttribute('max', max);
    elAverage.setAttribute('optimum', max * .75);
    elAverage.setAttribute('high', max * .5);
    elAverage.setAttribute('low', max * .25);
    elAverage.textContent = percent + '%'; 
    return percent;  
}

/**
 * Sets the progress bar parameters
 * @param {Number} numQ number of questions per quiz
 * @param {Number} q actual question
 * @returns percent
 */
function setProgress(numQ, q) {
    percent = (q * 100 / numQ);
    elNumQ.setAttribute('value', q);
    elNumQ.textContent = percent + '%';
    return percent;
}

/**
 * Mixes the elements of an Array according to the Fisher-Yates method
 * @param {Array} arr 
 * @returns array
 */
function fisherYatesShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); //random index
        [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
    }
    return arr;
}
   
/**
 * Decodes HTML entities from a string
 * @author Gustavo
 * @param {string} str string with HTML entities
 * @returns string with HTML entity conversion
 */
function decodeHTMLEntities(str) {
    let result = null;
    if(str && typeof str === 'string') {
        let element = document.createElement('div');
        element.innerHTML = str;
        result = element.textContent;
        element.remove();
    }
    return result;
}

/**
 * Loads the SVGs that will be embedded in the HTML
 * @param {function} _callback initial actions
 */
function initialise(_callback) {
    let chartUrl = 'https://javguerra.github.io/summer-quiz/assets/img/linechart.svg';
    let requestChart = xml => {chart.innerHTML = xml; _callback()}
    fetchAPI(chartUrl, requestChart, 'text');

    let counterUrl = 'https://javguerra.github.io/summer-quiz/assets/img/counter.svg';
    let requestCounter = xml => counter.innerHTML = xml;
    fetchAPI(counterUrl, requestCounter, 'text');
}

/**
 * Sets the values of the line in line chart
 * @param {Array} ordinates hits
 */
function setChartLine(ordinates = []) {
    let i, ord, numOrd = ordinates.length;
    if(numOrd < 5) for (i = 0; i < 5 - numOrd; i++) ordinates.push(0);
    ord = ordinates.slice(-5).map(y => 73 - y * 7.1);
    el('#theline').setAttribute('points',
        `11 ${ord[0]} 33.5 ${ord[1]} 56 ${ord[2]} 78.5 ${ord[3]} 101 ${ord[4]}`);
}

/**
 *  Sets the hand of the counter to the indicated position according to 'hits'
 * @param {Number} hits
 */
 function setHand(hits) {
    const  handPosition = [
        '0 -.28946 .28839 0 -139.16 -20.501',
        '.089449 -.2753 .27428 .089119 -107.1 -76.177',
        '.17014 -.23418 .23332 .16951 -59.407 -119.22',
        '.23418 -.17014 .16951 .23332 -.74583 -145.42',
        '.2753 -.089449 .089119 .27428 63.14 -152.21',
        '.28946 0 0 .28839 126 -138.93',
        '.2753 .089449 -.089119 .27428 181.67 -106.87',
        '.23418 .17014 -.16951 .23332 224.72 -59.174',
        '.17014 .23418 -.23332 .16951 250.92 -.51273',
        '.089449 .2753 -.27428 .089119 257.71 63.373',
        '0 .28946 -.28839 0 244.42 126.23'
    ]
    el('#hand').setAttribute('transform', `matrix(${handPosition[hits]})`);
}