// code about interacting with Spotify 
const clientId = '25c0801a9ef74883bfd2aa75c6c96094';
const redirectUri = 'http://localhost:3000/';
const scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';

const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Request User Authorization - needed: client_id, response_type, redirect_uri, state, scope, code_challenge_method(S256), code_challenge
const spotifyLogInRedirect = async () => {
    // PKCE Code Verifier
    const codeVerifier = generateRandomString(64);

    // PKCE Code Challenge
    const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
    }
    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    }
    const codeChallenge = base64encode(await sha256(codeVerifier));
    console.log('CC: ', codeChallenge);
    console.log('CV1: ', codeVerifier);
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    // previously generated above
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}


// requesting an access token from Spotify
const getSpotifyToken = async code => {
    const codeVerifier = localStorage.getItem('code_verifier');
    console.log('CV2:', codeVerifier)
    console.log('CODE: ', code)
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'client_id': clientId,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirectUri,
            'code_verifier': codeVerifier,
        }),
    }
    console.log(payload.body.toString())
    try {
        const url = `https://accounts.spotify.com/api/token`;
        const response = await fetch(url, payload);
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('access_token', response.access_token);
        }
        else {
            console.error(data.error_description);
            return {
                error: data.error,
                error_description: data.error_description
            }
        }
    }
    catch (err) {
        console.error(err);
        return {
            error: err.name,
            error_description: err.message
        }
    }

}


// TODO handle expired token

// default headers object
let myHeaders = {
    "Authorization": `Bearer ${localStorage.getItem('access_token')}`
};

// Search Spotify
const searchSpotify = async query => {
    const url = `https://api.spotify.com/v1/search?q=${query}&type=album,artist,track`;
    try {
        const response = await fetch(url, {
            headers: myHeaders,
        });
        const data = await response.json();

        if (response.ok) {
            return {
                results: data.tracks
            }
        }
        else {
            console.error(data.error.message);
            return {
                error: data.error.status,
                error_description: data.error.message
            }
        }
    } 
    catch (error) {
        console.error(error.message);
        return {
            error: error.name,
            error_description: error.message
        };
    };
};


// get spotify user id
const getSpotifyId = async () => {
    const url = `https://api.spotify.com/v1/me`;
    try {
        const response = await fetch(url, {
            headers: myHeaders,
        });
        const data = await response.json();

        if (response.ok) {
            return {
                results: data.id
            }
        }
        else {
            console.error(data.error.message);
            return {
                error: data.error.status,
                error_description: data.error.message
            }
        }
    } 
    catch (error) {
        console.error(error.message);
        return {
            error: error.name,
            error_description: error.message
        };
    };
};


// creating a playlist
const createSpotifyPlaylist = async () => {
    const user_id = (await getSpotifyId()).results;
    const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
    const newPlaylist = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...myHeaders,
        },
        body: JSON.stringify({
            name: `Playlist by Jammming ${Date.now()}`,
        }),
    }
    try {
        const response = await fetch(url, newPlaylist);
        const data = await response.json();

        if (response.ok) {
            return {
                results: data
            }
        }
        else {
            console.error(data.error.message);
            return {
                error: data.error.status,
                error_description: data.error.message
            }
        }
    } 
    catch (error) {
        console.error(error.message);
        return {
            error: error.name,
            error_description: error.message
        };
    };
};


// adding things to playlist
const addToSpotifyPlaylist = async (playlistId, tracks) => {
    const user_id = (await getSpotifyId()).results;
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const uris = tracks.filter((track) => track.uri);
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...myHeaders,
        },
        body: JSON.stringify({
            uris: uris
        }),
    }
    try {
        const response = await fetch(url, params);
        const data = await response.json();

        if (response.ok) {
            return {
                results: data
            }
        }
        else {
            console.error(data.error.message);
            return {
                error: data.error.status,
                error_description: data.error.message
            }
        }
    } 
    catch (error) {
        console.error(error.message);
        return {
            error: error.name,
            error_description: error.message
        };
    };
};


// delete things to playlist
const deleteFromSpotifyPlaylist = async (playlistId, tracks) => {
    const user_id = (await getSpotifyId()).results;
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const params = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...myHeaders,
        },
        body: JSON.stringify({
            tracks: tracks
        }),
    }
    try {
        const response = await fetch(url, params);
        const data = await response.json();

        if (response.ok) {
            return {
                results: data
            }
        }
        else {
            console.error(data.error.message);
            return {
                error: data.error.status,
                error_description: data.error.message
            }
        }
    } 
    catch (error) {
        console.error(error.message);
        return {
            error: error.name,
            error_description: error.message
        };
    };
};


const spotifyLoginImplicit = () => {
    const state = generateRandomString(16);

    localStorage.setItem('stateKey', state);
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    const params = {
        response_type: 'token',
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

module.exports = { spotifyLogInRedirect, getSpotifyToken, searchSpotify, createSpotifyPlaylist, addToSpotifyPlaylist, deleteFromSpotifyPlaylist, spotifyLoginImplicit };