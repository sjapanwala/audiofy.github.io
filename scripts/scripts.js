let player;
let playlist = [];
let currentSongIndex = -1;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('playerContainer', {
        height: '0', // Hide the video
        width: '0',  // Hide the video
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'mute': 1 // Start muted for autoplay
        }
    });
}

document.getElementById('submitButton').addEventListener('click', function() {
    const urlInput = document.getElementById('urlInput').value;
    const videoId = extractVideoID(urlInput);
    
    if (videoId && !playlist.includes(videoId)) {
        playlist.push(videoId);
        updatePlaylistDisplay();
        document.getElementById('urlInput').value = ''; // Clear the input
    }
});

document.getElementById('playButton').addEventListener('click', function() {
    if (playlist.length === 0) return;
    currentSongIndex = (currentSongIndex === -1) ? 0 : currentSongIndex;
    playSong(playlist[currentSongIndex]);
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

function playSong(videoId) {
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}

function updatePlaylistDisplay() {
    const tbody = document.querySelector('#playlist tbody');
    tbody.innerHTML = ''; // Clear existing entries
    playlist.forEach((videoId, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${videoId}</td>`;
        tbody.appendChild(row);
    });
}

function extractVideoID(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}
