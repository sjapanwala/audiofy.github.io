// Show the custom modal when the page loads
window.onload = function() {
    const modal = document.getElementById("modal");
    const confirmButton = document.getElementById("confirmButton");
    const closeButton = document.getElementById("close");

    // Display the modal
    modal.style.display = "block";

    // Close the modal when the user clicks on <span> (x)
    closeButton.onclick = function() {
        modal.style.display = "none";
    }

    // Close the modal when the user clicks the "OK" button
    confirmButton.onclick = function() {
        modal.style.display = "none"; // Hide the modal
    }

    // Close the modal when clicking outside of the modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none"; // Hide the modal
        }
    }
};

let player;
let playlist = [];
let currentSongIndex = -1;
let playerReady = false;
let progressInterval = null;

// Ensure this is globally accessible
function onYouTubeIframeAPIReady() {
    player = new YT.Player('playerContainer', {
        height: '0',
        width: '0',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'mute': 0
        },
        events: {
            'onReady': function() {
                playerReady = true;
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

document.getElementById('submitButton').addEventListener('click', function() {
    const urlInput = document.getElementById('urlInput').value;
    const videoId = extractVideoID(urlInput);
    
    if (videoId && !playlist.includes(videoId)) {
        playlist.push(videoId);
        updatePlaylistDisplay();
        document.getElementById('urlInput').value = '';
    }
});

document.getElementById('playButton').addEventListener('click', function() {
    if (playlist.length === 0) return;
    currentSongIndex = (currentSongIndex === -1) ? 0 : currentSongIndex;
    
    // If the player is paused or not playing, resume the current song
    if (player.getPlayerState() === YT.PlayerState.PAUSED || player.getPlayerState() === YT.PlayerState.UNSTARTED) {
        player.playVideo();
    } else {
        playSong(playlist[currentSongIndex], true); // Restart only if not paused
    }
});

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
   

document.getElementById('pauseButton').addEventListener('click', function() {
    if (playerReady) player.pauseVideo();
});

document.getElementById('skipNextButton').addEventListener('click', function() {
    if (playlist.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    playSong(playlist[currentSongIndex]);
});

document.getElementById('skipPreviousButton').addEventListener('click', function() {
    if (playlist.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[currentSongIndex]);
});

function playSong(videoId, restart = false) {
    if (playerReady) {
        console.log("Playing video ID:", videoId);
        if (restart) {
            player.seekTo(0); // Restart song from the beginning
        }
        player.loadVideoById(videoId);
        player.playVideo();

        // Start the progress update
        if (progressInterval) clearInterval(progressInterval); // Clear any existing intervals
        progressInterval = setInterval(updateProgressBar, 1000); // Update progress every second
    } else {
        console.log("Player not ready yet.");
    }
}

function updateProgressBar() {
    if (playerReady) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const progress = (currentTime / duration) * 100;

        if (!isNaN(progress)) {
            document.getElementById('progressBar').value = progress;
        }

        if (!isNaN(currentTime) && !isNaN(duration)) {
            document.getElementById('videoDuration').innerText = `${formatDuration(currentTime)} / ${formatDuration(duration)}`;
        }
    }
}


function updatePlaylistDisplay() {
    const tbody = document.querySelector('#playlist tbody');
    tbody.innerHTML = ''; // Clear the current playlist display
    playlist.forEach((videoId, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}. ${videoId}</td>`; // Display the index as a counter
        tbody.appendChild(row); // Append the row to the table body
    });
}

function extractVideoID(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        document.getElementById('skipNextButton').click();
    }
    
    if (event.data == YT.PlayerState.PLAYING) {
        updateVideoInfo();
    }
}


function updateVideoInfo() {
    if (playerReady) {
        const videoData = player.getVideoData();
        if (videoData && videoData.title) {
            document.getElementById('videoTitle').innerText = `Now Playing\n ${videoData.title}`;dy
        }
    }
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Export playlist as JSON and download it
document.getElementById('exportButton').addEventListener('click', function() {
    if (playlist.length === 0) {
        alert('Error: You cannot export an empty playlist.');
        return; // Stop the function from continuing
    }
    
    const jsonPlaylist = JSON.stringify(playlist);
    const blob = new Blob([jsonPlaylist], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.json';
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
});

// Show the file input when 'Import Playlist' is clicked
document.getElementById('importButton').addEventListener('click', function() {
    document.getElementById('importFileInput').click();
});

// Handle importing JSON file
document.getElementById('importFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedPlaylist = JSON.parse(e.target.result);
                if (Array.isArray(importedPlaylist)) {
                    playlist = importedPlaylist; // Overwrite the current playlist with the imported one
                    updatePlaylistDisplay(); // Update the playlist UI
                } else {
                    alert('Invalid playlist format.');
                }
            } catch (error) {
                alert('Error reading playlist file.');
            }
        };
        reader.readAsText(file);
    }
});
