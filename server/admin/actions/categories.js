// Blog categories.
import { SERVICE_SLUGS } from '../../config.js';
import { conflict, notFound } from '../../lib/errors.js';
import { slugify } from '../../lib/text.js';
import * as categories from '../../repos/categories.js';
import * as input from '../input.js';

export default {
  categories: {
    method: 'GET',
    async run() {
      return { categories: await categories.list() };
    },
  },

  'category-save': {
    method: 'POST',
    async run({ body }) {
      const categoryId = input.id(body.id);
      const name = input.required(body.name, 60, 'Category needs a name');
      const slug = slugify(body.slug || name, 60);
      if (!slug) throw conflict('Use letters or numbers in the category URL');
      if (await categories.slugTaken(slug, categoryId ?? 0)) throw conflict('Another category already uses that URL');
      const row = await categories.save(categoryId, {
        name,
        slug,
        description: input.text(body.description, 400),
        seo_title: input.text(body.seo_title, 120),
        seo_description: input.text(body.seo_description, 320),
        service_slug: SERVICE_SLUGS.has(body.service_slug) ? body.service_slug : '',
        sort: input.int(body.sort, { min: -1000, max: 1000 }),
      });
      if (!row) throw notFound('Category not found');
      return { category: row };
    },
  },

  'category-delete': {
    method: 'POST',
    async run({ body }) {
      if (!(await categories.remove(input.requireId(body.id, 'category')))) throw notFound('Category not found');
      return { ok: true };
    },
  },
};
