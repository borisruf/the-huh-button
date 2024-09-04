let buttonContainer;
let explanationContainer;
let huhButton;
let huuuhButton;
let okButton;
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


function huh() {

  huhButton.style.display = 'none';

  player.pauseVideo();

  const currentTimestamp = player.getCurrentTime();
  let resolution = (typeof TIMESTAMP_RESOLUTION !== 'undefined' ? TIMESTAMP_RESOLUTION : 10);
  const roundedTimestamp = Math.floor(currentTimestamp / resolution) * resolution; // Round down to nearest lower multiple of 10

  const url = `${explanationsDirectoryUrl}/1/a/${roundedTimestamp}`; // Construct the URL for fetching the text file

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('404 File not found');
      }
      return response.text();
    })
    .then(data => {      
        streamText(data, 'explanation-content', [okButton, huuuhButton], 1, roundedTimestamp)
      }
      ).catch(error => {
      
      console.error('Error fetching and displaying text file:', error);
    });
}

function huuuh() {
  huuuhButton.style.display = 'none';
  okButton.style.display = 'none';

  player.pauseVideo();

  const currentTimestamp = player.getCurrentTime();
  const roundedTimestamp = Math.floor(currentTimestamp / 10) * 10; // Round down to nearest lower multiple of 10

  const url = `${explanationsDirectoryUrl}/2/a/${roundedTimestamp}`; // Construct the URL for fetching the text file

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('404 File not found');
      }
      return response.text();
    })
    .then(data => {
      streamText(data, 'explanation-content', [okButton], 2, roundedTimestamp)
    })
    .catch(error => {
      console.error('Error fetching and displaying text file:', error);
    });
}


function understood() {
  huhButton.style.display = '';
  huuuhButton.style.display = 'none';
  player.playVideo();
  explanationContainer.style.display = 'none';
  explanationContent.innerHTML = '';
  okButton.style.display = 'none';
}

function showInfoBox() {
  let level = explanationContainer.getAttribute('level')
  let roundedTimestamp = explanationContainer.getAttribute('timestamp')

  const url = `${explanationsDirectoryUrl}/${level}/q/${roundedTimestamp}`
  const defaultText = "The AI model was asked to explain the last sentences, based on all previous information provided."

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.text()  
        } else {
          return defaultText
        }
      }
    )
    .then(data => {
      if (data) {
        alert(`Based on all previous information provided, the AI model was asked to explain the following extract:\n\n "${data}"`);
      } else {
        // Show a general string if the online resource does not exist
        alert(defaultText);
      }
    })
    .catch(error => {
      console.error('Error fetching and displaying info:', error);
    });
}