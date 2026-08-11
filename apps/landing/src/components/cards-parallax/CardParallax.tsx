'use client'
import Image from 'next/image';
import styles from './styles.module.scss';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const CardParallax = ({ title, description, src, url, color, i, progress, range, targetScale }: any) => {

    const container = useRef<HTMLDivElement>(null);

    const scale = useTransform(progress, range, [1, targetScale]);

    return (
        <div ref={container} className={styles.cardwrapper}>
            <motion.div
                style={{
                    backgroundColor: color,
                    scale,
                    top: `calc(10vh + ${i * 25}px)`
                }}
                className={styles.card}
            >
                <div className={styles.body}>
                    <div className={styles.imageContainer}>
                        <div className={styles.inner}>
                            <Image
                                src={src}
                                alt="image"
                                className='rounded-[10px]'
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
