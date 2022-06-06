import React from 'react';
import styles from './Input.module.css';

export default function Input({ defaultValue, value, onChange, className, type, ...props }) {
  return (
    <input
      // type="text"
      type={type ?? "text"}
      className={[styles.input, className].join(' ')}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}
