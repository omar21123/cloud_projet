import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";

import aboutImg1 from "../assets/Images/About_us_images/1.webp";
import aboutImg2 from "../assets/Images/About_us_images/2.webp";
import aboutImg3 from "../assets/Images/About_us_images/3.webp";
import aboutImg4 from "../assets/Images/About_us_images/4.webp";
import aboutImg5 from "../assets/Images/About_us_images/5.webp";
import aboutImg6 from "../assets/Images/About_us_images/557438579_17940091752071436_6234956126754424450_n.webp";
import aboutImg7 from "../assets/Images/About_us_images/563351333_17941131735071436_6831811461857987151_n.webp";
import aboutImg8 from "../assets/Images/About_us_images/1734534244061.jpg";
import aboutImg9 from "../assets/Images/About_us_images/1745839530906.jpg";
import aboutImg10 from "../assets/Images/About_us_images/1752128557604.jpg";

const IMAGE_POOL = [

  aboutImg6,
  aboutImg7,
  aboutImg8,
  aboutImg9,
  aboutImg10,
];

const Section = styled.section`
  min-height: 100vh;
  width: 80vw;
  margin: 0 auto;
  position: relative;
  display: flex;

  @media (max-width: 48em) {
    width: 90vw;
  }

  @media (max-width: 30em) {
    width: 100vw;
  }
`;

const Left = styled.div`
  width: 50%;
  font-size: ${(props) => props.theme.fontlg};
  font-weight: 300;
  position: relative;
  z-index: 5;
  margin-top: 20%;

  @media (max-width: 64em) {
    width: 80%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) !important;
    margin: 0 auto;
    padding: 2rem;
    font-weight: 600;
    backdrop-filter: blur(2px);
    background-color: ${(props) => `rgba(${props.theme.textRgba},0.4)`};
    border-radius: 20px;
  }

  @media (max-width: 48em) {
    font-size: ${(props) => props.theme.fontmd};
  }

  @media (max-width: 30em) {
    font-size: ${(props) => props.theme.fontsm};
    padding: 2rem;
    width: 70%;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
  
  /* Glitch layers - visible by default */
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(${(props) => props.imgSrc});
    background-size: cover;
    background-position: center;
    mix-blend-mode: screen;
    opacity: 0.8;
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
                opacity 0.3s ease;
    will-change: transform, opacity;
  }

  /* Cyan layer shifted */
  &::before {
    filter: hue-rotate(90deg);
    transform: translate(4px, -2px);
  }

  /* Magenta layer shifted */
  &::after {
    filter: hue-rotate(-90deg);
    transform: translate(-4px, 2px);
  }

  /* Base image slightly dimmed by default */
  img {
    width: 100%;
    height: auto;
    display: block;
    opacity: 0.7;
    transition: opacity 0.3s ease;
    will-change: opacity;
  }

  /* On hover: reset to normal state */
  &:hover {
    img {
      opacity: 1;
    }

    &::before,
    &::after {
      transform: translate(0, 0);
      opacity: 0;
    }
  }
`;

const Right = styled.div`
  width: 50%;
  position: relative;

  ${ImageWrapper} {
    width: 100%;
    height: auto;
  }
  
  .small-img-1 {
    width: 40%;
    position: absolute;
    right: 95%;
    bottom: 10%;
  }

  .small-img-2 {
    width: 40%;
    position: absolute;
    left: 80%;
    top: 30%;
  }

  @media (max-width: 64em) {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    ${ImageWrapper}:not(.small-img-1):not(.small-img-2) {
      width: 100%;
      height: 100vh;
      
      img {
        object-fit: cover;
        height: 100%;
      }
    }

    .small-img-1 {
      width: 30%;
      height: auto;
      left: 5%;
      bottom: 10%;
    }

    .small-img-2 {
      width: 30%;
      height: auto;
      position: absolute;
      left: 60%;
      bottom: 20%;
    }
  }
`;

const Title = styled.h1`
  font-size: ${(props) => props.theme.fontBig};
  font-family: "Share Tech Mono", monospace;
  font-weight: 400;
  position: absolute;
  top: 1rem;
  left: 5%;
  z-index: 5;

  @media (max-width: 64em) {
    font-size: ${(props) => `calc(${props.theme.fontBig} - 5vw)`};
    top: 0;
    left: 0%;
  }

  @media (max-width: 48em) {
    font-size: ${(props) => props.theme.fontxxxl};
  }
`;

const getRandomImages = (count, pool) => {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const About = () => {
  const [images, setImages] = useState(() => 
    getRandomImages(3, IMAGE_POOL)
  );

  useEffect(() => {
    setImages(getRandomImages(3, IMAGE_POOL));
  }, []);

  const [img1, img2, img3] = images;

  return (
    <Section id="fixed-target" className="about">
      <Title
        data-scroll
        data-scroll-speed="-2"
        data-scroll-direction="horizontal"
      >
        About Us
      </Title>
      <Left data-scroll data-scroll-sticky data-scroll-target="#fixed-target">
        A club in the national school of applied sciences in Fez, founded to
        develop students' skills and knowledge about security through practical
        workshops, competitions, courses, and conferences provided by security
        experts.
      </Left>

      <Right>
        <ImageWrapper imgSrc={img1}>
          <img width="400" height="600" src={img1} alt="About Us" />
        </ImageWrapper>

        <ImageWrapper
          className="small-img-1"
          data-scroll
          data-scroll-speed="5"
          imgSrc={img2}
        >
          <img width="400" height="600" src={img2} alt="About Us" />
        </ImageWrapper>

        <ImageWrapper
          className="small-img-2"
          data-scroll
          data-scroll-speed="-2"
          imgSrc={img3}
        >
          <img width="400" height="600" src={img3} alt="About Us" />
        </ImageWrapper>
      </Right>
    </Section>
  );
};

export default About;