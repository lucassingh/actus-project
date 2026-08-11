'use client';
import { projects } from '@/data/mockData';
import styles from './stylecardcontainer.module.scss'
import { CardParallax } from './CardParallax';
import { useRef } from 'react';
import { useScroll } from 'framer-motion';

export default function CardParallaxContainer() {
    const container = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end'] as const
    })

    return (
        <main ref={container} className={styles.main}>
            {
                projects.map((project, i) => {
                    const targetScale = 1 - ((projects.length - i) * 0.05);
                    return <CardParallax key={`p_${i}`} i={i} {...project} progress={scrollYProgress} range={[i * .25, 1]} targetScale={targetScale} />
                })
            }
        </main>
    )
}