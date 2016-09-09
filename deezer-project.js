var Project = (function() {
    var self = {
        currentIndex: 0,
        playlistId: -1,
        appId: '',
        channelUrl: '',
        trackId: -1,
        accessToken: ''
    };

    /**
     * Initialize deezer player
     *
     * @param appId
     * @param channelUrl
     * @param callback
     */
    self.init = function(appId, channelUrl, callback) {
        self.appId = appId;
        self.channelUrl = channelUrl;

        DZ.init({
            appId : self.appId,
            channelUrl : self.channelUrl,
            player: {
                container : 'player',
                cover : true,
                playlist : true,
                width : 650,
                height : 300
            }
        });

        DZ.Event.subscribe('player_loaded', callback);
    };

    /**
     * Extract an element id from deezer share url
     *
     * @param url
     *
     * @returns {*}
     */
    var getElementId = function(url) {
        var elementId = -1;

        url = url.split('?');
        url = url[0].split('/');

        if (url.length > 0) {
            elementId = url[url.length - 1];
        }

        if (elementId !== -1 && !isNaN(parseInt(elementId))) {

            return parseInt(elementId);
        }

        return -1;
    };

    /**
     * extract, check type, and load an element
     *
     * @param type
     * @param callback
     *
     * @returns {boolean}
     */
    self.load = function(type, callback) {
        document.getElementById('error').innerHTML = '';

        var url = document.getElementById(type + '_url').value;
        var elementId = getElementId(url);

        if (elementId === -1) {
            document.getElementById('error').innerHTML = 'Enable to extract the ' + type + ' id';

            return false;
        }

        loadType(type, elementId, callback);

        return true;
    };

    /**
     * Load a playlist to the player
     * and display the interface song part
     */
    self.loadPlaylist = function() {
        DZ.player.playPlaylist(parseInt(self.playlistId), parseInt(self.currentIndex));

        document.getElementById('song').removeAttribute('hidden');
    };

    /**
     * Load a new track on the current playlist
     * and reload the player
     */
    self.loadTrack = function() {
        var xhr = new XMLHttpRequest();

        xhr.open('POST', 'https://api.deezer.com/playlist/' + self.playlistId + '/tracks?access_token=' + self.accessToken);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send('songs=' + self.trackId + '&access_token=' + self.accessToken);

        self.currentIndex = DZ.player.getCurrentIndex();

        var player = document.getElementById('dzplayer');
        player.parentNode.removeChild(player);
        self.init(self.appId, self.channelUrl, self.loadPlaylist);
    };

    /**
     * Log the user on deezer
     * and ask for autorizations
     */
    self.loginDeezer = function() {
        DZ.login(function(response) {
            if (response.authResponse) {
                self.accessToken = response.authResponse.accessToken;
                DZ.api('/user/me', function(response) {
                    document.getElementById('name').innerHTML = 'Salut ' + response.firstname;
                });

                document.getElementById('playlist').removeAttribute('hidden');
            } else {
                document.getElementById('error').innerHTML = 'An error occurred with login !';
            }
        }, {perms: 'manage_library,basic_access,email'});
    };

    /**
     * Loaded player event
     */
    self.playerLoaded = function() {
        console.log('player is loaded');
    };

    /**
     * check if the current id correspond to the require type
     * And then call the right function to load it
     *
     * @param type
     * @param id
     * @param callback
     */
    var loadType = function(type, id, callback) {
        DZ.api('/' + type + '/' + id, function(response) {
            if (typeof response.error === "undefined") {
                self[type + 'Id'] = id;
                callback();
            } else {
                document.getElementById('error').innerHTML = 'Not a valid ' + type;
            }
        });
    };

    return self;
})();
