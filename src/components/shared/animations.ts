export const clickerAnimations = `
  @keyframes clickFloat {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) translateY(0px) scale(0.8);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) translateY(-30px) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) translateY(-80px) scale(1.4);
    }
  }

  @keyframes productionFloat {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) translateY(0px) scale(0.6);
    }
    30% {
      opacity: 0.9;
      transform: translate(-50%, -50%) translateY(-25px) scale(1.1);
    }
    70% {
      opacity: 0.7;
      transform: translate(-50%, -50%) translateY(-55px) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) translateY(-90px) scale(1.3);
    }
  }
  
  @keyframes progressBar {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }

  @keyframes backgroundMove {
    0% {
      transform: translateX(0) translateY(0);
    }
    100% {
      transform: translateX(50px) translateY(50px);
    }
  }

  @keyframes float0 {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
      opacity: 0.8;
    }
  }

  @keyframes float1 {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.4;
    }
    50% {
      transform: translateY(-30px) rotate(-180deg);
      opacity: 0.9;
    }
  }

  @keyframes float2 {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.2;
    }
    50% {
      transform: translateY(-25px) rotate(90deg);
      opacity: 0.7;
    }
  }

  @keyframes clickPop {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(0.5);
    }
    30% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.5) translateY(-10px);
    }
    70% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1.3) translateY(-25px);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8) translateY(-50px);
    }
  }

  @keyframes shawarmaGlow {
    0%, 100% {
      filter: 
        drop-shadow(0 0 8px rgba(255, 165, 0, 0.3))
        drop-shadow(0 0 16px rgba(255, 140, 0, 0.2))
        brightness(1);
    }
    50% {
      filter: 
        drop-shadow(0 0 12px rgba(255, 165, 0, 0.5))
        drop-shadow(0 0 24px rgba(255, 140, 0, 0.3))
        drop-shadow(0 0 36px rgba(255, 165, 0, 0.1))
        brightness(1.05);
    }
  }

  @keyframes premiumPulse {
    0%, 100% {
      transform: scale(1);
      filter: 
        drop-shadow(0 0 10px rgba(255, 165, 0, 0.4))
        drop-shadow(0 0 20px rgba(255, 140, 0, 0.2))
        brightness(1);
    }
    50% {
      transform: scale(1.02);
      filter: 
        drop-shadow(0 0 15px rgba(255, 165, 0, 0.6))
        drop-shadow(0 0 30px rgba(255, 140, 0, 0.3))
        drop-shadow(0 0 45px rgba(255, 165, 0, 0.15))
        brightness(1.08);
    }
  }

  @keyframes luxuryShimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;
