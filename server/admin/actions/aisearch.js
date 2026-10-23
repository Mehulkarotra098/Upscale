// Admin → AI search: which AI assistants and crawlers read the site, and which pages they used.
import { hasDb } from '../../db/client.js';
import { AI_LOG_KEY } from '../../config.js';
import { KINDS } from '../../ai/agents.js';
import * as aiHits from '../../repos/aihits.js';

export default {
  'ai-search': {
    method: 'GET',
    async run({ params }) {
      const days = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
      const data = hasDb() ? await aiHits.summary(days) : null;
      return { ...data, days, kinds: KINDS, logging: Boolean(AI_LOG_KEY) };
    },
  },
};
