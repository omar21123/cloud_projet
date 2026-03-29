import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

// --- ICONS ---
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="arcs"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
);

const SocialIcon = ({ type }) => {
    const paths = {
        x: <path d="M18.0387 3H21.2589L14.2238 11.0406L22.5 21.9821H16.0188L10.9433 15.3461L5.13579 21.9821H1.91371L9.4384 13.3817L1.5 3H8.14372L12.7315 9.0655L18.0368 3H18.0387ZM16.9086 20.0546H18.6929L7.17515 4.82617H5.26039L16.9086 20.0546Z" fill="currentColor"/>,
        linkedin: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 4a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" fill="currentColor"/>,
        instagram: <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M2 2h20v20H2z" stroke="currentColor" strokeWidth="2" fill="none"/>
    };
    return <svg width="20" height="20" viewBox="0 0 24 24">{paths[type]}</svg>;
};

// --- STYLES ---

const Section = styled.section`
  min-height: 100vh;
  width: 100%;
  // Reverted to Dark Theme Background for immersion
  background-color: ${(props) => props.theme.body}; 
  color: ${(props) => props.theme.text};
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5rem 0;
  overflow: hidden;
`;

const Container = styled.div`
  width: 85vw;
  @media (max-width: 48em) { width: 90vw; }
  display: flex;
  flex-direction: column;
`;

const MainTitle = styled.h2`
  font-size: ${(props) => props.theme.fontxxl};
  text-transform: uppercase;
  margin-bottom: 2rem;
  letter-spacing: 2px;
  font-family: 'Orbitron', sans-serif;
  color: #fff;
  
  @media (max-width: 48em) { font-size: ${(props) => props.theme.fontxl}; }
`;

// --- BANNER SECTION ---

const BannerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 400px;
  margin-bottom: 4rem;
  display: flex;
  align-items: center;
  
  @media (max-width: 64em) {
    flex-direction: column;
    height: auto;
    gap: 2rem;
  }
`;

const ImageContainer = styled(motion.div)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 65%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  
  clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.8) contrast(1.1); 
  }

  @media (max-width: 64em) {
    position: relative;
    width: 100%;
    height: 300px;
    clip-path: none;
  }
`;

const FloatingCard = styled(motion.div)`
  position: relative;
  z-index: 2;
  width: 45%;
  
  // Dark Glassmorphism for the "Info Card"
  background: rgba(3, 12, 48, 0.8); 
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid ${(props) => props.theme.accent}; // Blue accent line

  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5); 
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  border-radius: 0; 

  @media (max-width: 64em) {
    width: 100%;
    margin-top: 0;
    padding: 2rem;
  }

  h3 {
    font-size: ${(props) => props.theme.fontxl};
    text-transform: uppercase;
    line-height: 1.1;
    color: #fff;
  }
  
  p {
    font-size: ${(props) => props.theme.fontmd};
    color: rgba(255,255,255,0.8);
    line-height: 1.6;
    font-family: sans-serif;
  }
`;

const SocialsContainer = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 3;
  display: flex;
  gap: 1rem;
`;

const SocialButton = styled.a`
  width: 3rem;
  height: 3rem;
  background: rgba(0,0,0,0.7); 
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: ${(props) => props.theme.accent};
    border-color: ${(props) => props.theme.accent};
    transform: translateY(-3px);
  }
`;

// --- BOTTOM SECTION WRAPPER ---
// This holds the info and the form
const BottomSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 4rem;
    margin-top: 2rem;

    @media (max-width: 64em) {
        grid-template-columns: 1fr;
    }
`;

// --- INFO SIDE (Left) ---

const InfoColumn = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3rem;
    padding-right: 2rem;
    
    // Add a separator line
    border-right: 1px solid rgba(255,255,255,0.1);

    @media (max-width: 64em) {
        border-right: none;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 3rem;
        padding-right: 0;
    }
`;

const InfoBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h4 {
        font-size: 1.5rem;
        text-transform: uppercase;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        svg { color: ${(props) => props.theme.accent}; }
    }
    p {
        color: rgba(255,255,255,0.6);
        font-size: 1rem;
    }
`;

const LinkList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const ContactLink = styled.a`
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.2rem;
    font-weight: 500;
    text-transform: uppercase;
    color: #fff;
    transition: all 0.3s ease;

    svg { 
        color: ${(props) => props.theme.accent}; 
        transition: transform 0.3s ease;
    }

    &:hover {
        color: ${(props) => props.theme.accent};
        svg { transform: translateX(5px); }
    }
`;


// --- FORM SIDE (Right) ---
// *** THE HIGH CONTRAST BOX ***

const WhiteFormContainer = styled.div`
    background-color: #FFFFFF; // Pure White Box
    padding: 3rem;
    color: #000; // Force Black Text
    
    // Tech styling
    clip-path: polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%); // Cut corner
    position: relative;

    // A small accent strip at the top
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; width: 100%; height: 5px;
        background: ${(props) => props.theme.accent};
    }

    @media (max-width: 48em) {
        padding: 2rem;
    }
`;

const FormHeader = styled.div`
    margin-bottom: 2rem;
    h3 {
        font-size: 2rem;
        text-transform: uppercase;
        font-weight: 800;
        color: #000;
        font-family: 'Orbitron', sans-serif;
    }
    p {
        color: #666;
    }
`;

const Form = styled.form`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    @media (max-width: 48em) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
`;

const InputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    ${props => props.full && `grid-column: 1 / -1;`}
`;

const Label = styled.label`
    font-size: 0.85rem;
    color: ${(props) => props.theme.accent}; // Blue Accent Label
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const Input = styled.input`
    background: #f4f4f4; // Light Grey Input Background
    border: none;
    border-bottom: 2px solid #ddd;
    padding: 1rem; // More padding for blocky look
    color: #000;
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    transition: all 0.3s ease;
    border-radius: 0;

    &:focus {
        outline: none;
        background: #fff;
        border-bottom-color: ${(props) => props.theme.accent};
        box-shadow: inset 0 0 0 2px rgba(${(props) => props.theme.accentRgba}, 0.1);
    }
    &::placeholder { color: #aaa; }
`;

const TextArea = styled.textarea`
    background: #f4f4f4;
    border: none;
    border-bottom: 2px solid #ddd;
    padding: 1rem;
    color: #000;
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    resize: none;
    min-height: 120px;
    border-radius: 0;
    
    &:focus {
        outline: none;
        background: #fff;
        border-bottom-color: ${(props) => props.theme.accent};
    }
    &::placeholder { color: #aaa; }
`;

const SubmitBtn = styled.button`
    grid-column: 1 / -1;
    justify-self: start;
    width: 100%;
    padding: 1.2rem;
    
    background: #000; // Black Button
    color: #fff;
    
    font-family: 'Orbitron', sans-serif;
    font-weight: bold;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
    letter-spacing: 2px;

    &:hover {
        background: ${(props) => props.theme.accent};
        color: #fff;
    }
`;

const Contact = () => {
  return (
    <Section id="contact">
      <Container>
        <MainTitle>Contact</MainTitle>

        {/* --- BANNER AREA --- */}
        <BannerWrapper>
            <FloatingCard 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <h3>Get In Touch With Us</h3>
                <p>
                    Looking to host a well-organized CTF or give your students a bootcamp session? 
                    SecOps club ensa fes offers unique challenges and intensive training designed to sharpen your cybersecurity skills.
                </p>
            </FloatingCard>

            <ImageContainer
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" alt="Cyberpunk Aesthetic" />
                
                <SocialsContainer>
                <SocialButton href="https://www.linkedin.com/company/secops-ensaf/" target="_blank">
                <SocialIcon type="linkedin" /></SocialButton>
                <SocialButton href="https://www.instagram.com/sec_ops.club/" target="_blank">
                <SocialIcon type="instagram" /></SocialButton>
                </SocialsContainer>
            </ImageContainer>
        </BannerWrapper>

        {/* --- BOTTOM SECTION (Split Design) --- */}
        <BottomSection>
            
            {/* LEFT: Info (Dark Theme) */}
            <InfoColumn>
                <InfoBlock>
                    <h4><StarIcon /> Contact Info</h4>
                    <p>We are available via email and social media for your convenience.</p>
                </InfoBlock>
                
                <LinkList>
                    <ContactLink href="tel:+212 609-651811">
                        <ArrowIcon /> +212 609-651811
                    </ContactLink>
                    <ContactLink href="mailto:contact@Sec.Ops club.club">
                        <ArrowIcon /> contact@Sec.Ops club.club
                    </ContactLink>
                    <ContactLink href="https://maps.app.goo.gl/r85VgJQPKtg7uoX68" target="_blank">
                        <ArrowIcon /> ENSA Fes, Morocco
                    </ContactLink>
                </LinkList>
            </InfoColumn>

            {/* RIGHT: Form (White Box Contrast) */}
            <WhiteFormContainer>
                <FormHeader>
                    <h3>Send a Message</h3>
                    <p>Specific inquiry? Fill out the form below.</p>
                </FormHeader>

                <Form onSubmit={(e) => e.preventDefault()}>
                    <InputWrapper>
                        <Label>First Name</Label>
                        <Input type="text" placeholder="Mohammed" />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Last Name</Label>
                        <Input type="text" placeholder="Said" />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Email</Label>
                        <Input type="email" placeholder="https://www.linkedin.com/company/secops-ensaf/posts/?feedView=all" />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Phone</Label>
                        <Input type="tel" placeholder="+212 609-651811" />
                    </InputWrapper>
                    <InputWrapper full>
                        <Label>Message</Label>
                        <TextArea placeholder="How can we help you?" />
                    </InputWrapper>
                    <SubmitBtn>Submit Application</SubmitBtn>
                </Form>
            </WhiteFormContainer>

        </BottomSection>

      </Container>
    </Section>
  );
};

export default Contact;