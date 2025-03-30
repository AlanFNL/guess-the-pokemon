import React from "react";
import { motion } from "framer-motion";

function Hero({ startGame }) {
  return (
    <div className="relative overflow-hidden">
      <div className="flex flex-col items-center justify-center h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
            Guess the Pokemon
          </motion.h1>
          <motion.p
            className="text-xl text-white/80 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Test your Pokémon knowledge!
          </motion.p>
        </motion.div>

        <motion.button
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
          onClick={startGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Start Challenge
        </motion.button>

        {/* Floating pokemon silhouettes background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-10"
              initial={{
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                scale: 0.5 + Math.random() * 0.5,
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth * 0.8,
                  Math.random() * window.innerWidth * 0.8,
                ],
                y: [
                  Math.random() * window.innerHeight * 0.8,
                  Math.random() * window.innerHeight * 0.8,
                ],
                rotate: [0, 360],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 20 + Math.random() * 10,
                delay: i * 0.5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                  Math.floor(Math.random() * 150) + 1
                }.png`}
                alt="Pokemon silhouette"
                className="w-16 h-16 filter brightness-0"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero;
