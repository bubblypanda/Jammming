import React from "react";


const SingleResult = (props) => {
    const data = props.data
    return (
        <div>
            <h2 className='text-lg'>{data.name}</h2>
            <p>{data.artists[0].name}</p>
        </div>
    );
};


function SearchResults(props) {
    return (
        <section>
            <h1>Cool Songs</h1>
            {props.tracks.map((track) => 
                <SingleResult data={track} />
            )}
        </section>
    )
}

export default SearchResults;