import React from 'react';
import { spotifyLoginImplicit } from '../utils/spotify';

function Login() {
    const handleLoginClick = async () => {
        try {
            await spotifyLoginImplicit();
        } catch (error) {
            console.error('Error during Spotify login redirect:', error);
        }
    };

    return (
        <div>
            <button onClick={handleLoginClick}>Login to Spotify Here</button>
        </div>
    )
}

export default Login;