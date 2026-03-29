import "locomotive-scroll/dist/locomotive-scroll.css";

import { AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import { ThemeProvider } from "styled-components";

import Loader from "./components/Loader";
import ScrollTriggerProxy from "./components/ScrollTriggerProxy";
import About from "./sections/About";
import Partnerships from "./sections/Partnerships"; 
import Footer from "./sections/Footer";
import Home from "./sections/Home";
import Marquee from "./sections/Marquee";
import NewArrival from "./sections/NewArrival";
import Shop from "./sections/Shop";
import GlobalStyles from "./styles/GlobalStyles";
import { dark } from "./styles/Themes";
import Achievements from "./sections/Achievements";
import Contact from "./sections/Contact";

function App() {
  const containerRef = useRef(null);
  const [Loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 3000);
  }, []);

  useEffect(() => {
    const signature = `
      %c Developed by Hachem Squalli Elhoussaini 
      %c ----------------------------------------
      Find me on LinkedIn: https://www.linkedin.com/in/hachem-squalli-elhoussaini-2a7957250/
      
      (c) 2025 - Builted with ❤️.
    `;
    
    // The first style is for the big text, the second for the separator
    console.log(
      signature, 
      "color: #3B5689; font-size: 20px; font-family: 'Orbitron', monospace; font-weight: bold;", 
      "color: #cbd5e1; font-size: 12px;"
    );
  }, []);

  return (
    <>
      <ThemeProvider theme={dark}>
        {/* FIX: GlobalStyles MOVED INSIDE HERE. It needs access to 'theme' */}
        <GlobalStyles />

        <LocomotiveScrollProvider
          options={{
            smooth: true,
            smartphone: {
              smooth: true,
            },
            tablet: {
              smooth: true,
            },
          }}
          watch={
            [
              //..all the dependencies you want to watch to update the scroll.
            ]
          }
          containerRef={containerRef}
        >
          <AnimatePresence>{Loaded ? null : <Loader />}</AnimatePresence>
          <main className="App" data-scroll-container ref={containerRef}>
            <ScrollTriggerProxy />
            <AnimatePresence>
              {Loaded ? null : <Loader />}

              <Home key="home" />
              <About key="about" />
              <Shop key="Shop" />
              <Marquee key="marquee" />
              
              {/* Switched NewArrival to Activities for SecOps context */}
              <NewArrival key="newarrival" />
              
              <Partnerships key="partnerships" />
              <Achievements key="achievements" />
              <Contact key="contact" />
              <Footer key="Footer" />
            </AnimatePresence>
          </main>
        </LocomotiveScrollProvider>
      </ThemeProvider>
    </>
  );
}

export default App;