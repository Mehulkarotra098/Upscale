// Numbers for the admin home screen.
import * as media from '../../repos/media.js';
import * as posts from '../../repos/posts.js';

export default {
  stats: {
    method: 'GET',
    async run() {
      const [board, library] = await Promise.all([posts.dashboard(), media.totals()]);
      return { ...board, media: library };
    },
  },
};
