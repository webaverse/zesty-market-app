import React from 'react';
import styles from './InventoryBanner.module.css';

const InventoryBanner = () => {
  return (
    <div
      className={styles.menu}
      width={600}
      height={400}
  >
      <h1>Classic Chest</h1>
      <p>You break it you buy it!<br/>Contents: 2</p>
  </div>
  );
};
export default InventoryBanner;