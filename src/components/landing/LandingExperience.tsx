'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

type LoadingPhase = 'loading' | 'confirming' | 'exiting' | 'done';

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete) {
    return typeof image.decode === 'function' ? image.decode().catch(() => undefined) : Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    image.addEventListener('load', () => resolve(), { once: true });
    image.addEventListener('error', () => resolve(), { once: true });
  });
}

export default function LandingExperience() {
  const [phase, setPhase] = useState<LoadingPhase>('loading');
  const [progress, setProgress] = useState(12);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    root.dataset.studioMotion = 'ready';
    const initialElements: HTMLElement[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -9% 0px', threshold: 0.12 }
    );

    revealElements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.94) {
        initialElements.push(element);
      } else {
        observer.observe(element);
      }
    });

    const revealInitialElements = () => {
      initialElements.forEach((element) => element.classList.add('is-visible'));
    };
    window.addEventListener('studio:landing-ready', revealInitialElements, { once: true });
    const revealFailsafe = window.setTimeout(revealInitialElements, 1_800);

    return () => {
      observer.disconnect();
      window.removeEventListener('studio:landing-ready', revealInitialElements);
      window.clearTimeout(revealFailsafe);
      delete root.dataset.studioMotion;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let loadingFinished = false;
    const timers = new Set<number>();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setProgress(100);
      setPhase('done');
      window.dispatchEvent(new CustomEvent('studio:landing-ready'));
      return;
    }

    const criticalImages = Array.from(
      document.querySelectorAll<HTMLImageElement>('img[data-studio-critical-image="true"]')
    );
    const tasks: Promise<unknown>[] = criticalImages.map(waitForImage);
    let settled = 0;
    const trackedTasks = tasks.map((task) =>
      Promise.resolve(task).finally(() => {
        settled += 1;
        if (active && !loadingFinished) {
          setProgress(Math.min(88, 16 + Math.round((settled / (tasks.length || 1)) * 72)));
        }
      })
    );

    void Promise.all([
      Promise.race([Promise.allSettled(trackedTasks), delay(600)]),
      delay(200),
    ]).then(() => {
      if (!active) return;
      loadingFinished = true;
      setProgress(100);
      setPhase('confirming');
      const exitTimer = window.setTimeout(() => {
        setPhase('exiting');
        window.dispatchEvent(new CustomEvent('studio:landing-ready'));
      }, 80);
      const doneTimer = window.setTimeout(() => {
        setPhase('done');
      }, 380);
      timers.add(exitTimer);
      timers.add(doneTimer);
    });

    return () => {
      active = false;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div id="studio-splash" className="studio-splash" data-phase={phase} aria-label="Preparando o Eleva ORC">
      <div className="studio-splash__glow" aria-hidden="true" />
      <div className="studio-splash__content">
        <div className="studio-splash__brand" aria-hidden="true">
          <span className="studio-splash__mark" />
          <p className="studio-splash__wordmark">ELEVA ORC</p>
        </div>
        <div
          className="studio-splash__track"
          role="progressbar"
          aria-label="Preparando a experiência"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span className="studio-splash__bar" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <p className="studio-splash__status" role="status" aria-live="polite">
          {phase === 'confirming' ? 'Pronto' : 'Preparando diagnóstico...'}
        </p>
      </div>
    </div>
  );
}
