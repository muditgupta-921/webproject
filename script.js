const colors = ["red", "blue", "green", "pink"];
let gamePattern = [];
let userPattern = [];
let started = false;
let level = 0;

document.addEventListener("keydown", function () {
  if (!started) {
    nextSequence();
    started = true;
  }
});

document.querySelectorAll(".btn").forEach(button => {
  button.addEventListener("click", function () {
    const userColor = this.id;
    userPattern.push(userColor);

    playSound(userColor);       //  Play sound on click
    animatePress(userColor);    //  Button animation

    checkAnswer(userPattern.length - 1);
  });
});

function nextSequence() {
  userPattern = [];
  level++;
  document.getElementById("title").textContent = "Level " + level;

  const randomColor = colors[Math.floor(Math.random() * 4)];
  gamePattern.push(randomColor);

  //  Animate + play sound for the new step
  setTimeout(() => {
    animatePress(randomColor);
    playSound(randomColor);
  }, 500);
}

function checkAnswer(currentIndex) {
  if (gamePattern[currentIndex] === userPattern[currentIndex]) {
    if (userPattern.length === gamePattern.length) {
      setTimeout(nextSequence, 1000);
    }
  } else {
    playSound("wrong");
    document.body.classList.add("game-over");
    document.getElementById("title").textContent = "Game Over, Press Any Key to Restart";

    setTimeout(() => {
      document.body.classList.remove("game-over");
    }, 200);

    startOver();
  }
}

function animatePress(color) {
  const button = document.getElementById(color);
  button.classList.add("pressed");
  setTimeout(() => {
    button.classList.remove("pressed");
  }, 100);
}

function playSound(color) {
  let audioUrl = "";

  switch (color) {
    case "red":
      audioUrl = "https://s3.amazonaws.com/adam-recvlohe-sounds/button-29.mp3";
      break;
    case "blue":
      audioUrl = "https://s3.amazonaws.com/adam-recvlohe-sounds/button-10.mp3";
      break;
    case "green":
      audioUrl = "https://s3.amazonaws.com/adam-recvlohe-sounds/button-2.mp3";
      break;
    case "pink":
      audioUrl = "https://s3.amazonaws.com/adam-recvlohe-sounds/button-50.mp3";
      break;
    case "wrong":
      audioUrl = "https://s3.amazonaws.com/adam-recvlohe-sounds/error.wav";
      break;
    default:
      return;
  }

  const audio = new Audio(audioUrl);
  audio.play().catch((e) => {
    console.log("Sound blocked or failed:", e);
  });
}

function startOver() {
  gamePattern = [];
  userPattern = [];
  level = 0;
  started = false;
}
