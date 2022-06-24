let hits   = 0;     // Hist in a quiz
let qIndex = 1;     // Actual Q&A order number
let numQ   = 10;    // Number of total questions per quiz
let questions = []; // The quiz questions

const form = document.quizForm;

const elWelcome = el('#welcome');
const elTable   = el('#table'  );
const elTmeter  = el('#tmeter' );
const elQuiz    = el('#quiz'   );
const elResult  = el('#result' );
const elHits    = el('#hits'   );
const elCatego  = el('#catego' );
const elDiffic  = el('#diffic' );
const elQuesti  = el('#questi' );
const elNothing = el('#nothing');

const btnOpt1   = el('#opt1');
const btnOpt2   = el('#opt2');
const btnOpt3   = el('#opt3');
const btnOpt4   = el('#opt4');

btnOpt1.onclick = () => setInactiveBtn(btnSend, false);
btnOpt2.onclick = () => setInactiveBtn(btnSend, false);
btnOpt3.onclick = () => setInactiveBtn(btnSend, false);
btnOpt4.onclick = () => setInactiveBtn(btnSend, false);

const btnPlay   = el('#play' );
const btnStart  = el('#start');
const btnClose  = el('#close');
const btnSend   = el('#send' );

btnPlay.onclick  = play;
btnStart.onclick = start;
btnClose.onclick = start;
btnSend.onclick  = event => checkAnswer(event);

setInactiveBtn(btnPlay, true);
hideScores();
initialise( () => { if(localStorage.scores) showScores() } );
getQuiz();

/**
 * Start the quiz
 */
function play() {
    window.scroll(0, 0);
    setInactiveBtn(btnSend, true);
    showEl(elWelcome, false);
    showEl(elQuiz, true);
    askQuestion();
}

/**
 * Start the endgame actions
 */
function end() {
    setHand(hits);
    elHits.innerHTML = hits;
    showEl(elQuiz,  false);
    showEl(elResult, true);
    saveScore();
}

/**
 * Start the game again
 */
function start() {
    window.scroll(0, 0);
    setInactiveBtn(btnPlay, true);
    hideScores();
    showEl(elQuiz,   false);
    showEl(elResult, false);
    showEl(elWelcome, true);
    if (localStorage.scores) showScores();
    hits   = 0;
    qIndex = 1;
    getQuiz();
}

/**
 * Displays the scores stored in localStorage
 */
function showScores() {
    let tbody, tr;
    let value = 0;
    let avail = 0;
    let range = 10;    // Maximum score per quiz
    let numScores = 5; // Number of scores to be displayed  
    let yChart = [];   // List of chart ordinates

    setSpin(true);
    setChartLine();
    showEl(elNothing, false);
    showEl(elTmeter, true);
    showEl(chart, true);

    let scores = JSON.parse(localStorage.scores);

    tbody = createTable(elTable, 'scoresTable', ['#', 'Hits', 'Date & Time']);
    scores.slice(-numScores).forEach((score, i) => {
        tr = createEl(tbody, 'tr');
        createEl(tr, 'td', i + 1);
        createEl(tr, 'th', score.hits.toString()); // '0'
        createEl(tr, 'td', score.dateTime);
        yChart.push(score.hits);
        value += score.hits;
        avail++;
    })
    setChartLine(yChart);
    setMeter(value, range, numScores, avail);

    setSpin(false);
}

/**
 * Hide the scoring area
 */
function hideScores() {
    elTable.innerHTML = '';
    showEl(elTmeter, false);
    showEl(chart, false);
}

/**
 * Saves the score of the completed quiz
 */
function saveScore() {
    let scores = [];
    setSpin(true);
    setInactiveBtn(btnStart, true);

    if(localStorage.scores) scores = JSON.parse(localStorage.scores);
    
    scores.push({'hits': hits, 'dateTime': currentDateTime()});
    localStorage.setItem('scores', JSON.stringify(scores.slice(-100))); 
    
    setSpin(false);
    setInactiveBtn(btnStart, false);
}

/**
 * Gets the questions for the Quiz
 */
function getQuiz() {
    // We ask for the numQ minus one, which we will get apart from the JSON
    let address  = `https://opentdb.com/api.php?amount=${numQ - 1}&type=multiple`;
    let address2 = 'https://javguerra.github.io/summer-quiz/js/questions.json';

    // Gets one question from the JSON
    let query2 = data => {
       questions.unshift(data.results[getRndInt(0, 24)]);
       setInactiveBtn(btnPlay, false);
    };

    // Gets the questions (minus one) from the API
    let query = async data => {
        if (data.response_code) throw Error('API #' + data.response_code);
        questions = data.results;
        fetchAPI(address2, query2); // Yes! A typical Pyramid of Doom!
    };

    fetchAPI(address, query);
}

/**
 * Show a new question
 */
function askQuestion() {
    let cards = fisherYatesShuffle([0, 1, 2, 3]);
    let question = questions[qIndex - 1];

    elCatego.innerHTML = question.category;
    elDiffic.innerHTML = question.difficulty;
    elQuesti.innerHTML = question.question;

    cards.forEach((card, i) => {
        el(`#opt${i + 1}`).checked = false;
        el(`#opt${i + 1}`).setAttribute('value', card); 
        if (card) {
            el(`label[for=opt${i + 1}]`).innerHTML = question.incorrect_answers[card - 1];
        } else {
            el(`label[for=opt${i + 1}]`).innerHTML = question.correct_answer;
            console.log(decodeHTMLEntities(question.correct_answer)); // Did someone ask for help?;
        }
    })

    setProgress(numQ, qIndex -1);
}

/**
 * Check the form
 * @param {event} event prevent
 */
function checkAnswer(event) {
    event.preventDefault(); // Firefox needs you!
    setInactiveBtn(btnSend, true);
    
    if (!el('input[name="opt"]:checked')) {
        openDialog('Select an option');
    } else {
        window.scroll(0, 0);

        if (form.opt.value == 0) hits++;

        if (qIndex == numQ) {
            end();
        } else {
            qIndex++;
            askQuestion();
        }
    }
}