import { useEffect, useRef, useState } from "react";
import "./App.css";

/* GIFS */
import reactionMeme from "./assets/reaction-meme-stan-twt.gif";
import noddingYeah from "./assets/nodding-yeah.gif";
import huuhGif from "./assets/huuuh.gif";

/* MUSIC */
import bgSong from "./assets/tennessee-whiskey.mp3";
import yesSong from "./assets/Always.mp3";
import noSong from "./assets/Huri.mp3";

/* IMAGES (EASTER EGGS) */
import img1 from "./assets/1.jpg";
import img2 from "./assets/2.jpg";
import img3 from "./assets/3.jpg";
import img4 from "./assets/4.jpg";
import img5 from "./assets/5.jpg";
import img6 from "./assets/6.jpg";

const isTouchDevice =
  "ontouchstart" in window || navigator.maxTouchPoints > 0;

type RevealedImage = {
  src: string;
  left: number;
  top: number;
  rotation: number;
  floatDuration: number;
};

export default function App() {
  /* UI STATE */
  const [showIntro, setShowIntro] = useState(true);
  const [showHuuh, setShowHuuh] = useState(false);
  const [showNodding, setShowNodding] = useState(false);
  const [showButtons, setShowButtons] = useState(true);

  const [yesSize, setYesSize] = useState(1);
  const [noFrozen, setNoFrozen] = useState(false);
  const [floating, setFloating] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noVisible, setNoVisible] = useState(true);
  const [noTextIndex, setNoTextIndex] = useState(0);

  /* EASTER EGGS */
  const [glowingHeart, setGlowingHeart] = useState<{ left: number; top: number } | null>(null);
  const [revealedImages, setRevealedImages] = useState<RevealedImage[]>([]);

  const noButtonRef = useRef<HTMLButtonElement | null>(null);

  /* IMAGE POOL */
  const imagePool = [img1, img2, img3, img4, img5, img6];

  /* AUDIO */
  const bgMusic = useRef(new Audio(bgSong));
  const yesMusic = useRef(new Audio(yesSong));
  const noMusic = useRef(new Audio(noSong));

  const stopAllMusic = () => {
    [bgMusic.current, yesMusic.current, noMusic.current].forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
  };

  const startExperience = () => {
    setShowIntro(false);
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.4;
    bgMusic.current.play();
  };

  const playYesSong = () => {
    stopAllMusic();
    yesMusic.current.loop = true;
    yesMusic.current.volume = 0.5;
    yesMusic.current.play();
  };

  const playNoSong = () => {
    stopAllMusic();
    noMusic.current.loop = true;
    noMusic.current.volume = 0.5;
    noMusic.current.play();
  };

  /* NO BUTTON */
  const noTexts = ["NO", "Are you sure?", "Really sure?", "Think again 😏", "Last chance 👀"];

  const teleportNo = () => {
    if (!noButtonRef.current || noFrozen) return;
    const rect = noButtonRef.current.getBoundingClientRect();
    const pad = 20;

    const x = Math.random() * (window.innerWidth - rect.width - pad * 2) + pad;
    const y = Math.random() * (window.innerHeight - rect.height - pad * 2) + pad;

    setNoVisible(false);
    setTimeout(() => {
      setNoPos({ x, y });
      setNoVisible(true);
    }, 160);
  };

  /* GLOWING HEART SPAWN */
  useEffect(() => {
    if (!showNodding) return;

    const interval = setInterval(() => {
      if (revealedImages.length < imagePool.length && !glowingHeart) {
        setGlowingHeart({
          left: Math.random() * (window.innerWidth - 50),
          top: Math.random() * (window.innerHeight - 100),
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [showNodding, glowingHeart, revealedImages]);

  const handleHeartClick = () => {
    const remaining = imagePool.filter(
      (img) => !revealedImages.some((r) => r.src === img)
    );

    if (!remaining.length) return;

    const next = remaining[Math.floor(Math.random() * remaining.length)];

    setRevealedImages((prev) => [
      ...prev,
      {
        src: next,
        left: 10 + Math.random() * 70,
        top: 10 + Math.random() * 60,
        rotation: Math.random() * 20 - 10,
        floatDuration: 8 + Math.random() * 5,
      },
    ]);

    setGlowingHeart(null);
  };

  /* INTRO PAGE */
  if (showIntro) {
    return (
      <div className="intro-screen">
        <h1>Click Me ❤️</h1>
        <button className="intro-btn" onClick={startExperience}>
          Enter
        </button>

        {/* Floating hearts */}
        <div className="hearts">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i}>💖</span>
          ))}
        </div>
      </div>
    );
  }

  /* HUUH PAGE (NO HEARTS HERE) */
  if (showHuuh) {
    return (
      <div className="fullscreen">
        <img src={huuhGif} className="huuh" />
      </div>
    );
  }

  /* MAIN PAGE */
  return (
    <div className="container">
      <img src={showNodding ? noddingYeah : reactionMeme} className="gif" />

      <h2 className="title">
        {showNodding ? "Find something hidden here 👀" : "PlaceHolder"}
        {!showNodding && (
          <span className="heart" onClick={() => setNoFrozen(true)}>💖</span>
        )}
      </h2>

      {showButtons && (
        <div className="button-row">
          <button
            className="yes"
            style={{ transform: `scale(${yesSize})` }}
            onClick={() => {
              setShowNodding(true);
              setShowButtons(false);
              playYesSong();
            }}
          >
            Yes
          </button>

          <button
            ref={noButtonRef}
            className={`no ${floating ? "floating" : ""} ${!noVisible ? "hidden" : ""} ${noFrozen ? "frozen" : ""}`}
            style={floating ? { left: noPos.x, top: noPos.y } : {}}
            onMouseEnter={() => {
              if (isTouchDevice || noFrozen) return;
              if (!floating) {
                const r = noButtonRef.current!.getBoundingClientRect();
                setNoPos({ x: r.left, y: r.top });
                setFloating(true);
              }
              setYesSize((s) => Math.min(s + 0.25, 2.4));
              setNoTextIndex((i) => (i + 1) % noTexts.length);
              teleportNo();
            }}
            onTouchStart={(e) => {
              if (!isTouchDevice || noFrozen) return;
              e.preventDefault();
              setYesSize((s) => Math.min(s + 0.35, 2.6));
              setNoTextIndex((i) => (i + 1) % noTexts.length);
              teleportNo();
            }}
            onClick={() => {
              playNoSong();
              if (!isTouchDevice) setShowHuuh(true);
            }}
          >
            {noTexts[noTextIndex]}
          </button>
        </div>
      )}

      {/* Floating hearts on MAIN */}
      <div className="hearts">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i}>💖</span>
        ))}
      </div>

      {/* Glowing heart */}
      {glowingHeart && (
        <span
          className="glowing-heart"
          style={{ left: glowingHeart.left, top: glowingHeart.top }}
          onClick={handleHeartClick}
        >
          💖
        </span>
      )}

      {/* Revealed images */}
      <div className="revealed-photos">
        {revealedImages.map((img, i) => (
          <img
            key={i}
            src={img.src}
            className="photo-float"
            style={{
              left: `${img.left}%`,
              top: `${img.top}%`,
              transform: `rotate(${img.rotation}deg)`,
              animationDuration: `${img.floatDuration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
