/* ==========================================================================
   HOLLOW FRAME : link-in-bio
   Where to edit things:
   - Social links ........ index.html  (search for "EDIT YOUR SOCIAL LINKS HERE")
   - Contact email ....... index.html  (search for "EDIT YOUR CONTACT EMAIL HERE")
   - Sound volume ........ SOUND_VOLUME below
   Everything here is optional polish: the page works without JavaScript.
   ========================================================================== */

(() => {
  'use strict';

  /** Ambient sound loudness, 0 (silent) to 1. Keep it low: it is a mood, not music. */
  const SOUND_VOLUME = 0.3;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------ 1 */
  /* Start the opening sequence once the key images and the font are ready,
     so the lights come on cleanly instead of popping in piece by piece.   */
  function whenReady() {
    const decode = (img) => (img && img.decode ? img.decode().catch(() => {}) : Promise.resolve());
    const images = Promise.all([
      decode(document.querySelector('.scene__img')),
      decode(document.querySelector('.brand__mark')),
      decode(document.querySelector('.brand__word')),
    ]);
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 2200)); // never wait forever
    return Promise.race([Promise.all([images, fonts]), timeout]);
  }
  whenReady().then(() => root.classList.add('is-ready'));

  /* ------------------------------------------------------------------ 2 */
  /* Menu (native <dialog>: focus trap, Escape key and focus return are built in) */
  const menu = document.getElementById('menu');
  const menuBtn = document.getElementById('menu-btn');
  const menuClose = document.getElementById('menu-close');

  if (menu && menuBtn) {
    const canModal = typeof menu.showModal === 'function';

    const openMenu = () => {
      if (canModal) menu.showModal(); else menu.setAttribute('open', '');
      menuBtn.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      if (canModal) menu.close(); else menu.removeAttribute('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.focus();
    };

    menuBtn.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    // clicking the dark area outside the card closes it
    menu.addEventListener('click', (e) => { if (e.target === menu) closeMenu(); });
    // Escape closes natively; keep aria-expanded in sync
    menu.addEventListener('close', () => menuBtn.setAttribute('aria-expanded', 'false'));
  }

  /* ------------------------------------------------------------------ 3 */
  /* Ambient sound: generated live with the Web Audio API (no audio files,
     nothing downloaded). OFF by default and only starts after a click.   */
  const soundBtn = document.getElementById('sound-btn');
  const AudioCtx = window.AudioContext || window.webkitAudioContext;

  if (soundBtn && !AudioCtx) {
    soundBtn.hidden = true; // very old browser: hide the control rather than show a dead button
  }

  if (soundBtn && AudioCtx) {
    let ctx = null;
    let master = null;
    let swellTimer = null;
    let suspendTimer = null;
    let isOn = false;

    const build = () => {
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // everything passes through a slowly moving low-pass so it stays soft
      const soften = ctx.createBiquadFilter();
      soften.type = 'lowpass';
      soften.frequency.value = 700;
      soften.connect(master);

      const sweep = ctx.createOscillator();
      const sweepDepth = ctx.createGain();
      sweep.frequency.value = 0.045;
      sweepDepth.gain.value = 260;
      sweep.connect(sweepDepth).connect(soften.frequency);
      sweep.start();

      // low drone: four sine/triangle voices, slightly out of tune with each other
      [[55, 'sine', 0.5], [55.4, 'sine', 0.42], [82.6, 'triangle', 0.14], [110.3, 'sine', 0.07]]
        .forEach(([freq, type, level]) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.value = freq;
          gain.gain.value = level;
          osc.connect(gain).connect(soften);
          osc.start();
        });

      // distant wind: looped brown noise through a band-pass, level drifting slowly
      const length = ctx.sampleRate * 5;
      const noise = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = noise.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        data[i] = last * 3.5;
      }
      const wind = ctx.createBufferSource();
      wind.buffer = noise;
      wind.loop = true;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 360;
      band.Q.value = 0.7;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.16;
      const windLfo = ctx.createOscillator();
      const windLfoDepth = ctx.createGain();
      windLfo.frequency.value = 0.07;
      windLfoDepth.gain.value = 0.1;
      windLfo.connect(windLfoDepth).connect(windGain.gain);
      wind.connect(band).connect(windGain).connect(master);
      wind.start();
      windLfo.start();

      return soften;
    };

    // now and then a slow, uneasy two-note swell (a half-step apart)
    const scheduleSwell = (soften) => {
      clearTimeout(swellTimer);
      swellTimer = setTimeout(() => {
        if (!isOn || !ctx) return;
        const t = ctx.currentTime;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.09, t + 4.5);
        env.gain.linearRampToValueAtTime(0, t + 10);
        env.connect(soften);
        [233.1, 246.9].forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(env);
          osc.start(t);
          osc.stop(t + 10.5);
        });
        scheduleSwell(soften);
      }, 22000 + Math.random() * 24000);
    };

    let softener = null;

    const setLabel = (on) => {
      soundBtn.setAttribute('aria-pressed', String(on));
      soundBtn.setAttribute('aria-label', on ? 'Turn ambient sound off' : 'Turn ambient sound on');
    };

    const turnOn = async () => {
      clearTimeout(suspendTimer);
      if (!ctx) softener = build();
      await ctx.resume();
      isOn = true;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(SOUND_VOLUME, t + 3);
      scheduleSwell(softener);
      setLabel(true);
    };

    const turnOff = () => {
      isOn = false;
      clearTimeout(swellTimer);
      setLabel(false);
      if (!ctx) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.9);
      suspendTimer = setTimeout(() => { if (!isOn && ctx) ctx.suspend(); }, 1000);
    };

    soundBtn.addEventListener('click', () => {
      (isOn ? Promise.resolve(turnOff()) : turnOn()).catch(() => setLabel(false));
    });

    // never keep making noise in a background tab
    document.addEventListener('visibilitychange', () => {
      if (!ctx || !isOn) return;
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
  }

  /* ------------------------------------------------------------------ 4 */
  /* Very small mouse parallax on the background (desktop only, off with
     reduced motion or touch).                                            */
  const parallax = document.querySelector('.scene__parallax');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (parallax && finePointer.matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      parallax.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(tick) : null;
    };

    window.addEventListener('pointermove', (e) => {
      if (reduceMotion.matches || e.pointerType !== 'mouse') return;
      tx = -((e.clientX / window.innerWidth) - 0.5) * 16;
      ty = -((e.clientY / window.innerHeight) - 0.5) * 10;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ 5 */
  /* Friendly reminder in the browser console while links are still placeholders */
  const placeholders = [...document.querySelectorAll('a[href*="YOUR_"]')];
  if (placeholders.length) {
    console.info(
      '[Hollow Frame] Placeholder links still in place. Edit them in index.html:\n' +
      placeholders.map((a) => `  - ${a.getAttribute('href')}`).join('\n')
    );
  }
})();
