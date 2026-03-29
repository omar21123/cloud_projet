import '@fontsource/orbitron'; 
import '@fontsource/share-tech-mono';
// Keep this only if you still use "Kaushan Script" in other files, otherwise delete it
import '@fontsource/kaushan-script'; 

import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`

/* --- BASIC RESET --- */
*,*::before,*::after{
    margin: 0;
    padding: 0;
}

/* --- LOCOMOTIVE SCROLL FIX --- */
html.has-scroll-smooth {
    overflow: hidden;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;  
}

/* --- LAYOUT STABILITY --- */
html, body, #root, .App {
    width: 100%; 
    overflow-x: hidden !important;
}

/* --- THEME & FONTS --- */
body {
    font-family: "Orbitron", sans-serif;
    overflow-x: hidden;
    position: relative;
    background-color: ${props => props.theme.body};
    color: ${props => props.theme.text};
}

h1,h2,h3,h4,h5,h6{
    margin: 0;
    padding: 0;
}

a{
    color: inherit;
    text-decoration:none;
}
`;

export default GlobalStyles;