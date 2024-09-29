import { useEffect, useState } from 'react';

import Login from './components/Login';
import SearchResults from './components/SearchResults';
import './App.css';
import SearchBar from './components/SearchBar';


function App() {
    const URLSearchString = window.location.search;
    const params = new URLSearchParams(URLSearchString);
    const [accessToken, setAccessToken] = useState('');
    const [expiresAt, setExpiresAt] = useState(0);
    const [tracks, setTracks] = useState([]);
    const [playlistTracks, setPlaylistTracks] = useState([]);

    useEffect(() => {
        const urlToken = window.location.href.match(/access_token=([^&]*)/);
        if (urlToken) {
            const expiry = Date.now() + params.get('expires_in') - 30 * 1000;
            window.localStorage.setItem('access_token', urlToken[1]);
            window.localStorage.setItem('expires_at', expiry);
            setAccessToken(urlToken[1]);
            setExpiresAt(expiry);
        }
    }, []);

    return (
        <div className="App">
            {!window.localStorage.getItem('access_token') ? (
                <Login />
            ) : (
                <>
                    <header className='p-24'>
                        <SearchBar setTracks={setTracks} />
                    </header>
                    {tracks.length > 0 && (
                    <section className='mx-auto grid grid-cols-2'>
                        <SearchResults tracks={tracks} />
                        <div>
                            <h1>Playlist placeholder</h1>
                        </div>
                    </section>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
