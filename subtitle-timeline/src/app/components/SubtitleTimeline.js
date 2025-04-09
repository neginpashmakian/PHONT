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
        marginRight: `${word.emphasis * 15}px`, // Add dynamic margin to increase spacing between scaled words
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
    <div className={styles.appContainer}>
      {/* Video Frame Section */}
      <div className={styles.videoContainer}>
        <div className={styles.fakeVideo}></div>
      </div>

      {/* Subtitle Section */}
      <div className={styles.subtitleContainer}>
        {activeSubtitle && renderWords(activeSubtitle.words)}
      </div>

      {/* Controls Section */}
      <div className={styles.controlsContainer}>
        <button className={styles.toggleButton} onClick={togglePause}>
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Timeline Section */}
      <div className={styles.timelineContainer}>
        <div className={styles.timeline}>
          <div
            className={styles.timelineProgress}
            style={{
              width: `${
                (currentTime /
                  (subtitles[subtitles.length - 1]?.end_time || 1)) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleTimeline;
