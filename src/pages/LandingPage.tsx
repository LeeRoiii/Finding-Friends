import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { cards } from "../utils/cardsData.ts";

export default function LandingPage() {
  const [index, setIndex] = useState<number>(0);
  const [hovered, setHovered] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false); // Track the button click state
  const navigate = useNavigate(); // Initialize useNavigate hook

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

  const handleButtonClick = () => {
    setClicked(true); // Set the clicked state to true when the button is clicked
    setTimeout(() => {
      // Redirect or perform some other action after the animation
      navigate("/homepage"); // Use navigate for routing to HomePage
    }, 1000); // Wait for the exit animation to complete before redirecting
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black to-gray-900 text-white p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-900 animate-pulse"></div>
      {/* Main Content */}
      <div className="max-w-5xl w-full space-y-12 relative">

        {/* Main Title */}
        <motion.h1
          className="text-7xl font-extrabold tracking-tight relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            type: "spring", // Apply spring for a bouncy effect
            stiffness: 100,
            damping: 25,
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
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

        {/* Animated Description Text */}
        <motion.p
          className="text-2xl text-gray-400 font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.3, // Add a slight delay for the description to appear after the title
            type: "spring",
            stiffness: 80,
            damping: 20,
          }}
        >
          Connect With People Instantly And Chat With Multiple Users In Real time
        </motion.p>

        {/* Button with exit animation */}
        {!clicked && (
          <motion.a
            href="#!" // Use # to prevent the default anchor action
            className="relative px-12 py-6 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl group"
            whileHover={{
              scale: 1.1, // Slightly increase the size on hover
              rotate: 5, // Add a little rotation to the button for extra effect
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            whileTap={{
              scale: 0.95, // Shrink slightly when clicked
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            whileDrag={{
              scale: 1.05, // Scale up slightly when dragging
              transition: { type: "spring", stiffness: 400, damping: 20 },
            }}
            drag
            dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} // Prevent dragging outside its container (optional)
            onClick={handleButtonClick} // Trigger the exit animation on click
            exit={{
              opacity: 0, // Fade out
              scale: 0.8, // Shrink the button
              transition: { duration: 0.5 }, // Set duration for the exit animation
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">
              Start Chatting
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-xl text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Let's Connect
            </span>
          </motion.a>
        )}

        {/* Cards Section */}
        <div className="mt-28 relative w-full mx-auto max-w-4xl overflow-hidden hidden lg:block">
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
              <motion.div
                key={`card-${i}`}
                className="flex-shrink-0 w-1/4 px-4"
                role="listitem"
                whileHover={{
                  scale: 1.05, // Apply scaling effect on hover
                  transition: { type: "spring", stiffness: 300, damping: 25 }, // Smooth spring animation on hover
                }}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 25,
                  delay: i * 0.2, // Stagger the animations of the cards
                }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
