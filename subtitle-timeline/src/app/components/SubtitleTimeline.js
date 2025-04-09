"use client"; // Mark the component as client-side

import { useEffect, useState } from "react";
import styles from "./SubtitleTimeline.module.css";

const SubtitleTimeline = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [isFinished, setIsFinished] = useState(false); // Track if subtitles are finished
  const [isPaused, setIsPaused] = useState(false); // Track if the timeline is paused

  // Fetch the subtitles data
  useEffect(() => {
    const fetchSubtitles = async () => {
      const response = await fetch("/data/output_from_ourAPI.json");
      const data = await response.json();
      setSubtitles(data);
    };

    fetchSubtitles();
  }, []);

  // Simulate the video time progress
  useEffect(() => {
    let interval;
    if (!isPaused && !isFinished) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 0.1); // Update every 0.1 seconds
      }, 100);
    }

    return () => clearInterval(interval); // Cleanup when component unmounts or paused
  }, [isPaused, isFinished]);

  // Check and set the active subtitle based on current time
  useEffect(() => {
    const current = subtitles.find(
      (s) => currentTime >= s.start_time && currentTime <= s.end_time
    );
    if (current?.subtitle !== activeSubtitle?.subtitle) {
      setActiveSubtitle(current); // Set active subtitle
    }

    // Check if all subtitles have been displayed
    if (currentTime > subtitles[subtitles.length - 1]?.end_time) {
      setIsFinished(true); // Stop the time update once all subtitles are shown
    }
  }, [currentTime, subtitles, activeSubtitle]);

  // Render words with dynamic styles
  const renderWords = (words) => {
    return words.map((word, index) => {
      const emphasisScale = 1 + word.emphasis;
      const wordStyle = {
        transform: `scale(${emphasisScale})`,
        opacity: word.confidence_word,
      };

      return (
        <span key={index} className={styles.wordWrapper}>
          <span className={styles.word} style={wordStyle}>
            {word.word}
          </span>
        </span>
      );
    });
  };

  // Pause/Resume toggle
  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className={styles.timelineContainer}>
      <div
        className={`${styles.subtitleBox} ${
          activeSubtitle ? styles.animate : ""
        }`}
      >
        {activeSubtitle && renderWords(activeSubtitle.words)}
      </div>
      <div className={styles.time}>{currentTime.toFixed(2)}s</div>
      <button className={styles.pauseButton} onClick={togglePause}>
        {isPaused ? "Resume" : "Pause"}
      </button>
    </div>
  );
};

export default SubtitleTimeline;
