// Custom TipTap nodes: Callout (tip/note/warning/stat), CTA box, and Image with a media id + caption (title).
import { Node, mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'paragraph+',
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: 'tip',
        parseHTML: (el) => el.getAttribute('data-variant') || 'tip',
        renderHTML: (a) => ({ 'data-variant': a.variant }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'callout' }, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setCallout:
        (variant = 'tip') =>
        ({ commands }) =>
          commands.wrapIn(this.name, { variant }),
      toggleCallout:
        (variant = 'tip') =>
        ({ commands, editor }) =>
          editor.isActive(this.name) ? commands.lift(this.name) : commands.wrapIn(this.name, { variant }),
      setCalloutVariant:
        (variant) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { variant }),
    };
  },
});

const ctaAttr = (name, def) => ({
  default: def,
  parseHTML: (el) => el.getAttribute(`data-${name}`) || def,
  renderHTML: (a) => ({ [`data-${name}`]: a[name] }),
});
export const Cta = Node.create({
  name: 'cta',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      title: ctaAttr('title', 'Not sure where your business stands online?'),
      text: ctaAttr('text', 'Get a free audit of your website, Google listing and social media. I reply within 24 hours.'),
      button: ctaAttr('button', 'Get my free audit'),
      href: ctaAttr('href', '/#contact'),
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="cta"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'cta' }, HTMLAttributes)];
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'ed-cta';
      dom.contentEditable = 'false';
      const render = (n) => {
        dom.innerHTML = '';
        const t = document.createElement('b');
        t.textContent = n.attrs.title;
        const p = document.createElement('p');
        p.textContent = n.attrs.text;
        const btn = document.createElement('span');
        btn.className = 'ed-cta__btn';
        btn.textContent = `${n.attrs.button} ↗`;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'ed-cta__edit';
        edit.textContent = 'Edit CTA';
        edit.addEventListener('click', (e) => {
          e.preventDefault();
          editor.emit('cta-edit', { pos: getPos(), attrs: n.attrs });
        });
        const tag = document.createElement('small');
        tag.textContent = 'Call to action';
        dom.append(tag, t, p, btn, edit);
      };
      render(node);
      return {
        dom,
        update: (n) => {
          if (n.type.name !== 'cta') return false;
          render(n);
          return true;
        },
      };
    };
  },
  addCommands() {
    return {
      insertCta:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export const MediaImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-id': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-id'),
        renderHTML: (a) => (a['data-id'] ? { 'data-id': a['data-id'] } : {}),
      },
    };
  },
}).configure({ inline: false, allowBase64: false, HTMLAttributes: { loading: 'lazy' } });
