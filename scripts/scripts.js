let player;
let playlist = [];
let currentSongIndex = -1;
let playerReady = false;
let progressInterval; // For tracking the progress bar

// Ensure this is globally accessible
function onYouTubeIframeAPIReady() {
    console.log("YouTube IFrame API is ready");
    player = new YT.Player('playerContainer', {
        height: '0', // Hide the video
        width: '0',  // Hide the video
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'mute': 0 // Set to 0 for testing audio output
        },
        events: {
            'onReady': function(event) {
                console.log("Player is ready");
                playerReady = true; // Set player as ready
            },
            'onStateChange': onPlayerStateChange // Handle video state changes
        }
    });
}

// Function to handle adding songs to the playlist
document.getElementById('submitButton').addEventListener('click', function() {
    const urlInput = document.getElementById('urlInput').value;
    const videoId = extractVideoID(urlInput);
    
    if (videoId && !playlist.includes(videoId)) {
        playlist.push(videoId);
        updatePlaylistDisplay();
        document.getElementById('urlInput').value = ''; // Clear the input
    }
});

// Play button event listener
document.getElementById('playButton').addEventListener('click', function() {
    if (playlist.length === 0) return;
    currentSongIndex = (currentSongIndex === -1) ? 0 : currentSongIndex;

    // Ensure the player is ready and defined before calling getPlayerState
    if (playerReady && typeof player.getPlayerState === 'function') {
        // If the player is paused or not started, resume the current song
        if (player.getPlayerState() === YT.PlayerState.PAUSED || player.getPlayerState() === YT.PlayerState.UNSTARTED) {
            player.playVideo();
        } else {
            playSong(playlist[currentSongIndex], true); // Restart only if not paused
        }
    } else {
        console.log("Player is not ready yet or player state function is not available.");
    }
});

// Skip next button event listener
document.getElementById('skipNextButton').addEventListener('click', function() {
    if (playlist.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    playSong(playlist[currentSongIndex]);
});

// Skip previous button event listener
document.getElementById('skipPreviousButton').addEventListener('click', function() {
    if (playlist.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[currentSongIndex]);
});

// Play the current song
function playSong(videoId, restart = false) {
    if (playerReady) {
        console.log("Playing video ID:", videoId);
        if (restart) {
            player.loadVideoById(videoId); // Load the song from the start
        }
        player.playVideo(); // Play or resume the song
        startProgressBar();
    } else {
        console.log("Player not ready yet.");
    }
}

// Update playlist display
function updatePlaylistDisplay() {
    const tbody = document.querySelector('#playlist tbody');
    tbody.innerHTML = ''; // Clear existing entries
    playlist.forEach((videoId, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>Video ID: ${videoId}</td>`;
        tbody.appendChild(row);
    });
}

// Extract video ID from URL
function extractVideoID(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}

// Handle state changes, like video ending
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        console.log("Video ended, moving to next song.");
        document.getElementById('skipNextButton').click(); // Automatically skip to next
    }
}

// Progress bar functionality
function startProgressBar() {
    // Clear any existing intervals to avoid duplicates
    clearInterval(progressInterval);

    // Update progress bar every second
    progressInterval = setInterval(() => {
        if (playerReady) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            const progressBar = document.getElementById('progressBar');
            if (duration > 0) {
                progressBar.value = (currentTime / duration) * 100; // Update progress bar
            }
        }
    }, 1000);
}

// Call this function to stop the progress bar when the player stops
function stopProgressBar() {
    clearInterval(progressInterval);
}