(function() {
    document.getElementById('playlist_button').onclick(Project.load('playlist', Project.loadPlaylist));
    document.getElementById('login').onclick(Project.loginDeezer());
})();
