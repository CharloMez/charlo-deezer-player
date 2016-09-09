(function() {
    document.getElementById('playlist_button').addEventListener("click", Project.load('playlist', Project.loadPlaylist), false);
    document.getElementById('login').addEventListener("click", Project.loginDeezer());
})();
