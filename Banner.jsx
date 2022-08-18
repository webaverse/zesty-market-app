import React from 'react';
import styles from './Banner.module.css';

const Banner = () => {
  return (
    <div
      className={styles.menu}
      width={600}
      height={400}
    >
      <h1>Duck</h1>
      <p>A classic metaverse must-have.</p>
    </div>
  );
};
export default Banner;
