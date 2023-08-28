import React from 'react';
import styles from './message.module.css';
export default function Message({text,isOwn,author}) {      
    return (
        <div className={`${styles.message} ${isOwn ? styles['message--own'] : styles['message--received']}`}>
            <div className={styles.message__author}>{author}</div>
            <div className={styles.message__text}>{text}</div>
        </div>
    )                                              
  }