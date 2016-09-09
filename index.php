<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="http://cdn-files.deezer.com/js/min/dz.js"></script>
</head>
<body>

<div id="dz-root"></div>
<div id="player" style="width:100%;" align="center"></div>

<input type="button" onclick="loginDeezer()" value="Login"/>
<p id="name"></p>

<div id="playlist" hidden="hidden">
    <label>chargé une playlist via son url de partage</label>
    <br />
    <input size="100" type="text" id="playlist_url" >
    <br />
    <input type="button" onclick="load('playlist', loadPlaylist)" value="charger"/>
    <input type="hidden" id="playlist_id" value="-1">
</div>

<div id="song" hidden="hidden">
    <label>Ajouté une musique dans votre playlist via son url de partage</label>
    <br />
    <input size="100" type="text" id="track_url" >
    <br />
    <input type="button" onclick="load('track', loadTrack)" value="charger"/>
    <input type="hidden" id="track_id" value="-1">
</div>

<p style="color: red" id="error"></p>
<input type="hidden" id="access_token" value="-1">
<?php echo 'toto'; ?>
<?php header("Access-Control-Allow-Origin: *"); ?>
<script>
    function getElementId(url)
    {
        var elementId = -1;

        url = url.split('?');
        url = url[0].split('/');

        if (url.length > 0) {
            elementId = url[url.length - 1];
        }

        if (elementId !== -1 && !isNaN(parseInt(elementId))) {
            console.log('get playlist id = ' + parseInt(elementId));

            return parseInt(elementId);
        }

        return -1;
    }

    function load(type, callback)
    {
        console.log('loading ' + type);
        document.getElementById('error').innerHTML = '';

        var url = document.getElementById(type + '_url').value;
        var elementId = getElementId(url);

        if (elementId === -1) {
            document.getElementById('error').innerHTML = 'Enable to extract the ' + type + ' id';

            return false;
        }

        loadType(type, elementId, callback);

        return true;
    }

    function loadPlaylist(id)
    {
        console.log('loading playlist');
        document.getElementById('playlist_id').value = id;
        DZ.player.playPlaylist(id);
        document.getElementById('song').removeAttribute('hidden');
    }

    function loadTrack(id)
    {
        console.log('loading track');
        var playlistId = document.getElementById('playlist_id').value;
        var token = document.getElementById('access_token').value;
        console.log('playlist id to charge ' + playlistId);
        console.log('call url ' + '/playlist/' + playlistId + '/tracks?songs=' + id + '&access_token=' + token + 'request_method=POST');
/*        $.get('https://api.deezer.com/playlist/' + playlistId + '/tracks?songs=' + id + '&access_token=' + token + 'request_method=POST', function(data) {
            JSON.stringify(data);
        });*/
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                JSON.stringify(xhr.responseText);
            }
        };
        xhr.open('POST', 'https://api.deezer.com/playlist/' + playlistId + '/tracks?access_token=' + token);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send('songs=' + id + '&access_token=' + token);

        /*        DZ.api('https://api.deezer.com/playlist/' + playlistId + '/tracks?songs=' + id + '&access_token=' + token + 'request_method=POST', function(response) {
            console.log('response = ' + JSON.stringify(response));
            if (typeof response.error === "undefined") {
                console.log('track ok on playlist ! add to queue');
//                DZ.player.addToQueue([id]);
                DZ.player.playTracks();

                return true;
            }

            return false;
        });*/
/*        var form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', 'https://api.deezer.com/playlist/' + playlistId + '/tracks?access_token=' + token);

        var champCache = document.createElement('input');
        champCache.setAttribute('type', 'hidden');
        champCache.setAttribute('name', 'songs');
        champCache.setAttribute('value', id);
        form.appendChild(champCache);

        document.body.appendChild(form);
        form.submit();*/
    }

    function loginDeezer()
    {
        DZ.login(function(response) {
            if (response.authResponse) {
                console.log(JSON.stringify(response));
                document.getElementById('access_token').value = response.authResponse.accessToken;
                DZ.api('/user/me', function(response) {
                    document.getElementById('name').innerHTML = 'Salut ' + response.firstname;
                });

                document.getElementById('playlist').removeAttribute('hidden');
            } else {
                document.getElementById('error').innerHTML = 'An error occurred with login !';
            }
        }, {perms: 'manage_library,basic_access,email'});
    }

    function tracklistChanged()
    {
        console.log('tracklist has change');
    }

    function playerLoaded()
    {
        console.log('player is loaded');
        DZ.Event.subscribe('tracklist_changed', tracklistChanged);
    }

    function loadType(type, id, callback)
    {
        console.log('check is type ' + type);
        console.log('url = ' + '/' + type + '/' + id);
        DZ.api('/' + type + '/' + id, function(response) {
            console.log(JSON.stringify(response));
            console.log('typeof = ' + typeof response.error);
            if (typeof response.error === "undefined") {
                console.log('callback with id ' + id);
                callback(id);
            } else {
                document.getElementById('error').innerHTML = 'Not a valid ' + type;
            }
        });
    }

    DZ.init({
        appId : '190582',
        channelUrl : 'http://test.mobnweb.com/channel.html',
        player: {
            container : 'player',
            cover : true,
            playlist : true,
            width : 650,
            height : 300
        }
    });
    DZ.Event.subscribe('player_loaded', playerLoaded);
</script>

</body>
</html>