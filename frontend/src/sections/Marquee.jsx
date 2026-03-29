import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  min-height: 100vh;
  width: 80vw;
  margin: 0 auto;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  @media (max-width: 48em){
    width: 90vw;
  } 
`;

const Container = styled.div`
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;

  @media (max-width: 64em){
    justify-content: center;
  }
`;

const Banner = styled.h1`
  font-size: ${(props) => props.theme.fontxxxl};
  font-family: 'Orbitron', sans-serif; /* Changed to Tech Font */
  color: ${(props) => props.theme.text};
  white-space: nowrap;
  text-transform: uppercase;
  line-height: 1;

  @media (max-width: 70em){
    font-size: ${(props) => props.theme.fontxxl};
  }
  @media (max-width: 64em){
    margin: 1rem 0;
  }
  @media (max-width: 48em){
    font-size: ${(props) => props.theme.fontxl};
    margin: 0.5rem 0;
  }
  @media (max-width: 30em){
    font-size: ${(props) => props.theme.fontlg};
  }

  span {
    display: block;
    /* --- CONTRAST CHANGE --- */
    background-color: #ffffff; /* White Box */
    color: #000000;            /* Black Text */
    font-weight: 700;
    /* ----------------------- */
    
    padding: 1rem 2rem;
  }
`;

const Marquee = () => {
  return (
    <Section>
      <Container id="direction">
        
        <Banner>
          <span
            data-scroll
            data-scroll-direction="horizontal"
            data-scroll-speed="8"
            data-scroll-target="#direction"
          >
            Security is a Mindset
          </span>
        </Banner>

        <Banner data-scroll data-scroll-speed="-2" data-scroll-target="#direction">
          <span
            data-scroll
            data-scroll-direction="horizontal"
            data-scroll-speed="-6"
            data-scroll-target="#direction"
          >
            Not Just a Toolset
          </span>
        </Banner>

        <Banner>
          <span
            data-scroll
            data-scroll-direction="horizontal"
            data-scroll-speed="6"
            data-scroll-target="#direction"
          >
            Think Like an Attacker
          </span>
        </Banner>

        <Banner>
          <span
            data-scroll
            data-scroll-direction="horizontal"
            data-scroll-speed="-4"
            data-scroll-target="#direction"
          >
            Defend Like a Pro
          </span>
        </Banner>

        <Banner data-scroll data-scroll-speed="6" data-scroll-target="#direction">
          <span
            data-scroll
            data-scroll-direction="horizontal"
            data-scroll-speed="6"
            data-scroll-target="#direction"
          >
            Secure The Future
          </span>
        </Banner>

      </Container>
    </Section>
  );
};

export default Marquee;