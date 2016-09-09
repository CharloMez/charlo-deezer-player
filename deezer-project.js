var Project = (function() {
    var self = {
        currentIndex: 0,
        playlistId: -1,
        appId: '',
        channelUrl: '',
        trackId: -1,
        accessToken: ''
    };

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

    self.load = function(type, callback) {
        console.log('load type = ' + type);
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

    self.loadPlaylist = function() {
        console.log('final playlist id = ' + self.playlistId);
        console.log('final index = ' + self.currentIndex);
        DZ.player.playPlaylist(parseInt(self.playlistId), parseInt(self.currentIndex));

        document.getElementById('song').removeAttribute('hidden');
    };

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

    self.loginDeezer = function() {
        DZ.login(function(response) {
            if (response.authResponse) {
                console.log(JSON.stringify(response));
                self.accessToken = response.authResponse.accessToken;
                console.log('token = ' + self.accessToken);
                DZ.api('/user/me', function(response) {
                    document.getElementById('name').innerHTML = 'Salut ' + response.firstname;
                });

                document.getElementById('playlist').removeAttribute('hidden');
            } else {
                document.getElementById('error').innerHTML = 'An error occurred with login !';
            }
        }, {perms: 'manage_library,basic_access,email'});
    };

    self.playerLoaded = function() {
        console.log('player is loaded');
    };

    var loadType = function(type, id, callback) {
        console.log('load type = ' + type);
        console.log('load type id = ' + id);
        DZ.api('/' + type + '/' + id, function(response) {
            if (typeof response.error === "undefined") {
                self[type + 'Id'] = id;
                console.log('store id type = ' + type + 'Id');
                console.log('store id [] = ' + self[type + 'Id']);
                console.log('test . = ' + self.playlistId);
                callback();
            } else {
                document.getElementById('error').innerHTML = 'Not a valid ' + type;
            }
        });
    };

    return self;
/*    return {
        init: init,
        loginDeezer: loginDeezer,
        load: load,
        loadPlaylist: loadPlaylist,
        loadTrack: loadTrack,
        playerLoaded: playerLoaded
    }*/
})();
