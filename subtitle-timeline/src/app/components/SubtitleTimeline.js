"use client"; // Add this line at the top to mark the component as client-side

import { useEffect, useState } from "react";
import styles from "./SubtitleTimeline.module.css";

const SubtitleTimeline = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState(null);
  const [subtitles, setSubtitles] = useState([]);

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
    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 0.1); // Update every 0.1 seconds
    }, 100);

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, []);

  // Check and set the active subtitle based on current time
  useEffect(() => {
    const current = subtitles.find(
      (s) => currentTime >= s.start_time && currentTime <= s.end_time
    );
    if (current?.subtitle !== activeSubtitle?.subtitle) {
      setActiveSubtitle(current); // Set active subtitle
    }
  }, [currentTime, subtitles, activeSubtitle]);

  return (
    <div className={styles.timelineContainer}>
      <div
        className={`${styles.subtitleBox} ${
          activeSubtitle ? styles.animate : ""
        }`}
      >
        {activeSubtitle?.subtitle}
      </div>
      <div className={styles.time}>{currentTime.toFixed(2)}s</div>
    </div>
  );
};

export default SubtitleTimeline;
