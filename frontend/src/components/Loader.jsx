import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

const Container = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  touch-action: none;
  overflow: hidden;
  
  /* CHANGE THIS */
  /* width: 100vw; <-- Old Problematic Code */
  width: 100%;  /* <-- New Fixed Code */
  
  height: 100vh;

  z-index: 6;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: #030828;

  width: 100%;

  @media (max-width: 48em) {
    svg{
      width: 20vw;
    }
  }

  svg {
    width: 10vw;
    height: auto;
    overflow: visible;
    stroke-linejoin: round;
    stroke-linecap: round;
    
    g {
      path {
        stroke: #fff; /* This ensures your shield is white on the black background */
        stroke-width: 2; /* Adjusted for visibility */
      }
    }
  }
`;

const pathVariants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 2,
      ease: 'easeInOut',
    },
  },
};

const textVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      yoyo: Infinity,
      ease: 'easeInOut',
    },
  },
};

const Text = styled(motion.span)`
  font-size: ${(props) => props.theme.fontxl};
  color: ${(props) => props.theme.text};
  padding-top: 0.5rem;

  @media (max-width: 48em) {
    font-size: ${(props) => props.theme.fontlg};
  }
`;

const Loader = () => {
  return (
    <Container
      initial={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 2 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 210 297" 
        width="100%"
        height="100%"
        fill="none"
      >
        <g>
          {/* Outer Shield Path */}
          <motion.path
            variants={pathVariants}
            initial="hidden"
            animate="visible"
            d="M 18.442432,100.66494 C 80.372901,67.094811 121.16622,70.074886 185.19276,95.285897 183.63817,156.91997 158.59835,209.09585 104.50711,240.90426 62.917579,214.38327 26.153436,180.7903 18.442432,100.66494 Z"
          />
          {/* Inner Shield Path */}
          <motion.path
            variants={pathVariants}
            initial="hidden"
            animate="visible"
            d="m 69.010384,128.41071 c 24.639424,-13.35608 40.869296,-12.17044 66.342656,-2.14008 -0.61851,24.5215 -10.58076,45.28001 -32.10129,57.93518 -16.546651,-10.55154 -31.173495,-23.91672 -34.241366,-55.7951 z"
          />
        </g>
      </svg>
      <Text variants={textVariants} initial="hidden" animate="visible">
        SecOps Club
      </Text>
    </Container>
  );
};

export default Loader;