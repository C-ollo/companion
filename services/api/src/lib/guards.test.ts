import type { PointAskResult, Step } from '@skill-passport/shared';
import { describe, expect, it } from 'vitest';

import { guardLogParse, guardPointAsk } from './guards';

const step: Step = {
  step_title: 'Choosing the cycle',
  action: 'Turn the big round dial to Normal.',
  where: 'Right side, next to the small screen.',
  box: { x: 0.6, y: 0.2, w: 0.2, h: 0.2 },
  done_when: 'The word Normal lights up.',
  compared: 'different',
  compared_note: 'Your old washer had the dial on the left.',
  more: null,
  hint: null,
  caution: null,
};

const washer: PointAskResult = {
  appliance: 'washing_machine',
  item_name: 'Front-Loading Washing Machine',
  confidence: 0.92,
  check_statement: 'This looks like a front-loading washer with a big round dial.',
  same_as_before: ['You add soap to the drawer.'],
  different: ['The start button is on the right.'],
  steps: [step],
  unsure_reason: null,
};

describe('guardPointAsk', () => {
  it('passes a confident washer answer through', () => {
    expect(guardPointAsk(washer).steps).toHaveLength(1);
  });

  it.each(['stove', 'gas_stove', 'electric_cooktop', 'space_heater', 'oven', 'medication_bottle'])(
    'never gives steps for %s, even if the model does',
    (appliance) => {
      const out = guardPointAsk({ ...washer, appliance });
      expect(out.steps).toEqual([]);
      expect(out.safety_blocked).toBe(true);
      expect(out.unsure_reason).toMatch(/keep you safe/);
    },
  );

  it.each(['microwave', 'microwave_oven', 'cafe_self_order_kiosk', 'thermostat'])(
    'allows %s',
    (appliance) => {
      const out = guardPointAsk({ ...washer, appliance });
      expect(out.steps).toHaveLength(1);
      expect(out.safety_blocked).toBe(false);
    },
  );

  it('never gives steps below the confidence threshold', () => {
    const out = guardPointAsk({ ...washer, confidence: 0.5 });
    expect(out.steps).toEqual([]);
  });

  it('drops highlight boxes that run off the image', () => {
    const bad = { ...step, box: { x: 0.9, y: 0.1, w: 0.3, h: 0.1 } };
    const out = guardPointAsk({ ...washer, steps: [bad] });
    expect(out.steps[0]?.box).toBeNull();
  });
});

describe('guardLogParse', () => {
  it('replaces unknown skill ids with none', () => {
    const out = guardLogParse({
      skill_id: 'juggling',
      support_level: 'on_my_own',
      confidence: 1.4,
      confirm_question: 'Did you mean juggling?',
      reply: 'Nice.',
      next_skill_id: 'dryer',
    });
    expect(out.skill_id).toBe('none');
    expect(out.next_skill_id).toBe('dryer');
    expect(out.confidence).toBe(1);
  });
});
