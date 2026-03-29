import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 6;

  width: 100%;
  width: fit-content;

  a {
    width: 100%;
    display: flex;
    align-items: flex-end;
  }

  svg {
    width: 4rem;
    height: auto;
    overflow: visible;
    stroke-linejoin: round;
    stroke-linecap: round;
    
    g {
      path {
        stroke: ${(props) => props.theme.text}; /* Adapts to theme (dark/light) */
        stroke-width: 2;
      }
    }
  }
`;
const Text = styled(motion.span)`
  font-size: ${(props) => props.theme.fontlg};
  color: ${(props) => props.theme.text};
  padding-bottom: 0.5rem;
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
      delay: 3,
      ease: 'easeInOut',
    },
  },
};
const textVariants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: -5,
    transition: {
      duration: 2,
      delay: 5,
      ease: 'easeInOut',
    },
  },
};

const Logo = () => {
  return (
    <Container>
      <Link to="/">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 210 297"
          width="48px"
          height="48px"
          fill="none"
        >
          <g>
            <motion.path
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              d="M 18.442432,100.66494 C 80.372901,67.094811 121.16622,70.074886 185.19276,95.285897 183.63817,156.91997 158.59835,209.09585 104.50711,240.90426 62.917579,214.38327 26.153436,180.7903 18.442432,100.66494 Z"
            />
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
      </Link>
    </Container>
  );
};

export default Logo;