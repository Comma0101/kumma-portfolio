import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SlicedText.module.css';

gsap.registerPlugin(ScrollTrigger);

interface SlicedTextProps {
  text: string;
  effect?: '1' | '2' | '3' | '4' | '5' | '6';
  tag?: 'h2' | 'h3';
  className?: string;
}

const SlicedText: React.FC<SlicedTextProps> = ({ text, effect = '1', tag = 'h2', className = '' }) => {
  const elementRef = useRef<HTMLHeadingElement | null>(null);
  const [totalCells, setTotalCells] = useState(6);

  useEffect(() => {
    switch (effect) {
      case '1':
      case '2':
      case '3':
        setTotalCells(4);
        break;
      case '4':
        setTotalCells(6);
        break;
      default:
        setTotalCells(6);
        break;
    }
  }, [effect]);

  useEffect(() => {
    if (!elementRef.current) return;

    const itemInner = Array.from(elementRef.current.querySelectorAll(`.${styles.gtextBoxInner}`)) as HTMLElement[];
    const itemInnerWrap = Array.from(elementRef.current.querySelectorAll(`.${styles.gtextBox}`));

    // Set CSS custom properties for text width and positioning
    if (itemInner.length > 0) {
      const computedWidth = window.getComputedStyle(itemInner[0]).width;
      const widthValue = parseFloat(computedWidth);
      
      // Set the --text-width CSS variable
      elementRef.current.style.setProperty('--text-width', computedWidth);
      
      // Calculate offset and set initial left positioning using GSAP
      const offset = widthValue / totalCells;
      itemInner.forEach((inner, pos) => {
        gsap.set(inner, { left: offset * -pos });
      });
    }

    // ScrollTrigger.refresh() to ensure proper initialization
    ScrollTrigger.refresh();

    const fx1Timeline = () => {
        const initialValues = { x: 13 };
        gsap.fromTo(itemInner, {
            xPercent: (pos, _, arr) => pos < arr.length / 2 ? -initialValues.x * pos - initialValues.x : initialValues.x * (pos - arr.length / 2) + initialValues.x,
        }, {
            ease: 'power1',
            xPercent: 0,
            scrollTrigger: {
                trigger: elementRef.current,
                start: 'top bottom',
                end: 'center center',
                scrub: true,
                markers: true
            }
        });
    };

    const fx2Timeline = () => {
        const initialValues = { x: 30 };
        gsap.timeline({
            defaults: { ease: 'power1' },
            scrollTrigger: {
                trigger: elementRef.current,
                start: 'top bottom',
                end: 'center center',
                scrub: true,
                markers: true
            }
        })
        .fromTo(itemInner, {
            xPercent: pos => initialValues.x * pos
        }, {
            xPercent: 0
        }, 0)
        .fromTo(itemInnerWrap, {
            xPercent: pos => 2 * (pos + 1) * 10
        }, {
            xPercent: 0
        }, 0);
    };

    const fx3Timeline = () => {
        const intervalPixels = 100;
        const totalElements = itemInnerWrap.length;
        const totalWidth = (totalElements - 1) * intervalPixels;
        const offset = (totalWidth / 2) * -1;
        const initialValues = { x: 30, y: -15, rotation: -5 };
        gsap.timeline({
            defaults: { ease: 'power1' },
            scrollTrigger: {
                trigger: elementRef.current,
                start: 'top bottom',
                end: 'center center',
                scrub: true,
                markers: true
            }
        })
        .fromTo(itemInner, {
            xPercent: (pos, _, arr) => pos < arr.length / 2 ? -initialValues.x * pos - initialValues.x : initialValues.x * (pos - arr.length / 2) + initialValues.x,
            yPercent: (pos, _, arr) => pos < arr.length / 2 ? initialValues.y * (arr.length / 2 - pos) : initialValues.y * ((pos + 1) - arr.length / 2),
        }, {
            xPercent: 0,
            yPercent: 0
        }, 0)
        .fromTo(itemInnerWrap, {
            xPercent: pos => {
                const distanceFromCenter = pos * intervalPixels;
                const xPercent = distanceFromCenter + offset;
                return xPercent;
            },
            rotationZ: (pos, _, arr) => pos < arr.length / 2 ? -initialValues.rotation * (arr.length / 2 - pos) - initialValues.rotation : initialValues.rotation * (pos - arr.length / 2) + initialValues.rotation
        }, {
            xPercent: 0,
            rotationZ: 0
        }, 0);
    };

    const fx4Timeline = () => {
        const intervalPixels = 100;
        const totalElements = itemInnerWrap.length;
        const totalWidth = (totalElements - 1) * intervalPixels;
        const offset = (totalWidth / 2) * -1;
        const initialValues = { x: 50 };
        gsap.timeline({
            defaults: { ease: 'power1' },
            scrollTrigger: {
                trigger: elementRef.current,
                start: 'top bottom',
                end: 'center center',
                scrub: true,
                markers: true
            }
        })
        .fromTo(itemInner, {
            xPercent: (pos, _, arr) => pos < arr.length / 2 ? -initialValues.x * pos - initialValues.x : initialValues.x * (pos - arr.length / 2) + initialValues.x,
        }, {
            xPercent: 0,
        }, 0)
        .fromTo(itemInner, {
            scaleX: 1.5,
            scaleY: 0,
            transformOrigin: '50% 0%'
        }, {
            ease: 'power2.inOut',
            scaleX: 1,
            scaleY: 1
        }, 0)
        .fromTo(itemInnerWrap, {
            xPercent: pos => {
                const distanceFromCenter = pos * intervalPixels;
                const xPercent = distanceFromCenter + offset;
                return xPercent;
            },
        }, {
            xPercent: 0,
            stagger: {
                amount: 0.07,
                from: 'center'
            }
        }, 0);
    };

    const fx5Timeline = () => {
        const initialValues = { x: 20 };
        gsap.timeline({
            defaults: { ease: 'power1' },
            scrollTrigger: {
                trigger: elementRef.current,
                start: 'top bottom',
                end: 'center center',
                scrub: true,
                markers: true
            }
        })
        .fromTo(itemInner, {
            xPercent: (pos, _, arr) => pos < arr.length / 2 ? -initialValues.x * pos - initialValues.x : initialValues.x * (pos - arr.length / 2) + initialValues.x,
            yPercent: (pos, _, arr) => pos % 2 === 0 ? -40 : 40,
        }, {
            xPercent: 0,
            yPercent: 0
        }, 0);
    };

    const fx6Timeline = () => {
        const initialValues = { x: 6 };
        gsap.timeline({
            scrollTrigger: {
                trigger: elementRef.current,
                start: 'top bottom',
                end: 'center center',
                scrub: true,
                markers: true
            }
        })
        .fromTo(itemInner, {
            xPercent: (pos, _, arr) => (arr.length - pos - 1) * -initialValues.x - initialValues.x,
        }, {
            ease: 'power1',
            xPercent: 0
        }, 0)
        .fromTo(itemInnerWrap, {
            yPercent: pos => pos * 20
        }, {
            yPercent: 0
        }, 0);
    };

    switch (effect) {
        case '1':
            fx1Timeline();
            break;
        case '2':
            fx2Timeline();
            break;
        case '3':
            fx3Timeline();
            break;
        case '4':
            fx4Timeline();
            break;
        case '5':
            fx5Timeline();
            break;
        case '6':
            fx6Timeline();
            break;
        default:
            fx1Timeline();
            break;
    }

  }, [effect, text, totalCells]);

  const Tag = tag;

  const renderSlices = () => {
    return Array.from({ length: totalCells }).map((_, i) => (
      <div key={i} className={styles.gtextBox}>
        <div className={styles.gtextBoxInner}>
          {text}
        </div>
      </div>
    ));
  };

  return (
    <Tag
      ref={elementRef}
      className={`${styles.gtext} ${className}`}
      data-text={text}
      data-effect={effect}
      style={{ '--gsplits': totalCells } as React.CSSProperties}
    >
      {renderSlices()}
    </Tag>
  );
};

export default SlicedText;
