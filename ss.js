document.addEventListener('DOMContentLoaded', () => {
    const accessBtn = document.getElementById('accessBtn');
    const timerPopup = document.getElementById('timerPopup');
    const channel1Link = document.getElementById('channel1');
    const channel2Link = document.getElementById('channel2');

    let channel1Joined = false;
    let channel2Joined = false;

    // Check if the user has already completed the process
    if (localStorage.getItem('accessed') === 'true') {
        console.log("User has already accessed the app, redirecting to index.html...");
        window.location.href = 'ndex.html'; // Correct file path
        return; // Ensure the rest of the script doesn't run after redirection
    }

    // Event listeners for joining channels
    channel1Link.addEventListener('click', () => {
        channel1Joined = true;
        checkJoinStatus();
    });

    channel2Link.addEventListener('click', () => {
        channel2Joined = true;
        checkJoinStatus();
    });

    // Function to check if both channels are joined
    function checkJoinStatus() {
        if (channel1Joined && channel2Joined) {
            accessBtn.disabled = false; // Enable the access button if both channels are joined
        }
    }

    // Event listener for the access button
    accessBtn.addEventListener('click', () => {
        console.log("Access button clicked, showing timer...");
        // Once the user clicks the access button, show the waiting message and start the timer
        timerPopup.style.display = 'block';
        startVerificationTimer();
    });

    // Function to simulate the verification process
    function startVerificationTimer() {
        // Disable the access button to prevent multiple clicks
        accessBtn.disabled = true;

        // Set a fixed 3-minute timer
        let timeLeft = 3; // 3 minutes
        const timerInterval = setInterval(() => {
            timeLeft--;
            timerPopup.innerHTML = `<p>Wait for verification... (${timeLeft} minute${timeLeft > 1 ? 's' : ''} remaining)</p>`;

            // Once the timer reaches 0, redirect to the main page
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                console.log("Timer completed, redirecting to main/index.html...");
                localStorage.setItem('accessed', 'true'); // Mark as accessed to skip next time
                window.location.href = 'ndex.html'; // Correct file path
            }
        }, 60000); // Update every minute
    }
});
