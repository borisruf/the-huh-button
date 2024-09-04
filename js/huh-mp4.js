let buttonContainer;
let explanationContainer;
let huhButton;
let huuuhButton;
let okButton;
let player;
let explanationsDirectoryUrl;
let interval;

function addButtons() {
  buttonContainer = document.querySelector('.button-container');
  huhButton = document.createElement('button');
  huhButton.textContent = (typeof BUTTON1_LABEL !== 'undefined') ? BUTTON1_LABEL : 'Huh?';
  huhButton.classList.add('styled-button');
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
}

document.addEventListener('DOMContentLoaded', (event) => { 
  addButtons()
  player = document.getElementById('player');
  
  player.addEventListener('play', () => { 
    understood();
    clearInterval(interval); 
  }); 

  player.addEventListener('timeupdate', () => { 
    // Check the current time of the video 
    const currentTime = player.currentTime; 

    const buttonActivationDelay = (typeof BUTTON_ACTIVATION_DELAY !== 'undefined' ? BUTTON_ACTIVATION_DELAY : 10);
    const buttonDeactivationDelay = (typeof BUTTON_DEACTIVATION_DELAY !== 'undefined' ? BUTTON_DEACTIVATION_DELAY : null);

    // Enable the button if the current time is greater than or equal to 10 seconds 
    if (currentTime >= buttonActivationDelay && (buttonDeactivationDelay === null || currentTime <= buttonDeactivationDelay)) {
      huhButton.disabled = false; 
    } else { 
      huhButton.disabled = true; 
    }
  }); 

  explanationsDirectoryUrl = SERVER_PATH;

  if (explanationsDirectoryUrl.endsWith('/')) {
    explanationsDirectoryUrl = explanationsDirectoryUrl.slice(0, -1);
  }

});


function streamText(text, elementId, buttons) {
  document.getElementById('explanation').style.display = 'block';

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

  player.pause();

  const currentTimestamp = player.currentTime;
  let resolution = (typeof TIMESTAMP_RESOLUTION !== 'undefined' ? TIMESTAMP_RESOLUTION : 10);
  const roundedTimestamp = Math.floor(currentTimestamp / resolution) * resolution; // Round down to nearest lower multiple of 10

  const url = `${explanationsDirectoryUrl}/1/${roundedTimestamp}`; // Construct the URL for fetching the text file

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('404 File not found');
      }
      return response.text();
    })
    .then(data => {      
        streamText(data, 'explanation-container', [okButton, huuuhButton])
      }
      ).catch(error => {
      
      console.error('Error fetching and displaying text file:', error);
    });
}

function huuuh() {
  huuuhButton.style.display = 'none';
  okButton.style.display = 'none';

  player.pause();

  const currentTimestamp = player.currentTime;
  const roundedTimestamp = Math.floor(currentTimestamp / 10) * 10; // Round down to nearest lower multiple of 10

  const url = `${explanationsDirectoryUrl}/2/${roundedTimestamp}`; // Construct the URL for fetching the text file

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('404 File not found');
      }
      return response.text();
    })
    .then(data => {
      streamText(data, 'explanation-container', [okButton])
    })
    .catch(error => {
      console.error('Error fetching and displaying text file:', error);
    });
}


function understood() {
  huhButton.style.display = '';
  huuuhButton.style.display = 'none';
  player.play();
  explanationContainer.style.display = 'none';
  explanationContainer.innerHTML = '';
  okButton.style.display = 'none';
}

//function displayhuhSection(transcript, currentTimeStamp) {
//	
//  // Parse the transcript to find the section related to the timestamp
//  // You can use libraries like "srt-parser-3" to parse the SRT file
//  // For simplicity, let's assume the transcript is in the format: timestamp --> text
//  const lines = transcript.split('\n');
//  let section = '';
//  for (let i = 1; i < lines.length - 2; i += 4) {
//
//    const { start, end } = extractStartAndEndTimestamps(lines[i]);
//
//    if (currentTimeStamp >= start && currentTimeStamp <= end) {
//      section += lines[i + 1] + '<br>';
//    }
//  }
//
//  document.getElementById('huhSection').innerHTML = section;
//}
//
//function extractStartAndEndTimestamps(timestampString) {
//  const [start, end] = timestampString.split(' --> ');
//  return { start, end };
//}


//function convertSecondsToTimestamp(seconds) {
//  const hours = Math.floor(seconds / 3600);
//  const minutes = Math.floor((seconds % 3600) / 60);
//  const remainingSeconds = seconds % 60;
//  const milliseconds = Math.floor((remainingSeconds % 1) * 1000);
//  const formattedTimestamp = 
//    padWithZero(hours) + ':' + 
//    padWithZero(minutes) + ':' + 
//    padWithZero(Math.floor(remainingSeconds)) + ',' + 
//    padMilliseconds(milliseconds);
//  return formattedTimestamp;
//}

//function padWithZero(number) {
//  return (number < 10 ? '0' : '') + number;
//}

//function padMilliseconds(milliseconds) {
//  if (milliseconds < 10) {
//    return "00" + milliseconds;
//  } else if (milliseconds < 100) {
//    return "0" + milliseconds;
//  } else {
//    return milliseconds;
//  }
//}