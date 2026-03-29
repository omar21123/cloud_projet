import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

// --- IMPORTS ---
import akasecImg from "../assets/Images/Sponsors/akasec_icon-15.png";
import cgiImg from "../assets/Images/Sponsors/CGI_logo.svg.png";
import cyberSparkImg from "../assets/Images/Sponsors/cyber-spark-it-services-ltd-logo-color.png.png";
import deloitteImg from "../assets/Images/Sponsors/Deloitte_logo_black.png";
import ensaMarocSvg from "../assets/Images/Sponsors/ENSA Maroc.svg";
import ensafesImg from "../assets/Images/Sponsors/ENSAFES_logo20230124155030 (5).png";
import ensiasImg from "../assets/Images/Sponsors/ensias.png";
import insecImg from "../assets/Images/Sponsors/insec.webp";
import altenImg from "../assets/Images/Sponsors/Logo Alten.png";
import beDifferentImg from "../assets/Images/Sponsors/logo be different white.png";
import uppaImg from "../assets/Images/Sponsors/Logo_UPPA.svg.png";
import sgImg from "../assets/Images/Sponsors/Societe-Generale-Logo.png";
import usmbaImg from "../assets/Images/Sponsors/usmba_90h.png";

// --- 1. Minimalist Configuration ---
const styleConfig = {
  bg: "#030812",
  cardBg: "rgba(255, 255, 255, 0.01)",
  border: "rgba(255, 255, 255, 0.08)",
  textDim: "#64748b",
  textLight: "#cbd5e1",
  white: "#ffffff",
};

// --- 2. Styled Components ---

const Section = styled.section`
  min-height: auto;
  width: 100%;
  padding: 5rem 0;
  background-color: ${styleConfig.bg};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Container = styled.div`
  width: 85%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  border-bottom: 1px solid ${styleConfig.border};
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-family: "Orbitron", sans-serif;
  color: ${styleConfig.white};
  margin: 0;
  letter-spacing: -0.5px;
  line-height: 1;
`;

const Subtitle = styled.span`
  font-family: "Share Tech Mono", monospace;
  color: ${styleConfig.textDim};
  font-size: 0.8rem;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const CategoryGroup = styled.div`
  margin-bottom: 2.5rem;
`;

const CategoryLabel = styled.h3`
  font-size: 0.75rem;
  color: ${styleConfig.textDim};
  font-family: "Share Tech Mono", monospace;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  opacity: 0.8;
  
  &::before {
    content: '//';
    color: ${styleConfig.textDim};
    margin-right: 0.5rem;
    font-size: 0.7rem;
    opacity: 0.5;
  }
`;

/* Grid for larger cards */
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 1rem;
  width: 100%;
`;

const ArrowSVG = styled.svg`
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
`;

// --- LOGO COMPONENT ---
const PartnerLogo = styled.img`
  height: 70px; /* Fixed height for uniformity */
  width: auto;
  max-width: 85%; 
  object-fit: contain; 
  
  /* Default: Pure White */
  filter: brightness(0) invert(1); 
  opacity: 1; 
  transition: all 0.3s ease;
`;

// --- CARD LINK ---
const CardLink = styled(motion.a)`
  height: 120px; /* Large height */
  background-color: ${styleConfig.cardBg};
  border: 1px solid ${styleConfig.border};
  display: flex;
  justify-content: center; /* Center logo horizontally */
  align-items: center;     /* Center logo vertically */
  padding: 1.5rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  span {
    font-family: "Share Tech Mono", monospace;
    font-size: 1.1rem;
    color: ${styleConfig.textLight};
    transition: color 0.2s ease;
    text-align: center;
  }

  /* Arrow fixed to top-right */
  .icon-wrapper {
    position: absolute;
    top: 12px;
    right: 12px;
    color: ${styleConfig.textDim};
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
  }

  &:hover {
    border-color: ${styleConfig.white};
    background-color: rgba(255, 255, 255, 0.04);

    span {
      color: ${styleConfig.white};
    }

    /* --- THIS RESTORES THE ORIGINAL COLOR ON HOVER --- */
    ${PartnerLogo} {
      filter: none; 
      opacity: 1;
    }

    .icon-wrapper {
      color: ${styleConfig.white};
    }

    ${ArrowSVG} {
      transform: translate(3px, -3px);
    }
  }
`;

// --- DATA ---
const PARTNERS = {
  industry: [
    { name: "Deloitte", img: deloitteImg, url: "https://www2.deloitte.com/" },
    { name: "CGI", img: cgiImg, url: "https://www.cgi.com/" },
    { name: "Société Générale", img: sgImg, url: "https://societegenerale.ma/" },
    { name: "Alten Maroc", img: altenImg, url: "https://www.alten.ma/" },
    { name: "Air France", img: null, url: "https://www.airfrance.com/" },
  ],
  academic: [
    { name: "ENSA Fès", img: ensafesImg, url: "http://www.ensaf.ac.ma/" },
    { name: "GSCSI / ILIA", img: ensaMarocSvg, url: "#" }, 
    { name: "UPPA France", img: uppaImg, url: "https://www.univ-pau.fr/" },
    { name: "ENSIAS", img: ensiasImg, url: "#" },
    { name: "USMBA", img: usmbaImg, url: "#" },
  ],
  community: [
    { name: "Akasec", img: akasecImg, url: "#" },
    { name: "SparkSec", img: cyberSparkImg, url: "#" },
    { name: "EliteSec", img: beDifferentImg, url: "#" },
    { name: "INSEC", img: insecImg, url: "#" },
  ],
};

// --- MAIN COMPONENT ---

const Partnerships = () => {
  return (
    <Section id="partnerships">
      <Container>
        
        <Header>
          <Title>PARTNERSHIPS</Title>
          <Subtitle>ALLIANCES</Subtitle>
        </Header>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          
          {/* 1. Industry */}
          <CategoryGroup>
            <CategoryLabel>Industry Leaders</CategoryLabel>
            <GridContainer>
              {PARTNERS.industry.map((p, i) => (
                <CardLink key={i} href={p.url} target="_blank" rel="noreferrer">
                  {p.img ? (
                    <PartnerLogo src={p.img} alt={p.name} />
                  ) : (
                    <span>{p.name}</span>
                  )}
                  
                  <div className="icon-wrapper">
                    <ArrowSVG viewBox="0 0 24 24">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </ArrowSVG>
                  </div>
                </CardLink>
              ))}
            </GridContainer>
          </CategoryGroup>

          {/* 2. Academic */}
          <CategoryGroup>
            <CategoryLabel>Academic & Institutional</CategoryLabel>
            <GridContainer>
              {PARTNERS.academic.map((p, i) => (
                <CardLink key={i} href={p.url} target="_blank" rel="noreferrer">
                  {p.img ? (
                    <PartnerLogo src={p.img} alt={p.name} />
                  ) : (
                    <span>{p.name}</span>
                  )}
                  <div className="icon-wrapper">
                    <ArrowSVG viewBox="0 0 24 24">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </ArrowSVG>
                  </div>
                </CardLink>
              ))}
            </GridContainer>
          </CategoryGroup>

          {/* 3. Community */}
          <CategoryGroup>
            <CategoryLabel>Community & Ecosystem</CategoryLabel>
            <GridContainer>
              {PARTNERS.community.map((p, i) => (
                <CardLink key={i} href={p.url} target="_blank" rel="noreferrer">
                    {p.img ? (
                    <PartnerLogo src={p.img} alt={p.name} />
                  ) : (
                    <span>{p.name}</span>
                  )}
                  <div className="icon-wrapper">
                    <ArrowSVG viewBox="0 0 24 24">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </ArrowSVG>
                  </div>
                </CardLink>
              ))}
            </GridContainer>
          </CategoryGroup>

        </motion.div>
      </Container>
    </Section>
  );
};

export default Partnerships;