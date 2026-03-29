import React, { useLayoutEffect, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styled from "styled-components";

import mariam from "../assets/Images/MARIAM.webp";
import houda from "../assets/Images/HOUDA.webp";
import omar from "../assets/Images/OMAR.webp";
import hachem from "../assets/Images/HACHEM.jpg";
import zakaria from "../assets/Images/ZAKARIA.jpg";

// --- DATA ---
const images = [mariam, houda, omar, hachem, zakaria];

const titles = [
  "Mariam Daoudi.",
  "Houda Belouti.",
  "Omar .",
  "Hachem Squalli ELhoussaini.",
  "Zakaria Ouadifi.",
];

const altTitles = [
  "EXIT8",
  "?????",
  "Aatrox",
  "HAZZINE_SAID",
  "ZAIKOS",
];

const professions = [
  "Club President",
  "Secretary General",
  "Vice President",
  "Technical Lead",
  "Training Lead",
];

const productLinks = [
  "https://linkedin.com",
  "https://linkedin.com",
  "https://linkedin.com",
  "https://linkedin.com",
  "https://linkedin.com",
];

// --- STYLES ---

const Section = styled(motion.section)`
  min-height: 100vh;
  height: auto;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  background-color: #3B5689; 
`;

const MainTitle = styled.h1`
  font-size: 3rem;
  font-family: "Orbitron", sans-serif;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: absolute;
  top: 1rem;
  left: 5%;
  z-index: 11;

  @media (max-width: 64em) { font-size: 2.5rem; }
  @media (max-width: 48em) { font-size: 2rem; }
`;

const Left = styled.div`
  width: 35%;
  background-color: rgba(3, 8, 40, 0.3); 
  color: #fff;
  min-height: 100vh;
  z-index: 10;
  position: fixed;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  
  p {
    font-size: 1.1rem;
    font-family: "Share Tech Mono", monospace;
    font-weight: 400;
    width: 80%;
    margin: 0 auto;
    line-height: 1.6;
    opacity: 0.9;
  }
  @media (max-width: 48em) {
    width: 40%;
    p { font-size: 0.9rem; }
  }
`;

const Right = styled.div`
  position: absolute;
  left: 35%;
  padding-left: 30%;
  min-height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const Scanner = styled.div`
  position: fixed;
  right: 50%;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 650px;
  z-index: 100;
  pointer-events: none;
  background: transparent;
  opacity: 0; 
`;

const Item = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 20rem;
  margin-right: 6rem;
  position: relative;
  @media (max-width: 48em) { width: 15rem; }
`;

const TitleWrapper = styled.div`
  text-align: center;
  margin-top: 1rem;
  cursor: pointer;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StyledText = styled.h2`
  font-weight: 700;
  font-family: "Orbitron", sans-serif;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-size: 1.5rem;
   
  &.alt-mode {
    font-family: "Share Tech Mono", monospace;
    font-size: 1.5rem;
    color: #eef2f9;
    letter-spacing: 2px;
  }
`;

const Subtitle = styled.span`
  font-family: "Share Tech Mono", monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 500px; 
  overflow: hidden;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background-color: #000;
`;

const NormalImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: ${props => props.$clipPath || 'inset(0 0 0 0)'};
  transition: filter 0.3s ease;
  filter: brightness(1.1) contrast(1.1);

  &:hover {
    filter: brightness(1.2) contrast(1.2);
  }
`;

const AsciiOverlay = styled.pre`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: "Share Tech Mono", monospace;
  font-size: 10px;
  line-height: 10px;
  font-weight: bold;
  color: #fff;
  background: #030C30;
  overflow: hidden;
  white-space: pre;
  clip-path: ${props => props.$clipPath || 'inset(0 100% 0 0)'};
  text-shadow: 
    2px 0px 1px rgba(255,0,0,0.5),
    -2px 0px 1px rgba(0,0,255,0.5);
  pointer-events: none;
  letter-spacing: 0px;
`;

// --- NEW GENERATION LOGIC ---
// This function now switches algorithms based on the 'index' of the team member
const generateAsciiArt = (width, height, index) => {
  const rows = Math.floor(height / 10);
  const cols = Math.floor(width / 6); 
  let result = "";

  // Define different character sets
  const densityChars = "█▓▒░:. ";
  const techChars = "0110101";
  const matrixChars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";
  const circuitChars = "|/-\\";

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let char = " ";
      
      // --- PATTERN 1: MARIAM (Classic Sine Waves) ---
      if (index === 0) {
        const noise = Math.random() * 0.5;
        const val = Math.sin(i * 0.1 + noise) * Math.cos(j * 0.1 + noise);
        char = val > 0.5 ? "█" : (val > 0.2 ? "▒" : ".");
      }
      
      // --- PATTERN 2: HOUDA (Matrix Rain - Vertical Lines) ---
      else if (index === 1) {
        // Random start points for "rain"
        if (Math.random() > 0.92) {
            char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        } else if (j % 5 === 0 && Math.random() > 0.8) {
            char = "│";
        } else {
            char = " ";
        }
      }

      // --- PATTERN 3: OMAR (Heavy Block Noise / Glitch) ---
      else if (index === 2) {
        const blocky = Math.tan(i * j * 0.01);
        if (blocky > 1.5) char = "█";
        else if (blocky > 0.5) char = "▓";
        else if (Math.random() > 0.9) char = "░";
      }

      // --- PATTERN 4: HACHEM (Circuit / Binary / Tech) ---
      else if (index === 3) {
         if ((i + j) % 4 === 0) {
             char = techChars[Math.floor(Math.random() * techChars.length)];
         } else if (Math.random() > 0.95) {
             char = "+";
         } else {
             char = " ";
         }
      }

      // --- PATTERN 5: ZAKARIA (High Frequency Static) ---
      else {
        const staticNoise = Math.random();
        if (staticNoise > 0.8) char = densityChars[Math.floor(Math.random() * 3)];
        else if (staticNoise > 0.6) char = ".";
        else char = " ";
      }

      result += char;
    }
    result += "\n";
  }
  return result;
};

const ScrambleText = ({ text, altText, profession }) => {
  const [display, setDisplay] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

  const startScramble = () => {
    setIsHovered(true);
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplay(prev => 
        altText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return altText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= altText.length) {
        clearInterval(intervalRef.current);
      }
      iteration += 1 / 2; 
    }, 30);
  };

  const resetText = () => {
    setIsHovered(false);
    clearInterval(intervalRef.current);
    setDisplay(text);
  };

  return (
    <TitleWrapper onMouseEnter={startScramble} onMouseLeave={resetText}>
      <StyledText className={isHovered ? "alt-mode" : ""}>
        {display}
      </StyledText>
      <Subtitle>{profession}</Subtitle>
    </TitleWrapper>
  );
};

// --- MAIN COMPONENT ---

const Product = ({ img, title, altTitle, profession, url, index }) => {
  const itemRef = useRef(null);
  const [clipData, setClipData] = useState({ normal: 'inset(0 0 0 0)', ascii: 'inset(0 100% 0 0)' });
  const [asciiArt, setAsciiArt] = useState("");

  useEffect(() => {
    // Pass the actual index (0, 1, 2...) instead of a random seed
    setAsciiArt(generateAsciiArt(350, 600, index));
  }, [index]);

  useEffect(() => {
    const updateClipping = () => {
      if (!itemRef.current) return;

      const rect = itemRef.current.getBoundingClientRect();
      const scannerX = window.innerWidth * 0.347; 
      
      const cardLeft = rect.left;
      const cardWidth = rect.width;
      
      const relativeX = scannerX - cardLeft;
      
      let percentage = (relativeX / cardWidth) * 100;

      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;

      setClipData({
        normal: `inset(0 0 0 ${percentage}%)`,
        ascii: `inset(0 ${100 - percentage}% 0 0)`
      });
    };

    const interval = setInterval(updateClipping, 10);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    window.open(url, "_blank");
  };

  return (
    <Item
      ref={itemRef}
      initial={{ filter: "grayscale(100%)" }}
      whileInView={{ filter: "grayscale(0%)" }}
      transition={{ duration: 0.5 }}
      viewport={{ once: false, amount: "all" }}
    >
      <ImageWrapper onClick={handleClick}>
        <NormalImage src={img} alt={title} $clipPath={clipData.normal} />
        <AsciiOverlay $clipPath={clipData.ascii}>{asciiArt}</AsciiOverlay>
      </ImageWrapper>
      
      <ScrambleText text={title} altText={altTitle} profession={profession} />
    </Item>
  );
};

const Shop = () => {
  gsap.registerPlugin(ScrollTrigger);
  const ref = useRef(null);
  const horizontalRef = useRef(null);

  useLayoutEffect(() => {
    let element = ref.current;
    let scrollingElement = horizontalRef.current;
    let pinWrapWidth = scrollingElement.offsetWidth;
    let t1 = gsap.timeline();

    setTimeout(() => {
      t1.to(element, {
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: `${pinWrapWidth} bottom`,
          scroller: ".App", 
          scrub: 1,
          pin: true,
        },
        height: `${scrollingElement.scrollWidth}px`,
        ease: "none",
      });

      t1.to(scrollingElement, {
        scrollTrigger: {
          trigger: scrollingElement,
          start: "top top",
          end: `${pinWrapWidth} bottom`,
          scroller: ".App",
          scrub: 1,
        },
        x: -pinWrapWidth,
        ease: "none",
      });
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      t1.kill();
      ScrollTrigger.kill();
    };
  }, []);

  return (
    <Section ref={ref} id="team">
      <MainTitle data-scroll data-scroll-speed="-1">
        Core Team
      </MainTitle>
      
      <Scanner />
      
      <Left>
        <p>
          Meet the minds behind the operation. 
          <br /><br />
          Our members are specialists in various fields of cybersecurity, from cryptography to network defense.
          <br /> <br />
          Hover over a member to reveal their system alias.
        </p>
      </Left>
      
      <Right data-scroll ref={horizontalRef}>
        {images.map((img, index) => (
          <Product 
            key={index} 
            index={index} 
            img={img} 
            title={titles[index]} 
            altTitle={altTitles[index]}
            profession={professions[index]}
            url={productLinks[index]}
          />
        ))}
      </Right>
    </Section>
  );
};

export default Shop;