"use client"; // Mark the component as client-side

import { useEffect, useState } from "react";
import styles from "./SubtitleTimeline.module.css";

const SubtitleTimeline = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [isFinished, setIsFinished] = useState(false); // Track if subtitles are finished
  const [isPaused, setIsPaused] = useState(false); // Track if the timeline is paused
  const [isAnimationOn, setIsAnimationOn] = useState(false); // Track if animation is toggled on

  // Fetch the subtitles data
  useEffect(() => {
    const fetchSubtitles = async () => {
      const response = await fetch("/data/output_from_ourAPI.json");
      const data = await response.json();
      setSubtitles(data);
    };

    fetchSubtitles();
  }, []);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

      const wordStyle = isAnimationOn
        ? {
            transform: `scale(${emphasisScale})`,
            opacity: word.confidence_word,
            marginRight: `${word.emphasis * 20}px`,
            marginLeft: `${word.emphasis * 20}px`, // Add dynamic margin to increase spacing between scaled words
          }
        : {};

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

  // Handle time progress change when user interacts with the progress bar
  const handleProgressChange = (e) => {
    const newTime =
      (e.clientX / e.target.offsetWidth) *
      subtitles[subtitles.length - 1]?.end_time;
    setCurrentTime(newTime);
  };

  // Jump forward by 15 seconds
  const jumpForward = () => {
    setCurrentTime((prev) =>
      Math.min(prev + 15, subtitles[subtitles.length - 1]?.end_time)
    );
  };

  // Jump backward by 15 seconds
  const jumpBackward = () => {
    setCurrentTime((prev) => Math.max(prev - 15, 0));
  };

  // Toggle animation on/off
  const toggleAnimation = () => {
    setIsAnimationOn((prev) => !prev);
  };

  return (
    <div className={styles.appContainer}>
      {/* Video Frame Section */}
      <div className={styles.videoContainer}>
        <div className={styles.fakeVideo}></div>
      </div>

      {/* Subtitle Section */}
      <div className={styles.subtitleContainer}>
        <div
          className={`${styles.subtitleBox} ${
            isAnimationOn && activeSubtitle ? styles.animate : styles.notanimate
          }`}
        >
          {/* <div
          className={`${styles.subtitleBox} ${
            activeSubtitle ? styles.animate : ""
          }`}
        > */}
          {activeSubtitle && renderWords(activeSubtitle.words)}
        </div>
      </div>

      {/* Controls Section */}
      <div className={styles.controlsContainer}>
        <button className={styles.toggleButton} onClick={jumpBackward}>
          -15s
        </button>
        <button className={styles.toggleButton} onClick={togglePause}>
          {isPaused ? "Resume" : "Pause"}
        </button>

        <button className={styles.toggleButton} onClick={jumpForward}>
          +15s
        </button>
      </div>

      {/* <div className={styles.animationControlBox}>
        <label htmlFor="animationToggle">Animation</label>
        <input
          type="checkbox"
          id="animationToggle"
          checked={isAnimationOn}
          onChange={toggleAnimation}
        />
      </div> */}
      <div className={styles.animationControlBox}>
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            checked={isAnimationOn}
            onChange={toggleAnimation}
          />
          <span className={styles.slider}></span>
        </label>
        <span className={styles.toggleText}>Animation</span>
      </div>

      {/* Timeline Section */}
      <div className={styles.timelineContainer}>
        <div className={styles.timeline} onClick={handleProgressChange}>
          {Array.from({ length: 21 }).map((_, index) => {
            const totalDuration =
              subtitles[subtitles.length - 1]?.end_time || 1;
            const step = totalDuration / 20;
            const currentTimeMarker = Math.floor(index * step);
            return (
              <div key={index} className={styles.timelineSegmentWrapper}>
                <div className={styles.timelineSegment}></div>
                <div className={styles.timeLabel}>
                  {formatTime(currentTimeMarker)}
                </div>
              </div>
            );
          })}
          <div
            className={styles.timelineIndicator}
            style={{
              left: `${
                (currentTime /
                  (subtitles[subtitles.length - 1]?.end_time || 1)) *
                100
              }%`,
              transform: "translateX(-1px)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleTimeline;
