////////////////////////////////////////////////////
// CONFIG
////////////////////////////////////////////////////

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwitJYy4b3z8y4VOcYYJSynIOIJy3exyLk4J2q17bTJ2on8AguMMVciuUEzVfUFr8aPVg/exec";

const videos = [

  {file:"videos/video1.mp4", correct:"Amelia"},
  {file:"videos/video2.mp4", correct:"Dale"},
  {file:"videos/video3.mp4", correct:"Simon"},
  {file:"videos/video4.mp4", correct:"Maroilles"},
  {file:"videos/video5.mp4", correct:"Mimolette"},
  {file:"videos/video6.mp4", correct:"Amelia"},
  {file:"videos/video7.mp4", correct:"Dale"},
  {file:"videos/video8.mp4", correct:"Simon"},
  {file:"videos/video9.mp4", correct:"Maroilles"},
  {file:"videos/video10.mp4", correct:"Mimolette"}

];

const choices = [
  "Amelia",
  "Dale",
  "Simon",
  "Maroilles",
  "Mimolette"
];

////////////////////////////////////////////////////
// STATE
////////////////////////////////////////////////////

let participant = "";
let trials = [];
let index = 0;
let results = [];
let trialStartTime = 0;
let awaitingResponse = false;

////////////////////////////////////////////////////
// SHUFFLE (Fisher-Yates)
////////////////////////////////////////////////////

function shuffle(array)
{
  for(let i = array.length - 1; i > 0; i--)
  {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

////////////////////////////////////////////////////
// BUILD TRIAL LIST (10 + 2 repeats)
////////////////////////////////////////////////////

function buildTrials()
{
  let base = shuffle([...videos]).map(v => ({
    ...v,
    repeatFlag: 0
  }));

  let repeats = shuffle([...videos])
    .slice(0, 2)
    .map(v => ({
      ...v,
      repeatFlag: 1
    }));

  return shuffle(base.concat(repeats));
}

////////////////////////////////////////////////////
// START EXPERIMENT
////////////////////////////////////////////////////

function startExperiment()
{
  participant =
    document.getElementById("participantName")
      .value.trim();

  if(!participant)
  {
    alert("Please enter your name or anything you want for us to know who you are :D");
    return;
  }

  trials = buildTrials();
  index = 0;

  document.getElementById("startScreen")
    .style.display = "none";

  document.getElementById("experimentScreen")
    .style.display = "block";

  loadTrial();
}

////////////////////////////////////////////////////
// LOAD TRIAL (ONE SCREEN PER QUESTION)
////////////////////////////////////////////////////

function loadTrial()
{
  awaitingResponse = true;

  const t = trials[index];

  document.getElementById("trialCounter")
    .innerText =
      `Trial ${index + 1} / ${trials.length}`;

  const video =
    document.getElementById("videoPlayer");

  video.src = t.file;

  video.load();
  video.play();

  let html = "";

  choices.forEach(c =>
  {
    html += `
      <label>
        <input type="radio"
               name="answer"
               value="${c}">
        ${c}
      </label>
    `;
  });

  document.getElementById("choices")
    .innerHTML = html;

  // RT START
  trialStartTime = performance.now();
}

////////////////////////////////////////////////////
// RESPONSE (AUTO ADVANCE)
////////////////////////////////////////////////////

document.addEventListener("change", function(e)
{
  if(!awaitingResponse) return;

  if(e.target.name === "answer")
  {
    recordResponse(e.target.value);
  }
});

////////////////////////////////////////////////////
// RECORD RESPONSE
////////////////////////////////////////////////////

function recordResponse(selected)
{
  awaitingResponse = false;

  const t = trials[index];

  const rt =
    (performance.now() - trialStartTime) / 1000;

  results.push({

    participant,
    trial: index + 1,
    video: t.file,
    correct: t.correct,
    response: selected,
    rt: rt.toFixed(3),
    repeatFlag: t.repeatFlag

  });

  index++;

  if(index >= trials.length)
  {
    finishExperiment();
  }
  else
  {
    setTimeout(loadTrial, 250);
  }
}

////////////////////////////////////////////////////
// FINISH + SEND TO GOOGLE SHEETS
////////////////////////////////////////////////////

function finishExperiment()
{
  document.getElementById("experimentScreen")
    .style.display = "none";

  document.getElementById("endScreen")
    .style.display = "block";

  fetch(SCRIPT_URL,
  {
    method: "POST",
    body: JSON.stringify({
      participant,
      trials: results
    })
  })
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
}