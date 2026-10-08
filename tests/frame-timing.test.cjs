const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const WaterInteraction = require('../water-interaction.js');

// Replay the actual animation-clock block without WebGL. Testing only
// advanceMotion with a supplied velocity misses a truncated time denominator
// at its caller, which used to inflate ship speed whenever frames were slow.
const source = fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8');
const start = source.indexOf('    const deltaTime = Math.min(realDelta,');
const end = source.indexOf('    updateAutonomousShip(time);', start);
assert.ok(start >= 0 && end > start, 'animation-clock integration point exists');
const advanceClock = new Function('state', 'realDelta', 'waterSystemConfig', `
  let { simulationTime, simulationAccumulator, sourceMotionAccumulator, previousFrameTime } = state;
  const now = previousFrameTime + realDelta;
  const maxSimulationDelta = 1 / 30;
  ${source.slice(start, end)}
  return { simulationTime, simulationAccumulator, sourceMotionAccumulator, previousFrameTime, deltaTime };
`);

test('slow and uneven render frames cannot inflate measured ship speed', () => {
  for (const fixedTimeStep of [1/30, 1/60, 1/120]) {
    for (const frameDeltas of [[1/10], [1/20], [1/60], [1/144], [.008, .06, .012, .15]]) {
      const config = { fixedTimeStep, maxSubsteps: 3 };
      let clock = { simulationTime: 0, simulationAccumulator: 0,
        sourceMotionAccumulator: 0, previousFrameTime: 0 };
      let x = 0, previousX = 0, samples = 0;
      const speed = 4 * 1852 / 3600 / 40;
      const motionState = {};
      for (let i = 0; i < 160; i++) {
        clock = advanceClock(clock, frameDeltas[i % frameDeltas.length], config);
        x += speed * clock.deltaTime; // vessel uses the simulation's full elapsed time
        const steps = Math.min(config.maxSubsteps, Math.floor(clock.simulationAccumulator / fixedTimeStep));
        if (!steps) continue;
        const dt = clock.sourceMotionAccumulator;
        const motion = WaterInteraction.advanceMotion(motionState, (x - previousX) / dt, 0, dt,
          { isShip: true, threshold: .001 });
        assert.ok(Math.abs(motion.rawSpeed - speed) < 1e-12,
          `incorrect speed at fixed step ${fixedTimeStep}, frame pattern ${frameDeltas}`);
        previousX = x;
        clock.sourceMotionAccumulator = 0;
        clock.simulationAccumulator -= steps * fixedTimeStep;
        samples++;
      }
      assert.ok(samples > 0);
    }
  }
});
