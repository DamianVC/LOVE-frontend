import React from 'react';
import styles from './VegaLegend.module.css';

const VegaLegend = function ({ gridData, marksStyles }) {
  const nrows = gridData.length;
  const ncols = gridData.reduce((prevMax, row) => Math.max(row.length, prevMax), 0);

  const filledGridData = gridData.map((row) => {
    if (row.length === ncols) {
      return row;
    }
    return [...row, new Array(ncols - row.length).fill(undefined)];
  });

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${ncols}, auto)`,
      }}
    >
      {filledGridData.map((row) => {
        return row.map((cell) => {
          return <div>{cell?.label || ''}</div>;
        });
      })}
    </div>
  );
};

export default VegaLegend;
