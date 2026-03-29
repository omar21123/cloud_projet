import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

import img1 from '../assets/Images/11.webp';
import img2 from '../assets/Images/12.webp';
import img3 from '../assets/Images/13.webp';
import img4 from '../assets/Images/regionaltime.jpg';
import img5 from '../assets/Images/cloud1.webp';
import img6 from '../assets/Images/cloud2.jpg';




const DATA = [
  { id: 1, title: "Binary Exploitation", subtitle: "Memory Corruption Session", desc: "Breaking binaries, ROP chains, and bypassing protections in a controlled env.", images: [img1, img2, img3] },
  { id: 2, title: "CTF Victory", subtitle: "1st Place Regional", desc: "Team Old Timers secured Gold at CyberTech Day V2.0.", images: [img4] },
  { id: 3, title: "Cloud Masterclass", subtitle: "Azure & AWS Security", desc: "Deep dive into IaaS/PaaS models and shared responsibility.", images: [img5, img6] },
  { id: 4, title: "Network Analysis", subtitle: "Wireshark Deep Dive", desc: "Capturing live traffic and analyzing TCP handshakes.", images: [img3] },
];

const Section = styled.section`
  min-height: 100vh;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

/* The "window" frame - similar to NewArrival */
const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60vw;
  height: 70vh;
  box-shadow: 0 0 0 5vw ${(props) => props.theme.body};
  border: 1px solid ${(props) => props.theme.text};
  z-index: 11;
  pointer-events: none;

  @media (max-width: 70em) { width: 65vw; height: 65vh; }
  @media (max-width: 64em) { 
    width: 70vw; 
    height: 60vh;
    box-shadow: 0 0 0 20vw ${(props) => props.theme.body};
  }
  @media (max-width: 48em) { width: 80vw; height: 55vh; }
  @media (max-width: 30em) { width: 85vw; height: 50vh; }
`;

const Title = styled.h1`
  font-size: ${(props) => props.theme.fontxxxl};
  font-weight: 300;
  color: ${(props) => props.theme.text};
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 15;

  @media (max-width: 64em) { font-size: ${(props) => props.theme.fontxxl}; }
  @media (max-width: 48em) { font-size: ${(props) => props.theme.fontxl}; }
`;

/* Scrolling container - starts at top like NewArrival */
const Container = styled.div`
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 55vw;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: 64em) { width: 65vw; }
  @media (max-width: 48em) { width: 75vw; }
  @media (max-width: 30em) { width: 80vw; }
`;

/* Each slide item - moderate spacing */
const Item = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 5rem 0;
  width: 100%;
`;

/* Grid for images */
const GridBox = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  display: grid;
  gap: 8px;

  ${props => props.count === 1 && css`
    grid-template-columns: 1fr;
  `}
  ${props => props.count === 2 && css`
    grid-template-columns: 1fr 1fr;
  `}
  ${props => props.count >= 3 && css`
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    & > :nth-child(1) { grid-row: 1 / span 2; }
  `}
`;

/* Image wrapper - clips and centers any aspect ratio */
const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

/* Text card overlay */
const TextCard = styled.div`
  position: absolute;
  bottom: 12vh;
  left: 22vw;
  z-index: 15;
  width: 280px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1.25rem;

  @media (max-width: 64em) { left: 18vw; bottom: 15vh; }
  @media (max-width: 48em) {
    left: 50%;
    transform: translateX(-50%);
    bottom: 8vh;
    width: 75vw;
  }
`;

const FadeWrapper = styled.div`
  opacity: ${props => (props.visible ? 1 : 0)};
  transition: opacity 0.35s ease-in-out;
`;

const TextTitle = styled.h2`
  font-size: 1.6rem;
  color: #fff;
  margin-bottom: 0.4rem;
`;

const TextSubtitle = styled.h3`
  font-size: 0.75rem;
  color: #00d9ff;
  text-transform: uppercase;
  margin-bottom: 0.8rem;
  font-family: monospace;
`;

const TextDesc = styled.p`
  font-size: 0.85rem;
  line-height: 1.5;
  color: #ccc;
`;

const ActivitySlide = ({ images }) => (
  <Item>
    <GridBox count={images.length}>
      {images.map((src, i) => (
        <ImageWrapper key={i}>
          <img src={src} alt="activity" />
        </ImageWrapper>
      ))}
    </GridBox>
  </Item>
);

const Activities = () => {
  gsap.registerPlugin(ScrollTrigger);
  const ref = useRef(null);
  const scrollingRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayData, setDisplayData] = useState(DATA[0]);
  const [isVisible, setIsVisible] = useState(true);

  useLayoutEffect(() => {
    let element = ref.current;
    let scrollingElement = scrollingRef.current;
    let t1 = gsap.timeline();

    setTimeout(() => {
      let mainHeight = scrollingElement.scrollHeight;
      element.style.height = `calc(${mainHeight / 4}px)`;

      t1.to(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top top',
          end: 'bottom+=100% top-=100%',
          scroller: '.App',
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const newIndex = Math.min(
              Math.floor(progress * DATA.length),
              DATA.length - 1
            );
            setCurrentIndex(newIndex);
          },
        },
        ease: 'none',
      });

      t1.fromTo(
        scrollingElement,
        { y: '0' },
        {
          y: '-100%',
          scrollTrigger: {
            trigger: scrollingElement,
            start: 'top top',
            end: 'bottom top',
            scroller: '.App',
            scrub: 1,
          },
        }
      );

      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      t1.kill();
      ScrollTrigger.kill();
    };
  }, []);

  // Smooth CSS fade transition
  useEffect(() => {
    if (DATA[currentIndex] && DATA[currentIndex] !== displayData) {
      setIsVisible(false);
      const timeout = setTimeout(() => {
        setDisplayData(DATA[currentIndex]);
        setIsVisible(true);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, displayData]);

  return (
    <Section ref={ref} id="activities">
      <Overlay />

      <Title data-scroll data-scroll-speed="-2" data-scroll-direction="horizontal">
        Activities
      </Title>

      <Container ref={scrollingRef}>
        {DATA.map((item) => (
          <ActivitySlide key={item.id} images={item.images} />
        ))}
      </Container>

      <TextCard>
        <FadeWrapper visible={isVisible}>
          <TextTitle>{displayData.title}</TextTitle>
          <TextSubtitle>// {displayData.subtitle}</TextSubtitle>
          <TextDesc>{displayData.desc}</TextDesc>
        </FadeWrapper>
      </TextCard>
    </Section>
  );
};

export default Activities;