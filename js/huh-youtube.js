let buttonContainer;
let explanationContainer;
let feedbackContainer;
let huhButton;
let huuuhButton;
let okButton;
let helpfulButton;
let unhelpfulButton;
let explanationsDirectoryUrl;
let interval;

function addButtons() {
  buttonContainer = document.querySelector('.button-container');
  huhButton = document.createElement('button');
  huhButton.textContent = (typeof BUTTON1_LABEL !== 'undefined') ? BUTTON1_LABEL : 'Huh?';
  huhButton.classList.add('styled-button');
  huhButton.disabled = true; 
  huhButton.addEventListener('click', huh);

  okButton = document.createElement('button');
  okButton.textContent = 'OK';
  okButton.classList.add('styled-button');
  okButton.style.display = 'none';
  okButton.addEventListener('click', understood);

  huuuhButton = document.createElement('button');
  huuuhButton.textContent = (typeof BUTTON2_LABEL !== 'undefined') ? BUTTON2_LABEL : 'Huuuh??';
  huuuhButton.classList.add('styled-button');
  huuuhButton.style.display = 'none';
  huuuhButton.addEventListener('click', huuuh);

  buttonContainer.appendChild(huhButton);
  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(huuuhButton);

  explanationContainer = document.getElementById('explanation-container')
  explanationContent = document.getElementById('explanation-content')

  feedbackContainer = document.getElementById('feedback-container');

  helpfulButton = document.getElementById('helpful-button');
  helpfulButton.style.display = 'none';
  helpfulButton.addEventListener("click", helpful);
  unhelpfulButton = document.getElementById('unhelpful-button');
  unhelpfulButton.style.display = 'none';
  unhelpfulButton.addEventListener("click", unhelpful);
}

document.addEventListener('DOMContentLoaded', (event) => { 
  addButtons()

  //document.getElementById("player").addEventListener('timeupdate', () => { 
  //}); 

  explanationsDirectoryUrl = SERVER_PATH;

  if (explanationsDirectoryUrl.endsWith('/')) {
    explanationsDirectoryUrl = explanationsDirectoryUrl.slice(0, -1);
  }

  const infoButton = document.getElementById('info-button');
  infoButton.addEventListener('click', showInfoBox);

});

function onPlayerStateChange(event) {
  // clear explanation if play button is pressed 
  if (event.data === YT.PlayerState.PLAYING) {
    understood();
    clearInterval(interval); 

    setInterval(function(){
      // Check the current time of the video 
      const currentTime = player.getCurrentTime(); 

      const buttonActivationDelay = (typeof BUTTON_ACTIVATION_DELAY !== 'undefined' ? BUTTON_ACTIVATION_DELAY : 10);
      const buttonDeactivationDelay = (typeof BUTTON_DEACTIVATION_DELAY !== 'undefined' ? BUTTON_DEACTIVATION_DELAY : null);

      // Enable the button if the current time is greater than or equal to 10 seconds 
      if (currentTime >= buttonActivationDelay && (buttonDeactivationDelay === null || currentTime <= buttonDeactivationDelay)) {
        huhButton.disabled = false; 
      } else { 
        huhButton.disabled = true; 
      }       
    }, 1000);
  }
}

function streamText(text, elementId, buttons, level, timestamp) {
  explanationContainer.style.display = 'block';

  explanationContainer.setAttribute('level',level)
  explanationContainer.setAttribute('timestamp',timestamp)

  const textArray = text.split(' '); // Split the text into an array of words
  let i = 0;
  interval = setInterval(function() {
    if (i < textArray.length) {
      const currentText = textArray.slice(0, i + 1).join(' '); // Join the words up to the current index
      document.getElementById(elementId).innerHTML = currentText; // Set the current text
      i++;
    } else {
      clearInterval(interval); // Stop the interval when all text has been displayed
      for (let i = 0; i < buttons.length; i++)  {
        buttons[i].style.display = '';
      }
    }
  }, 50); // Adjust the interval duration as per the desired streaming speed
}

function getRoundedTimestamp(timestamp) {

  let resolution = (typeof TIMESTAMP_RESOLUTION !== 'undefined' ? TIMESTAMP_RESOLUTION : 10);
  return Math.floor(timestamp / resolution) * resolution; // Round down to nearest lower multiple of 10
}

function getExplanationUrl(timestamp, level) {

  const roundedTimestamp = getRoundedTimestamp(timestamp);
  return`${explanationsDirectoryUrl}/${level}/a/${roundedTimestamp}`;
}

function getQuestionUrl(timestamp, level) {

  const roundedTimestamp = getRoundedTimestamp(timestamp);
  return`${explanationsDirectoryUrl}/${level}/q/${roundedTimestamp}`;
}


function huh() {

  huhButton.style.display = 'none';
  helpfulButton.style.display = 'none';
  unhelpfulButton.style.display = 'none';

  player.pauseVideo();

  const currentTimestamp = player.getCurrentTime();
  const roundedTimestamp = getRoundedTimestamp(currentTimestamp);

  let url = getExplanationUrl(currentTimestamp, '1');

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('404 File not found');
      }
      return response.text();
    })
    .then(data => {
        let buttons = [okButton, huuuhButton];
        if (typeof ENABLE_USER_FEEDBACK !== 'undefined' && (ENABLE_USER_FEEDBACK === true || ENABLE_USER_FEEDBACK === "true") ) {buttons = buttons.concat([helpfulButton, unhelpfulButton])}
        streamText(data, 'explanation-content', buttons, 1, roundedTimestamp)
      }
      ).catch(error => {
      
      console.error('Error fetching and displaying text file:', error);
    });
}

function huuuh() {
  huuuhButton.style.display = 'none';
  okButton.style.display = 'none';
  helpfulButton.style.display = 'none';
  helpfulButton.classList.remove('active');
  unhelpfulButton.style.display = 'none';
  unhelpfulButton.classList.remove('active');

  player.pauseVideo();

  const currentTimestamp = player.getCurrentTime();
  const roundedTimestamp = getRoundedTimestamp(currentTimestamp);

  let url = getExplanationUrl(currentTimestamp, '2');

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('404 File not found');
      }
      return response.text();
    })
    .then(data => {
      let buttons = [okButton];
      if (typeof ENABLE_USER_FEEDBACK !== 'undefined' && (ENABLE_USER_FEEDBACK === true || ENABLE_USER_FEEDBACK === "true")) {buttons = buttons.concat([helpfulButton, unhelpfulButton])}
      streamText(data, 'explanation-content', buttons, 2, roundedTimestamp)
    })
    .catch(error => {
      console.error('Error fetching and displaying text file:', error);
    });
}


function understood() {
  huhButton.style.display = '';
  huuuhButton.style.display = 'none';
  helpfulButton.style.display = 'none';
  helpfulButton.classList.remove('active');
  unhelpfulButton.style.display = 'none';
  unhelpfulButton.classList.remove('active');
  player.playVideo();
  explanationContainer.style.display = 'none';
  explanationContent.innerHTML = '';
  okButton.style.display = 'none';
}

function showInfoBox() {
  let level = explanationContainer.getAttribute('level')
  let roundedTimestamp = explanationContainer.getAttribute('timestamp')

  const url = getQuestionUrl(roundedTimestamp, level);

  const defaultText = "The AI model was asked to explain the last sentences, based on all previous information provided."

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.text()  
        } else {
          alert(defaultText);
          return;
        }
      }
    )
    .then(data => {
      if (data) {
        alert(`Based on all previous information provided, the AI model was asked to explain the following extract:\n\n "${data}"`);
      }
    })
    .catch(error => {
      console.error('Error fetching and displaying info:', error);
    });
}

function helpful(event) {
  if (!event.currentTarget.classList.contains('active')) {
    event.currentTarget.classList.add('active');

    let level = explanationContainer.getAttribute('level');

    let roundedTimestamp = explanationContainer.getAttribute('timestamp');
    const currentTimestamp = player.getCurrentTime();

    gtag('event', 'feedback_response', {
      'feedback': 'Useful',
      'timestamp': currentTimestamp,
      'roundedTimestamp': roundedTimestamp,
      'explanation_url': getExplanationUrl(currentTimestamp, level),
      'question_url': getQuestionUrl(currentTimestamp, level)
    });
  }
}

function unhelpful(event) {
  if (!event.currentTarget.classList.contains('active')) {
    event.currentTarget.classList.add('active');

    let level = explanationContainer.getAttribute('level');

    let roundedTimestamp = explanationContainer.getAttribute('timestamp');
    const currentTimestamp = player.getCurrentTime();

    gtag('event', 'feedback_response', {
      'feedback': 'Unuseful',
      'timestamp': currentTimestamp,
      'roundedTimestamp': roundedTimestamp,
      'explanation_url': getExplanationUrl(currentTimestamp, level),
      'question_url': getQuestionUrl(currentTimestamp, level)
    });
  }

}