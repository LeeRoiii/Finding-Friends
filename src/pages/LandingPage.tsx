import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cards } from "../utils/cardsData.ts";

export default function LandingPage() {
  const [index, setIndex] = useState<number>(0);
  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setIndex((prevIndex) => prevIndex + 1);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [cards.length, hovered]);

  const calculateTransform = () => {
    const cardWidthPercentage = 150 / 4;
    const offset = index * cardWidthPercentage;

    if (index >= cards.length) {
      return `translateX(-${(index % cards.length) * cardWidthPercentage}%)`;
    }

    return `translateX(-${offset}%)`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black to-gray-900 text-white p-8 text-center relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-900 animate-pulse"></div>
      {/* Main Content */}
      <div className="max-w-5xl w-full space-y-12 relative">

        <motion.h1
          className="text-7xl font-extrabold tracking-tight relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Main Text */}
          <span
            className="relative z-10"
            style={{
              textShadow:
                "2px 2px 0px rgba(255, 255, 255, 0.1), " +
                "4px 4px 0px rgba(255, 255, 255, 0.1), " +
                "6px 6px 0px rgba(255, 255, 255, 0.1)",
            }}
          >
            Finding Friends
          </span>


          <span
            className="absolute inset-0 z-0"
            style={{
              transform: "translateZ(-20px)",
              textShadow:
                "0px 0px 10px rgba(255, 255, 255, 0.5), " +
                "0px 0px 20px rgba(255, 255, 255, 0.4), " +
                "0px 0px 30px rgba(255, 255, 255, 0.3)",
              opacity: 0.8,
            }}
          >
            Finding Friends
          </span>
        </motion.h1>

        <p className="text-2xl text-gray-400 font-bold">
          Connect With People Instantly And Chat With Multiple Users In Real time
        </p>

        <a
          href="/HomePage"
          className="relative px-12 py-6 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl hover:scale-110 transform transition-all duration-300 ease-in-out group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">
            Start Chatting
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-xl text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Let's Connect
          </span>
        </a>

        {/* Cards Section */}
        <div className="mt-28 relative w-full max-w-4xl overflow-hidden hidden lg:block">
          <div
            className="flex animate-scroll"
            style={{
              transition: "transform 0.7s ease-in-out",
              transform: calculateTransform(),
              willChange: "transform",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role="list"
          >
            {[...cards, ...cards].map((card, i) => (
              <div
                key={`card-${i}`}
                className="flex-shrink-0 w-1/4 px-4"
                role="listitem"
              >
                <div
                  className="p-8 bg-gray-800 backdrop-blur-lg rounded-xl shadow-lg text-center transition duration-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                  aria-labelledby={`card-title-${i}`}
                >
                  <h3
                    id={`card-title-${i}`}
                    className="text-lg font-semibold mb-4 text-white whitespace-nowrap"
                  >
                    {card.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-4">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}