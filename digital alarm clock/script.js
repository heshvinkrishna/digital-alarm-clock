let time = document.getElementById('time');
let ampmIndicator = document.getElementById('ampm-indicator');
let alarmTime = document.getElementById('alarmTime');
let missileWarningSound = document.getElementById('missileWarning');
let alarmSound = document.getElementById('alarmSound');
let stopAlarmBtn = document.getElementById('stopAlarm');
let lcdScreen = document.getElementById('lcd-screen');
let warningBanner = document.getElementById('warning-banner');

let warningTriggered = false;
let explosionTriggered = false;

stopAlarmBtn.addEventListener('click', stopAlarm);

function updateTime() {
    let now = new Date();
    let hours24 = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    let ampm = hours24 >= 12 ? 'PM' : 'AM';
    let hours12 = hours24 % 12;
    hours12 = hours12 ? hours12 : 12;

    ampmIndicator.textContent = ampm;

    let formattedHours = formatTime(hours12);
    let formattedMinutes = formatTime(minutes);
    let formattedSeconds = formatTime(seconds);

    let colon = `<span class="blink">:</span>`;
    time.innerHTML = formattedHours + colon + formattedMinutes + colon + formattedSeconds;

    checkAlarmAndWarning(hours24, minutes, seconds);

    setTimeout(updateTime, 1000);
}

function formatTime(i) {
    return i < 10 ? "0" + i : i;
}

function checkAlarmAndWarning(currentHours, currentMinutes, currentSeconds) {
    if (!alarmTime.value) return; 

    let [alarmHours, alarmMinutes] = alarmTime.value.split(':').map(Number);

    let currentTimeTotalSec = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
    let alarmTimeTotalSec = alarmHours * 3600 + alarmMinutes * 60;
    
    let diffSec = alarmTimeTotalSec - currentTimeTotalSec;

    // Trigger Warning & "missilewarning" sound exactly 18 seconds before the alarm hits
    if (diffSec > 0 && diffSec <= 18) {
        warningBanner.classList.remove('hidden');
        if (!warningTriggered) {
            missileWarningSound.play().catch(e => console.log("Audio play blocked:", e));
            warningTriggered = true;
        }
    } else if (diffSec <= 0 && diffSec > -60) {
        warningBanner.classList.remove('hidden');
    } else {
        warningBanner.classList.add('hidden');
        warningTriggered = false;
    }

    // Trigger Missile Explosion sound when alarm time matches exactly (0 seconds remaining)
    if (currentHours === alarmHours && currentMinutes === alarmMinutes && currentSeconds === 0) {
        if (!explosionTriggered) {
            missileWarningSound.pause();
            missileWarningSound.currentTime = 0;
            
            let playPromise = alarmSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Browser blocked autoplay interaction:", error);
                });
            }
            lcdScreen.classList.add('ringing'); 
            explosionTriggered = true;
        }
    }
}

function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0; 
    missileWarningSound.pause();
    missileWarningSound.currentTime = 0;
    lcdScreen.classList.remove('ringing');
    warningBanner.classList.add('hidden');
    warningTriggered = false;
    explosionTriggered = false;
    alarmTime.value = ""; 
}