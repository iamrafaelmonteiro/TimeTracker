document.addEventListener('DOMContentLoaded', () => {
    const privacyPolicyLink = document.getElementById('privacy-policy-link');
    const modal = document.getElementById('privacy-modal');
    const modalBackground = document.getElementById('modal-background');
    const modalClose = document.getElementById('modal-close');

    // Verificar se os elementos foram encontrados corretamente
    // if (privacyPolicyLink && modal && modalBackground && modalClose) {
        privacyPolicyLink.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar comportamento padrão de navegação
            modal.style.display = 'block';
            modalBackground.style.display = 'block';
        });

        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
            modalBackground.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modalBackground) {
                modal.style.display = 'none';
                modalBackground.style.display = 'none';
            }
        });
    // } else {
        // console.error('One or more modal elements not found in the DOM.');
    // }

    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const taskSelect = document.getElementById('task-select');
    const taskText = document.getElementById('task-text');
    const intervalList = document.getElementById('interval-list');
    const clearBtn = document.getElementById('clear-btn');

    let currentInterval = null;
    let intervalId = null;
    let intervals = JSON.parse(localStorage.getItem('intervals')) || [];

    function loadIntervals() {
        intervalList.innerHTML = '';
        intervals.forEach((interval, index) => {
            const li = document.createElement('li');
            const taskSpan = document.createElement('span');
            taskSpan.textContent = `${index + 1}. ${interval.task} (${interval.description}): ${formatDuration(interval.duration)}`;
            li.appendChild(taskSpan);
            li.classList.add('interval-item');
            
            // Create button to continue the interval
            const continueBtn = document.createElement('button');
            continueBtn.textContent = 'Continue';
            continueBtn.addEventListener('click', () => continueInterval(index));
            li.appendChild(continueBtn);
            
            intervalList.appendChild(li);

            // Disable continue button if timer is active
            if (currentInterval) {
                continueBtn.disabled = true;
                continueBtn.classList.add('disabled');
            }
        });
    }

    function formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        let formattedTime = `${minutes}m ${seconds}s`;
        if (hours > 0) {
            formattedTime = `${hours}h ${formattedTime}`;
        }
        return formattedTime;
    }

    function saveIntervals() {
        localStorage.setItem('intervals', JSON.stringify(intervals));
        loadIntervals();
    }

    function updateTitle(duration) {
        document.title = formatDuration(duration);
    }

    function startTimer() {
        const task = taskSelect.value;
        const description = taskText.value;
        if (description.trim() === '') {
            alert('Please fill out the description field before starting the interval.');
            return;
        }
        currentInterval = { task, description, start: Date.now(), duration: 0 };
        intervalId = setInterval(() => {
            const now = Date.now();
            currentInterval.duration = now - currentInterval.start; // Update duration with elapsed time
            const duration = currentInterval.duration;
            startBtn.textContent = `In Progress (${formatDuration(duration)})`;
            updateTitle(duration);
        }, 1000);
        startBtn.disabled = true;
        stopBtn.disabled = false;
        disableIntervalButtons(true); // Disable interval buttons when starting the timer
        updateContinueButtonsState(true); // Disable continue buttons visually
    }

    function stopTimer() {
        if (currentInterval) {
            clearInterval(intervalId);
            const now = Date.now();
            currentInterval.duration = now - currentInterval.start; // Update duration with elapsed time
            
            // Check if an interval with the same task and description already exists
            const index = intervals.findIndex(interval => interval.task === currentInterval.task && interval.description === currentInterval.description);
            if (index !== -1) {
                // If exists, update only the duration of the existing interval
                intervals[index].duration = currentInterval.duration;
            } else {
                // If not exists, add a new interval to the list
                intervals.push({ task: currentInterval.task, description: currentInterval.description, duration: currentInterval.duration });
            }

            // Save updated intervals to local storage
            saveIntervals();

            // Reset button states and timer
            startBtn.textContent = 'Start';
            startBtn.disabled = false;
            stopBtn.disabled = true;
            document.title = "Time Tracker";
            disableIntervalButtons(false); // Enable interval buttons when stopping the timer
            updateContinueButtonsState(false); // Update continue buttons visually
            currentInterval = null; // Clear current interval to start a new one
        }
    }

    function continueInterval(index) {
        const interval = intervals[index];
        if (interval) {
            clearInterval(intervalId); // Clear any active interval
            
            // Start timer from the point where it was stopped
            const startTime = Date.now() - interval.duration;
            currentInterval = { task: interval.task, description: interval.description, start: startTime, duration: 0 };

            // Update the interface to reflect the ongoing interval
            startBtn.textContent = `In Progress (${formatDuration(interval.duration)})`;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            disableIntervalButtons(true); // Disable interval buttons in the list
            updateContinueButtonsState(true); // Disable continue buttons visually
           
            // Start interval for updating the timer
            intervalId = setInterval(() => {
                const now = Date.now();
                currentInterval.duration = now - currentInterval.start; // Update duration with elapsed time
                const duration = currentInterval.duration;
                startBtn.textContent = `In Progress (${formatDuration(duration)})`;
                updateTitle(duration);
            }, 1000);
        }
    }

    function clearIntervals() {
        if (confirm('Are you sure you want to delete all stored data?')) {
            localStorage.removeItem('intervals');
            intervals = [];
            loadIntervals();
        }
    }

    function disableIntervalButtons(disabled) {
        const intervalItems = document.querySelectorAll('.interval-item');
        intervalItems.forEach(item => {
            const button = item.querySelector('button');
            if (button) {
                button.disabled = disabled;
                if (disabled) {
                    button.classList.add('disabled');
                } else {
                    button.classList.remove('disabled');
                }
            } 
        });
    }

    function updateContinueButtonsState(disabled) {
        const continueButtons = document.querySelectorAll('.interval-item button');
        continueButtons.forEach(button => {
            button.disabled = disabled;
            if (disabled) {
                button.classList.add('disabled');
            } else {
                button.classList.remove('disabled');
            }
        });
    }

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    clearBtn.addEventListener('click', clearIntervals);

    loadIntervals();

});
