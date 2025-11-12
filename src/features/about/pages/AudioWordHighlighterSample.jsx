import React, { useRef, useState, useEffect } from 'react'
import imfAudio from './imf.mp3'
export default function AudioWordHighlighterSample() {
    const audioRef = useRef(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);

    const audioPlayerStyle = {
        width: '100%',
        marginBottom: '1rem',
        height: '40px',
        accentColor: '#28a745', // Green color for slider/progress
        borderRadius: '0px',
    };

    const transcript2 = [
        { word: "International", start: 0.0, end: 0.54 },
        { word: "Monetary", start: 0.54, end: 1.1 },
        { word: "Fund", start: 1.1, end: 1.5 },
        { word: "figures", start: 1.5, end: 1.98 },
        { word: "show", start: 1.98, end: 2.36 },
        { word: "Hungary", start: 2.36, end: 2.8 },
        { word: "bought", start: 2.8, end: 3.12 },
        { word: "74", start: 3.12, end: 3.72 },
        { word: "%", start: 3.72, end: 4.2 },
        { word: "of", start: 4.2, end: 4.4 },
        { word: "its", start: 4.4, end: 4.58 },
        { word: "gas", start: 4.58, end: 4.8 },
        { word: "and", start: 4.8, end: 5.36 },
        { word: "86", start: 5.36, end: 5.72 },
        { word: "%", start: 5.72, end: 6.2 },
        { word: "of", start: 6.2, end: 6.36 },
        { word: "its", start: 6.36, end: 6.52 },
        { word: "oil", start: 6.52, end: 6.78 },
        { word: "from", start: 6.78, end: 7.04 },
        { word: "Russia", start: 7.04, end: 7.38 },
        { word: "in", start: 7.38, end: 7.62 },
        { word: "2024,", start: 7.62, end: 8.42 },
        { word: "warning", start: 8.96, end: 9.22 },
        { word: "that", start: 9.22, end: 9.46 },
        { word: "an", start: 9.46, end: 9.62 },
        { word: "EU", start: 9.62, end: 9.94 },
        { word: "-wide", start: 9.94, end: 10.32 },
        { word: "cutoff", start: 10.32, end: 10.84 },
        { word: "of", start: 10.84, end: 11.02 },
        { word: "Russian", start: 11.02, end: 11.34 },
        { word: "natural", start: 11.34, end: 11.68 },
        { word: "gas", start: 11.68, end: 12.02 },
        { word: "alone", start: 12.02, end: 12.38 },
        { word: "could", start: 12.38, end: 12.76 },
        { word: "cost", start: 12.76, end: 13.06 },
        { word: "Hungary", start: 13.06, end: 13.48 },
        { word: "more", start: 13.48, end: 13.78 },
        { word: "than", start: 13.78, end: 13.94 },
        { word: "4", start: 13.94, end: 14.26 },
        { word: "%", start: 14.26, end: 14.64 },
        { word: "of", start: 14.64, end: 14.86 },
        { word: "its", start: 14.86, end: 15.06 },
        { word: "GDP.", start: 15.06, end: 15.46 },
        { word: "Orban", start: 16.5, end: 16.7 },
        { word: "said", start: 16.7, end: 16.98 },
        { word: "that,", start: 16.98, end: 17.24 },
        { word: "without", start: 17.44, end: 17.64 },
        { word: "the", start: 17.64, end: 17.9 },
        { word: "agreement,", start: 17.9, end: 18.24 },
        { word: "energy", start: 18.48, end: 18.68 },
        { word: "costs", start: 18.68, end: 19.0 },
        { word: "would", start: 19.0, end: 19.22 },
        { word: "have", start: 19.22, end: 19.34 },
        { word: "surged,", start: 19.34, end: 19.92 },
        { word: "hitting", start: 20.18, end: 20.34 },
        { word: "the", start: 20.34, end: 20.52 },
        { word: "wider", start: 20.52, end: 20.8 },
        { word: "economy,", start: 20.8, end: 21.42 },
        { word: "pushing", start: 21.86, end: 22.08 },
        { word: "up", start: 22.08, end: 22.3 },
        { word: "unemployment", start: 22.3, end: 22.88 },
        { word: "and", start: 22.88, end: 23.64 },
        { word: "generating", start: 23.64, end: 24.18 },
        { word: "unbearable", start: 24.18, end: 25.16 },
        { word: "price", start: 25.16, end: 25.6 },
        { word: "rises", start: 25.6, end: 25.92 },
        { word: "for", start: 25.92, end: 26.14 },
        { word: "households", start: 26.14, end: 26.54 },
        { word: "and", start: 26.54, end: 26.78 },
        { word: "firms.", start: 26.78, end: 27.16 }
    ]

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            const currentTime = audio.currentTime;
            const index = transcript2.findIndex(
                (item) => currentTime >= item.start && currentTime < item.end
            );
            setCurrentWordIndex(index);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
    }, []);

    const highlightStyle = {
        backgroundColor: '#ffeb3b',
        color: '#1a6708ff',
        fontWeight: 'bold',
        padding: '2px 4px',
        borderRadius: '3px',
        transition: 'background-color 0.2s ease',
    };

    return (
        <div style={{ padding: '20px' }}>
            <h5>Audio Transcript Service</h5>
            <audio ref={audioRef} controls style={audioPlayerStyle}>
                <source src={imfAudio} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
            <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                {transcript2.map((item, index) => (
                    <span
                        key={index}
                        style={index === currentWordIndex ? highlightStyle : {}}
                    >
                        {item.word}{' '}
                    </span>
                ))}
            </div>
        </div>
    )
}
