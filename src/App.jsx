import { useEffect, useState } from "react";
import "./App.css";
import Hero from "./components/Hero";
import pokedex from "./pokedex.json";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes, FaAdjust } from "react-icons/fa";

// Pokemon type colors for badges
const typeColors = {
  Normal: "#A8A878",
  Fire: "#F08030",
  Water: "#6890F0",
  Electric: "#F8D030",
  Grass: "#78C850",
  Ice: "#98D8D8",
  Fighting: "#C03028",
  Poison: "#A040A0",
  Ground: "#E0C068",
  Flying: "#A890F0",
  Psychic: "#F85888",
  Bug: "#A8B820",
  Rock: "#B8A038",
  Ghost: "#705898",
  Dragon: "#7038F8",
  Dark: "#705848",
  Steel: "#B8B8D0",
  Fairy: "#EE99AC",
};

// Pokemon generation boundaries
const generations = {
  1: { min: 1, max: 151 },
  2: { min: 152, max: 251 },
  3: { min: 252, max: 386 },
  4: { min: 387, max: 493 },
  5: { min: 494, max: 649 },
  6: { min: 650, max: 721 },
  7: { min: 722, max: 809 },
  8: { min: 810, max: 905 },
};

const options = [
  { name: "sprite", label: "Silhouette" },
  { name: "id", label: "ID Number" },
  { name: "types", label: "Types" },
  { name: "generation", label: "Generation" },
  { name: "species", label: "Species" },
  { name: "height", label: "Height" },
  { name: "weight", label: "Weight" },
];

function App() {
  const [newGame, setNewGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [displayedHints, setDisplayedHints] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [guessHistory, setGuessHistory] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [partialTypesEnabled, setPartialTypesEnabled] = useState(true);
  const [shake, setShake] = useState(false);

  const maxAttempts = 8;

  const getGeneration = (id) => {
    for (const [gen, range] of Object.entries(generations)) {
      if (id >= range.min && id <= range.max) {
        return parseInt(gen);
      }
    }
    return 1; // Default to Gen 1 if not found
  };

  // START GAME
  useEffect(() => {
    if (newGame) {
      const randomIndex = Math.floor(Math.random() * pokedex.length);
      const selectedPokemon = pokedex[randomIndex];
      setPokemon(selectedPokemon);
      setGameStarted(true);
      setAttempts(0);
      setGuessHistory([]);
    }
  }, [newGame]);

  useEffect(() => {
    if (gameStarted) {
      const firstHint = options[Math.floor(Math.random() * 3)]; // Start with one of the first 3 hints
      setDisplayedHints([firstHint]);
    }
  }, [gameStarted]);

  // HANDLE GUESS
  const handleGuess = (guess) => {
    const formattedGuess = guess.toLowerCase().trim();

    // Find the guessed pokemon in the pokedex
    const guessedPokemon = pokedex.find(
      (p) => p.name.english.toLowerCase() === formattedGuess
    );

    if (!guessedPokemon) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return; // Not a valid pokemon
    }

    // Calculate matches
    const matches = {
      name: guessedPokemon.name.english === pokemon.name.english,
      id: guessedPokemon.id === pokemon.id,
      types: {
        full:
          JSON.stringify(guessedPokemon.type.sort()) ===
          JSON.stringify(pokemon.type.sort()),
        partial: guessedPokemon.type.some((type) =>
          pokemon.type.includes(type)
        ),
      },
      generation:
        getGeneration(guessedPokemon.id) === getGeneration(pokemon.id),
      species: guessedPokemon.species === pokemon.species,
      height: guessedPokemon.profile?.height === pokemon.profile?.height,
      weight: guessedPokemon.profile?.weight === pokemon.profile?.weight,
    };

    // Add to guess history
    setGuessHistory((prev) => [{ pokemon: guessedPokemon, matches }, ...prev]);

    if (matches.name) {
      setShowSuccess(true);
      setTimeout(() => {
        setNewGame(false);
        setGameOver(true);
        setGameStarted(false);
      }, 2000);
    } else {
      setAttempts((prev) => prev + 1);
      setInputValue("");
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    if (attempts >= maxAttempts) {
      setGameOver(true);
    }
  }, [attempts]);

  useEffect(() => {
    if (attempts > 0 && attempts % 2 === 0) {
      const unseenHints = options.filter(
        (option) => !displayedHints.some((hint) => hint.name === option.name)
      );
      if (unseenHints.length > 0) {
        const newHint =
          unseenHints[Math.floor(Math.random() * unseenHints.length)];
        setDisplayedHints((prev) => [...prev, newHint]);
      }
    }
  }, [attempts]);

  // HANDLE AUTOCOMPLETE
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);

    if (value.length > 1) {
      const filteredSuggestions = pokedex
        .map((p) => p.name.english)
        .filter((name) => name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0) {
        handleGuess(suggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        handleGuess(inputValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    }
  };

  const selectSuggestion = (name) => {
    setInputValue(name);
    setSuggestions([]);
    setSelectedIndex(-1);
    handleGuess(name);
  };

  const showHints = () => {
    if (!pokemon) return null;

    return (
      <div className="flex flex-col items-center justify-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-6">
        <h2 className="text-lg font-semibold text-yellow-300 mb-2">Hints</h2>
        <div className="grid grid-cols-1 gap-4 w-full">
          {displayedHints.map((hint) => (
            <motion.div
              key={hint.name}
              className="bg-white/5 rounded-lg p-3 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-xs text-yellow-300/80 uppercase tracking-wider mb-1">
                {hint.label}
              </div>
              <div className="flex justify-center items-center">
                {renderHint(hint)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderHint = (hint) => {
    if (!pokemon) return null;

    switch (hint.name) {
      case "sprite":
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            <img
              className="w-full h-full object-contain brightness-0 blur-sm select-none pointer-events-none"
              src={pokemon.image.sprite}
              alt="pokemon silhouette"
            />
          </div>
        );
      case "id":
        return (
          <div className="text-xl font-mono">
            #{pokemon.id.toString().padStart(3, "0")}
          </div>
        );
      case "types":
        return (
          <div className="flex gap-2">
            {pokemon.type.map((type) => (
              <span
                key={type}
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: `${typeColors[type]}40`,
                  color: typeColors[type],
                }}
              >
                {type}
              </span>
            ))}
          </div>
        );
      case "generation":
        return (
          <div className="text-xl">Generation {getGeneration(pokemon.id)}</div>
        );
      case "species":
        return <div className="text-lg">{pokemon.species}</div>;
      case "height":
        return <div className="text-xl">{pokemon.profile?.height}</div>;
      case "weight":
        return <div className="text-xl">{pokemon.profile?.weight}</div>;
      default:
        return null;
    }
  };

  const restartGame = (goToHero = false) => {
    setNewGame(false);
    setGameOver(false);
    setAttempts(0);
    setInputValue("");
    setGameStarted(false);
    setDisplayedHints([]);
    setGuessHistory([]);
    setShowSuccess(false);

    // If goToHero is true, stay at hero screen, otherwise start a new game immediately
    if (!goToHero) {
      setTimeout(() => {
        setNewGame(true);
      }, 300);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!newGame ? (
          <Hero startGame={() => setNewGame(!newGame)} />
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-2"
            >
              Guess the Pokemon
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <span className="text-sm md:text-base text-yellow-100/60">
                Generation: {pokemon ? getGeneration(pokemon.id) : "?"}
              </span>
              <span className="h-4 w-px bg-white/20"></span>
              <span className="text-sm md:text-base text-white/60 font-bold">
                {maxAttempts - attempts}{" "}
                {maxAttempts - attempts === 1 ? "guess" : "guesses"} remaining
              </span>
              <span className="h-4 w-px bg-white/20"></span>
              <button
                className="text-xs text-yellow-400 hover:text-yellow-300 focus:outline-none"
                onClick={() => setPartialTypesEnabled(!partialTypesEnabled)}
                aria-label="Toggle partial type matching"
              >
                {partialTypesEnabled
                  ? "Partial types: ON"
                  : "Partial types: OFF"}
              </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              {/* Left side - Hints */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                {showHints()}
              </motion.div>

              {/* Right side - Guess input and history */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                {/* Input area */}
                <div className="relative mb-6 w-full max-w-xs">
                  <motion.div
                    animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="relative"
                  >
                    <input
                      className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      placeholder="Type Pokémon name..."
                      aria-label="Pokémon name input"
                      disabled={showSuccess}
                    />
                    <button
                      onClick={() => inputValue && handleGuess(inputValue)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white focus:outline-none disabled:opacity-50"
                      disabled={!inputValue || showSuccess}
                      aria-label="Submit guess"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </motion.div>

                  {suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-1 left-0 w-full bg-black/60 backdrop-blur-sm border border-white/10 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto"
                    >
                      {suggestions.map((name, index) => (
                        <li
                          key={index}
                          className={`p-2 cursor-pointer transition-colors ${
                            index === selectedIndex
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "hover:bg-white/10"
                          }`}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => selectSuggestion(name)}
                        >
                          {name}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </div>

                {/* Success animation */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20"
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="relative"
                      >
                        <div className="relative flex items-center justify-center">
                          <img
                            src={pokemon?.image.sprite}
                            alt={pokemon?.name.english}
                            className="w-40 h-40 object-contain z-10"
                          />
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="absolute inset-0 bg-yellow-400 rounded-full opacity-30"
                          />
                        </div>
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="absolute bottom-1/2 mb-36 text-3xl font-bold text-white"
                      >
                        Correct! It's {pokemon?.name.english}!
                      </motion.h2>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Guess history */}
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                    Guess History
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    <AnimatePresence>
                      {guessHistory.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          className="text-center py-4 text-white/40 italic"
                        >
                          Your guesses will appear here
                        </motion.div>
                      ) : (
                        guessHistory.map((guess, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm"
                          >
                            <img
                              src={guess.pokemon.image.sprite}
                              alt={guess.pokemon.name.english}
                              className="w-10 h-10 object-contain"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="font-medium truncate">
                                  {guess.pokemon.name.english}
                                </span>
                                <span className="text-xs opacity-70">
                                  #
                                  {guess.pokemon.id.toString().padStart(3, "0")}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1 mt-1">
                                {/* Type match */}
                                <div
                                  className={`guess-feedback flex items-center gap-1  p-1 rounded-md  ${
                                    guess.matches.types.full
                                      ? "bg-green-500/30 text-green-300 border border-green-500/40"
                                      : partialTypesEnabled &&
                                        guess.matches.types.partial
                                      ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/40"
                                      : "bg-red-500/30 text-red-300 border border-red-500/40"
                                  }`}
                                >
                                  {guess.matches.types.full ? (
                                    <FaCheck
                                      className="text-green-400"
                                      size={12}
                                    />
                                  ) : partialTypesEnabled &&
                                    guess.matches.types.partial ? (
                                    <FaAdjust
                                      className="text-yellow-400"
                                      size={12}
                                    />
                                  ) : (
                                    <FaTimes
                                      className="text-red-400"
                                      size={12}
                                    />
                                  )}
                                  <span>Type</span>
                                </div>

                                {/* Generation match */}
                                <div
                                  className={`guess-feedback flex items-center gap-1  p-1 rounded-md  ${
                                    guess.matches.generation
                                      ? "bg-green-500/30 text-green-300 border border-green-500/40"
                                      : "bg-red-500/30 text-red-300 border border-red-500/40"
                                  }`}
                                >
                                  {guess.matches.generation ? (
                                    <FaCheck
                                      className="text-green-400"
                                      size={12}
                                    />
                                  ) : (
                                    <FaTimes
                                      className="text-red-400"
                                      size={12}
                                    />
                                  )}
                                  <span>Gen</span>
                                </div>

                                {/* Show additional matches if they're revealed in hints */}
                                {displayedHints.some(
                                  (h) => h.name === "species"
                                ) && (
                                  <div
                                    className={`guess-feedback flex items-center gap-1  p-1 rounded-md  ${
                                      guess.matches.species
                                        ? "bg-green-500/30 text-green-300 border border-green-500/40"
                                        : "bg-red-500/30 text-red-300 border border-red-500/40"
                                    }`}
                                  >
                                    {guess.matches.species ? (
                                      <FaCheck
                                        className="text-green-400"
                                        size={12}
                                      />
                                    ) : (
                                      <FaTimes
                                        className="text-red-400"
                                        size={12}
                                      />
                                    )}
                                    <span>Species</span>
                                  </div>
                                )}

                                {displayedHints.some(
                                  (h) => h.name === "height"
                                ) && (
                                  <div
                                    className={`guess-feedback flex items-center gap-1  p-1 rounded-md  ${
                                      guess.matches.height
                                        ? "bg-green-500/30 text-green-300 border border-green-500/40"
                                        : "bg-red-500/30 text-red-300 border border-red-500/40"
                                    }`}
                                  >
                                    {guess.matches.height ? (
                                      <FaCheck
                                        className="text-green-400"
                                        size={12}
                                      />
                                    ) : (
                                      <FaTimes
                                        className="text-red-400"
                                        size={12}
                                      />
                                    )}
                                    <span>Height</span>
                                  </div>
                                )}

                                {displayedHints.some(
                                  (h) => h.name === "weight"
                                ) && (
                                  <div
                                    className={`guess-feedback flex items-center gap-1  p-1 rounded-md  ${
                                      guess.matches.weight
                                        ? "bg-green-500/30 text-green-300 border border-green-500/40"
                                        : "bg-red-500/30 text-red-300 border border-red-500/40"
                                    }`}
                                  >
                                    {guess.matches.weight ? (
                                      <FaCheck
                                        className="text-green-400"
                                        size={12}
                                      />
                                    ) : (
                                      <FaTimes
                                        className="text-red-400"
                                        size={12}
                                      />
                                    )}
                                    <span>Weight</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>

            {gameOver && !showSuccess && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-8 max-w-md w-full text-center"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-red-400">
                    Game Over!
                  </h2>
                  <p className="text-lg mb-6">The Pokémon was:</p>

                  <div className="flex flex-col items-center justify-center mb-6">
                    <img
                      src={pokemon?.image.hires || pokemon?.image.sprite}
                      alt={pokemon?.name.english}
                      className="w-40 h-40 object-contain mb-2"
                    />
                    <h3 className="text-2xl font-bold text-yellow-300">
                      {pokemon?.name.english}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      {pokemon?.type.map((type) => (
                        <span
                          key={type}
                          className="text-xs px-3 py-1 rounded-full font-semibold"
                          style={{
                            backgroundColor: `${typeColors[type]}40`,
                            color: typeColors[type],
                          }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-white/70">
                      <p>
                        #{pokemon?.id} • Generation {getGeneration(pokemon?.id)}
                      </p>
                      <p>{pokemon?.species}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <motion.button
                      className="bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      onClick={() => restartGame(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Main Menu
                    </motion.button>

                    <motion.button
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
                      onClick={() => restartGame(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Play Again
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
