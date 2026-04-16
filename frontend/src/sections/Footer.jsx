import { motion } from "framer-motion";
import React from "react";
import { useLocomotiveScroll } from "react-locomotive-scroll";
import styled from "styled-components";

import Logo from "../assets/Svgs/transparentlogo_white.svg";

const Section = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  position: relative;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    width: 10vw;
    height: auto;
  }

  h3 {
    font-size: ${(props) => props.theme.fontxxl};
    @media (max-width: 48em) {
      font-size: ${(props) => props.theme.fontxl};
    }
  }
`;

const FooterComponent = styled(motion.footer)`
  width: 80vw;
  @media (max-width: 48em) {
    width: 90vw;
  }
  ul {
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin: 2rem;
    margin-top: 4rem;
    padding: 0 1rem;
    border-top: 1px solid ${(props) => props.theme.text};
    border-bottom: 1px solid ${(props) => props.theme.text};

    @media (max-width: 48em) {
      justify-content: center;
    }
  }

  li {
    padding: 2rem;
    font-size: ${(props) => props.theme.fontlg};
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.1);
    }

    @media (max-width: 48em) {
      padding: 1rem;
      font-size: ${(props) => props.theme.fontmd};
    }
  }
`;

const Bottom = styled.div`
  padding: 0.5rem 0;
  margin: 0 4rem;
  font-size: ${(props) => props.theme.fontlg};
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    text-decoration: underline;
  }

  @media (max-width: 64em) {
    flex-direction: column;
    justify-content: center;
    span {
      transform: none !important;
    }
  }

  @media (max-width: 48em) {
    font-size: ${(props) => props.theme.fontmd};
  }
`;

const Footer = () => {
  const { scroll } = useLocomotiveScroll();

  const handleScroll = (id) => {
    let elem = document.querySelector(id);
    if (elem) {
      scroll.scrollTo(elem, {
        offset: "-100",
        duration: "2000",
        easing: [0.25, 0.0, 0.35, 1.0],
      });
    }
  };

  return (
    <Section>
      <LogoContainer>
        <img
          width="300"
          height="300"
          src={Logo}
          alt="Secops Club"
          data-scroll
          data-scroll-speed="2"
        />
        <h3 data-scroll data-scroll-speed="-1">
          Secops Ensaf CLUB
        </h3>
      </LogoContainer>
      <FooterComponent
        initial={{ y: "-400px" }}
        whileInView={{ y: 0 }}
        viewport={{ once: false }}
        transition={{
          duration: 1.5,
        }}
      >
        <ul>
          <li aria-hidden="true" onClick={() => handleScroll("#home")}>
            home
          </li>
          <li aria-hidden="true" onClick={() => handleScroll(".about")}>
            about
          </li>
          {/* UPDATED: Shop -> Team */}
          <li aria-hidden="true" onClick={() => handleScroll("#team")}>
            team
          </li>
          {/* UPDATED: New Arrival -> Activities */}
          <li aria-hidden="true" onClick={() => handleScroll("#activities")}>
            activities
          </li>
           {/* ADDED: Contact */}
           <li aria-hidden="true" onClick={() => handleScroll("#contact")}>
            contact
          </li>

          <li>
            <a href="https://www.instagram.com/sec_ops.club/" target={"_blank"} rel="noreferrer">
              instagram
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/company/secops-ensaf/" target={"_blank"} rel="noreferrer">
              linkedin
            </a>
          </li>
        </ul>
        <Bottom>
          <span
            data-scroll
            data-scroll-speed="2"
            data-scroll-direction="horizontal"
          >
            © {new Date().getFullYear()}. All Rights Reserved to SecOps Club ensa Fes.
          </span>
          <span
            data-scroll
            data-scroll-speed="-2"
            data-scroll-direction="horizontal"
          >
            Made with ♥ by{" "}
            <a
              href="https://www.linkedin.com/in/hachem-squalli-elhoussaini-2a7957250/"
              target={"_blank"}
              rel="dofollow noreferrer"
            >
              Omar hhhhhhhhh
            </a>
          </span>
        </Bottom>
      </FooterComponent>
    </Section>
  );
};

export default Footer;
