var Project = (function() {
    var appId = '';
    var channelUrl = '';
    var currentIndex = 0;
    var playlistId = -1;
    var trackId = -1;
    var accessToken;

    var init = function(appId, channelUrl, callback) {
        this.appId = appId;
        this.channelUrl = channelUrl;

        DZ.init({
            appId : this.appId,
            channelUrl : this.channelUrl,
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

    var load = function(type, callback) {
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

    var loadPlaylist = function() {
        var id = this.playlistId;
        var index = this.currentIndex;

        console.log('final playlist id = ' + id);
        console.log('final index = ' + index);
        DZ.player.playPlaylist(parseInt(id), parseInt(index));

        document.getElementById('song').removeAttribute('hidden');
    };

    var loadTrack = function() {
        var xhr = new XMLHttpRequest();

        xhr.open('POST', 'https://api.deezer.com/playlist/' + this.playlistId + '/tracks?access_token=' + this.accessToken);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send('songs=' + this.trackId + '&access_token=' + this.accessToken);

        this.currentIndex = DZ.player.getCurrentIndex();

        var player = document.getElementById('dzplayer');
        player.parentNode.removeChild(player);
        initPlayer(loadPlaylist);
    };

    var loginDeezer = function() {
        DZ.login(function(response) {
            if (response.authResponse) {
                console.log(JSON.stringify(response));
                this.accessToken = response.authResponse.accessToken;
                console.log('token = ' + this.accessToken);
                DZ.api('/user/me', function(response) {
                    document.getElementById('name').innerHTML = 'Salut ' + response.firstname;
                });

                document.getElementById('playlist').removeAttribute('hidden');
            } else {
                document.getElementById('error').innerHTML = 'An error occurred with login !';
            }
        }, {perms: 'manage_library,basic_access,email'});
    };

    var playerLoaded = function() {
        console.log('player is loaded');
    };

    var loadType = function(type, id, callback) {
        console.log('load type = ' + type);
        console.log('load type id = ' + id);
        DZ.api('/' + type + '/' + id, function(response) {
            if (typeof response.error === "undefined") {
                this[type + 'Id'] = id;
                console.log('store id type = ' + type + 'Id');
                console.log('store id [] = ' + this[type + 'Id']);
                console.log('test . = ' + this.playlistId);
                callback();
            } else {
                document.getElementById('error').innerHTML = 'Not a valid ' + type;
            }
        });
    };

    return {
        this
/*        init: init,
        loginDeezer: loginDeezer,
        load: load,
        loadPlaylist: loadPlaylist,
        loadTrack: loadTrack,
        playerLoaded: playerLoaded,
        playlistId: playlistId,
        currentIndex: currentIndex*/
    }
})();
