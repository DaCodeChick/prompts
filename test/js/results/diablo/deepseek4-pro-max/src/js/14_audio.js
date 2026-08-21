'use strict';
/* ============================================================
   Emberfall - 14_audio.js : WebAudio synth SFX
   ============================================================ */
var Audio = (function () {

  var ctx = null, master = null;
  var on = true;
  var unlocked = false;

  function ensure() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.45;
        master.connect(ctx.destination);
      } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { } }
    return ctx;
  }
  function unlock() {
    unlocked = true;
    ensure();
  }

  function tone(freq, dur, type, vol, freqEnd, delay) {
    if (!on || !unlocked) return;
    var c = ensure();
    if (!c) return;
    try {
      var t0 = c.currentTime + (delay || 0);
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    } catch (e) { }
  }
  function noise(dur, vol, filterFreq, delay, type) {
    if (!on || !unlocked) return;
    var c = ensure();
    if (!c) return;
    try {
      var t0 = c.currentTime + (delay || 0);
      var len = Math.max(1, Math.floor(c.sampleRate * dur));
      var buf = c.createBuffer(1, len, c.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = c.createBufferSource();
      src.buffer = buf;
      var f = c.createBiquadFilter();
      f.type = type || 'lowpass';
      f.frequency.value = filterFreq || 800;
      var g = c.createGain();
      g.gain.setValueAtTime(vol || 0.2, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f);
      f.connect(g);
      g.connect(master);
      src.start(t0);
    } catch (e) { }
  }

  function sfx(name) {
    switch (name) {
      case 'click': tone(620, 0.05, 'square', 0.08); break;
      case 'pickup': tone(760, 0.06, 'sine', 0.14); tone(1180, 0.08, 'sine', 0.12, null, 0.05); break;
      case 'gold': tone(1250, 0.05, 'triangle', 0.14); tone(1650, 0.07, 'triangle', 0.13, null, 0.05); break;
      case 'potion': tone(300, 0.22, 'sine', 0.15, 520); noise(0.2, 0.05, 900); break;
      case 'firebolt': noise(0.18, 0.14, 2400); tone(220, 0.2, 'sawtooth', 0.1, 70); break;
      case 'firehit': noise(0.14, 0.16, 1200); break;
      case 'nova': tone(95, 0.4, 'sawtooth', 0.22, 40); noise(0.3, 0.12, 500); break;
      case 'bolt': tone(420, 0.14, 'square', 0.09, 180); break;
      case 'heal': tone(520, 0.4, 'sine', 0.1); tone(660, 0.4, 'sine', 0.09, null, 0.03); tone(880, 0.5, 'sine', 0.06, null, 0.08); break;
      case 'hurt': tone(190, 0.16, 'sawtooth', 0.16, 85); noise(0.1, 0.1, 600); break;
      case 'hit': noise(0.07, 0.15, 500); tone(140, 0.08, 'square', 0.08, 90); break;
      case 'death': noise(0.4, 0.14, 700); tone(280, 0.5, 'sawtooth', 0.13, 55); break;
      case 'roar': tone(80, 0.85, 'sawtooth', 0.24, 38); noise(0.6, 0.12, 300); break;
      case 'levelup': tone(523, 0.12, 'triangle', 0.14); tone(659, 0.12, 'triangle', 0.14, null, 0.1); tone(784, 0.2, 'triangle', 0.14, null, 0.2); break;
      case 'quest': tone(587, 0.1, 'triangle', 0.13); tone(880, 0.16, 'triangle', 0.13, null, 0.1); break;
      case 'reward': tone(440, 0.14, 'triangle', 0.14); tone(554, 0.14, 'triangle', 0.14, null, 0.12); tone(659, 0.24, 'triangle', 0.14, null, 0.24); break;
      case 'door': tone(150, 0.35, 'sawtooth', 0.09, 100); noise(0.3, 0.05, 300); break;
      case 'gate': noise(0.5, 0.12, 200); tone(60, 0.5, 'sawtooth', 0.12, 30); break;
      case 'chest': tone(130, 0.25, 'sawtooth', 0.1, 90); noise(0.12, 0.1, 400, 0.2); break;
      case 'stairs': noise(0.35, 0.08, 700); break;
      case 'equip': tone(700, 0.06, 'square', 0.09); tone(900, 0.05, 'square', 0.07, null, 0.05); break;
      case 'buy': tone(990, 0.06, 'triangle', 0.12); tone(1320, 0.08, 'triangle', 0.11, null, 0.06); break;
      case 'sell': tone(1250, 0.06, 'triangle', 0.12); tone(990, 0.08, 'triangle', 0.1, null, 0.06); break;
      case 'deny': tone(140, 0.14, 'square', 0.08, 110); break;
    }
  }

  function toggle() { on = !on; }
  function enabled() { return on; }

  return { sfx: sfx, toggle: toggle, enabled: enabled, unlock: unlock };
})();
