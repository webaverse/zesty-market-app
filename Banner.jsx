import React from 'react';
import styles from './Banner.module.css';

const Banner = () => {
  return (
    <div
      className={styles.menu}
      width={600}
      height={400}
    >
      <h1>Zesty Ad</h1>
      <p>Watch this space for something you're going to want to buy!</p>
    </div>
  );
};
export default Banner;
