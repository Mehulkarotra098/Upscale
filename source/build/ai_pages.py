"""AI services for small businesses (Nov 2026). Mehul: AI and ML work goes to the sister company, Apex36 Technologies
(apex36tech.com, owned by Yash Soni), "so we have a very broad range to launch".

  /services/whatsapp-chatbot         simple flows set up by U Scale (₹8,000, from the price list); AI chatbots built by Apex36
  /services/ai-chatbot-for-website   built by Apex36, designed into the site by U Scale
  /services/ai-receptionist          Convo AI, Apex36's voice receptionist
  /services/n8n-automation           small automations by U Scale; bigger and AI workflows by Apex36
  /services/ai-marketing             U Scale's own work: content, reels, ads and AI search, with AI doing the first draft

The split keeps the two sites from competing (research/global/ai/AI-SERVICES.md, "don't duplicate" list): U Scale takes
searches that name a channel or a result (a WhatsApp bot, a chatbot on the website, an AI receptionist); Apex36 keeps
searches that name a build or a team (AI development, agents, RAG, private LLMs, workflow automation, hiring developers).
Every page says plainly who builds what, links once to the matching Apex36 page, and publishes no Apex36 price that
Apex36 has not published itself. Market prices are vendors' own pages, quoted as market signals with their sources.
"""
import geo_pages as GP
import depth_art as DA
from geo_pages import icon, price, e, ea
from world_pages import sec, process_sec, work_sec, TEAM
from world_more import features, page_dict

GP.SRC.update({
    'ai-aisensy': ('AiSensy pricing page, seen 16 Nov 2026', 'WhatsApp Business API pricing in India', 'https://aisensy.com/pricing'),
    'ai-codingclave': ('Codingclave, 2026', 'Chatbot price in India 2026', 'https://codingclave.com/blog/ai-chatbot-development-cost-india-2026'),
    'ai-decipher': ('Decipher Insights, 2026', 'AI chatbot cost in India 2026: full pricing breakdown', 'https://decipherconsultancy.in/blog/how-much-does-an-ai-chatbot-cost-in-india-2026/'),
    'ai-softomate': ('Softomate Solutions, 2026', 'AI automation pricing for UK businesses', 'https://www.softomatesolutions.com/blog/ai-automation-pricing-uk-businesses-2026/'),
    'ai-expertsure': ('ExpertSure, 2026', 'AI chatbot costs UK 2026: pricing by type', 'https://www.expertsure.com/uk/ai-tools/ai-chatbot-costs/'),
    'ai-findskill': ('FindSkill, 2026', 'What is an AI receptionist? A 2026 guide for small business', 'https://findskill.ai/learn/ai-receptionist/'),
    'ai-fasthosts': ('Fasthosts, 2026', 'How much does an AI receptionist cost in the UK?', 'https://www.fasthosts.co.uk/blog/how-much-does-an-ai-receptionist-cost/'),
    'ai-bevoice': ('BE Voice, 2026', 'AI receptionist cost in Australia (2026 guide)', 'https://www.binaryelements.com/ai-receptionist-cost-australia'),
    'ai-sarvam': ('Sarvam AI pricing page, seen 16 Nov 2026', 'Voice agents: per-minute rates in INR', 'https://www.sarvam.ai/products/voice-agents/pricing'),
    'ai-edesy': ('edesy, seen 16 Nov 2026', 'n8n developer India: workflow builds and pricing', 'https://edesy.in/services/n8n-developer-india'),
    'ai-growai': ('GrowAI, 2026', 'n8n freelancing in India 2026: projects and rates', 'https://growai.in/n8n-freelancing-india-2026/'),
    'apex36': ('Apex36 Technologies', 'Apex36: AI consulting and custom software development', 'https://apex36tech.com/'),
})

AI_TRAIL = [('Services', '/services')]
WA_SETUP = price('WhatsApp automation')
APEX = 'Apex36 Technologies, our sister company'


def ranges_html(rows):
    """What it costs elsewhere: one card per published price, each with its source. (icon, label, where, value, source key)."""
    li = ''.join(f'<li class="rg__c" style="--i:{i}" data-reveal><span class="rg__ic">{icon(ic)}</span><span class="rg__l"><b>{e(l)}</b><small>{e(w)}</small></span>'
                 f'<span class="rg__v">{e(v)}</span>{GP.src_chip(s)}</li>' for i, (ic, l, w, v, s) in enumerate(rows))
    return f'<ul class="rg" data-reveal-group>{li}</ul>', ' '.join(f'{l} ({w}): {v}.' for _, l, w, v, _ in rows)


def split_html(us, apex, apex_href, apex_label):
    """Who does what: U Scale on the left, Apex36 on the right, one link to the matching Apex36 page."""
    li = lambda items: ''.join(f'<li>{icon("check")}<span>{e(x)}</span></li>' for x in items)
    html = (f'<div class="sp2" data-reveal><div class="sp2__c sp2__c--us"><p class="sp2__k">U Scale</p><h3>You talk to us</h3><ul>{li(us)}</ul></div>'
            f'<span class="sp2__plus" aria-hidden="true">+</span>'
            f'<div class="sp2__c"><p class="sp2__k">Apex36 Technologies</p><h3>Our sister company builds it</h3><ul>{li(apex)}</ul>'
            f'<a class="tlink" href="{ea(apex_href)}" target="_blank" rel="noopener">{e(apex_label)}<span class="sr-only"> (opens in a new tab)</span> ↗</a></div></div>')
    return html, 'U Scale: ' + '; '.join(us) + '. Apex36 Technologies: ' + '; '.join(apex) + '.'


def price_list(rows, note=''):
    """A short list of prices from the price list: (label, price text, small note)."""
    li = ''.join(f'<li style="--i:{i}"><span>{e(l)}<small>{e(n)}</small></span><b>{e(v)}</b></li>' for i, (l, v, n) in enumerate(rows))
    return (f'<div class="fxs" data-reveal><ul class="fxs__p fxs__p--on">{li}</ul>' + (f'<p class="pc__mkt">{e(note)}</p>' if note else '') + '</div>',
            '; '.join(f'{l}: {v}' for l, v, _ in rows) + (f'. {note}' if note else ''))


# ---------------------------------------------------------------- hero cards
def _ai_dk(card, chips, label):
    floats = ''.join(DA._float(f'dk-chip ai__chip{" ai__chip--b" if i else ""}', f'{icon(ic)}{e(t)}', 120 - i * 30, i) for i, (ic, t) in enumerate(chips))
    return DA._dk('ai', card, floats, sheets=2, label=label)


def wa_card(p):
    msgs = [('in', 'Hi, are you open on Sunday?'), ('out', 'Yes, 10 am to 6 pm. Want to book a slot?'), ('in', 'Book a slot')]
    li = ''.join(f'<li class="aw__m aw__m--{s}" style="--i:{i}">{e(t)}</li>' for i, (s, t) in enumerate(msgs))
    card = (f'<div class="dk__card aw"><p class="aw__top"><span class="aw__av">{icon("store")}</span><span><b>Glow Salon</b><small>sample · replies instantly</small></span></p>'
            f'<ol class="aw__list">{li}<li class="aw__m aw__m--out" style="--i:3">Tuesday 11:30 is free. Shall I book it?'
            '<span class="aw__qr"><i>Yes, book it</i><i>Another time</i><i>Talk to a person</i></span></li></ol></div>')
    return _ai_dk(card, [('chat', 'On your own WhatsApp number'), ('users', 'Hands over to you any time')],
                  'A sample WhatsApp chat where a salon’s chatbot answers a question and offers a booking slot')


def site_card(p):
    card = ('<div class="dk__card as"><p class="as__bar"><i></i><i></i><i></i><b>yourbusiness.in</b></p><div class="as__page"><span class="as__h"></span><span class="as__l"></span><span class="as__l as__l--s"></span></div>'
            '<div class="as__w"><p class="as__wh">Ask us anything</p><p class="as__q">Do you deliver to Thane?</p>'
            '<p class="as__a">Yes, Monday to Saturday. Delivery is ₹60 on orders under ₹500.<small>From your delivery page</small></p></div></div>')
    return _ai_dk(card, [('file', 'Answers from your own pages'), ('chat', 'Passes tricky ones to WhatsApp')],
                  'A website chatbot answering a delivery question from the business’s own delivery page')


def call_card(p):
    bars = ''.join(f'<i style="--h:{h};--i:{i}"></i>' for i, h in enumerate([30, 62, 44, 80, 52, 92, 40, 70, 34, 58, 86, 46, 64, 28]))
    card = (f'<div class="dk__card ac"><p class="ac__top"><span class="ac__dot"></span><b>Incoming call</b><small>11:42 pm · after hours</small></p>'
            f'<div class="ac__wave" aria-hidden="true">{bars}</div>'
            '<ol class="ac__t"><li style="--i:0"><small>Caller</small>Can I book a cleaning this Saturday?</li>'
            '<li style="--i:1" class="is-ai"><small>AI receptionist</small>Saturday at 10:30 or 12:00?</li>'
            '<li style="--i:2"><small>Caller</small>10:30, please.</li></ol>'
            f'<p class="ac__done">{icon("calendar")}Booked · Sat 10:30 · summary sent to you</p></div>')
    return _ai_dk(card, [('mic', 'Answers every call'), ('chat', 'Summary on WhatsApp')],
                  'An after-hours call answered by an AI receptionist that books an appointment and sends the owner a summary')


def flow_card(p):
    nodes = [('file', 'New enquiry', 'Website form'), ('layers', 'Added to your sheet', 'Google Sheets'), ('chat', 'WhatsApp to you', 'Seconds later'),
             ('mail', 'Reply to the customer', 'Email, with your price list')]
    li = ''.join(f'<li style="--i:{i}"><span class="af__ic">{icon(ic)}</span><span><b>{e(t)}</b><small>{e(s)}</small></span></li>' for i, (ic, t, s) in enumerate(nodes))
    card = f'<div class="dk__card af"><p class="af__top">{icon("flow")}<b>When an enquiry comes in</b></p><ol class="af__list">{li}</ol></div>'
    return _ai_dk(card, [('bolt', 'Runs every time, at 3 am too'), ('code', 'n8n · Make · Zapier')],
                  'An automation: a website enquiry is added to a sheet, sent to the owner on WhatsApp and answered by email')


def cal_card(p):
    days = [('Mon', 'Reel', 'is-ok'), ('Tue', 'Post', 'is-ok'), ('Wed', 'Carousel', 'is-edit'), ('Thu', 'Story', 'is-draft'), ('Fri', 'Reel', 'is-draft'), ('Sat', 'Post', 'is-draft')]
    lab = {'is-ok': 'Approved', 'is-edit': 'Editing', 'is-draft': 'AI draft'}
    li = ''.join(f'<li class="{c}" style="--i:{i}"><small>{d}</small><b>{t}</b><em>{lab[c]}</em></li>' for i, (d, t, c) in enumerate(days))
    card = f'<div class="dk__card am"><p class="am__top">{icon("calendar")}<b>Next week’s posts</b><small>sample</small></p><ul class="am__g">{li}</ul></div>'
    return _ai_dk(card, [('spark', 'AI drafts the first version'), ('pen', 'A person writes the final one')],
                  'A week of social media posts: AI drafts, a person edits, you approve')


# ---------------------------------------------------------------- the pages
RELATED = [('/services/whatsapp-chatbot', 'AI', 'WhatsApp chatbot for business', 'Answers, bookings and orders on your WhatsApp.'),
           ('/services/ai-chatbot-for-website', 'AI', 'AI chatbot for your website', 'Answers from your own pages, day and night.'),
           ('/services/ai-receptionist', 'AI', 'AI receptionist', 'Every call answered, bookings made.'),
           ('/services/n8n-automation', 'Automation', 'n8n, Make and Zapier automation', 'The repetitive jobs, done for you.'),
           ('/services/ai-marketing', 'Marketing', 'AI marketing for small business', 'Content, reels and ads, with a person in charge.'),
           ('/services/ai-search-visibility', 'AI search', 'AI search visibility', 'How ChatGPT and Gemini describe your business.')]
ALL_AI = ('<a class="tlink" href="/services/whatsapp-chatbot">WhatsApp chatbot</a> · <a class="tlink" href="/services/ai-chatbot-for-website">Website chatbot</a> · '
          '<a class="tlink" href="/services/ai-receptionist">AI receptionist</a> · <a class="tlink" href="/services">All services</a>')


def _ai(**kw):
    kw.setdefault('trail', AI_TRAIL)
    kw.setdefault('lang', 'en-IN')
    kw.setdefault('related', RELATED)
    kw.setdefault('all_links', ALL_AI)
    kw.setdefault('foot_card', ('/pricing', 'Every price is published', 'See the full price list'))
    return page_dict(**kw)


def _whatsapp():
    return _ai(
        slug='whatsapp-chatbot', crumb='WhatsApp chatbot', service='WhatsApp chatbot for business', service_type='Chatbot development',
        countries=['India', 'United Arab Emirates', 'United Kingdom', 'Singapore'],
        title=f'WhatsApp Chatbot for Business, from {WA_SETUP.replace(" setup", "")} | U Scale',
        desc=f'A WhatsApp chatbot that answers questions, takes bookings and hands over to you. Simple flows {WA_SETUP}; AI chatbots built by our sister company Apex36.',
        h1='WhatsApp chatbot for your business', eyebrow='WhatsApp, with Apex36',
        lead='Answers the questions you get fifty times a day, takes bookings and orders, and hands the chat to you when a person is needed. On your own WhatsApp number.',
        stats=[(WA_SETUP.replace(' setup', ''), 'Simple setup'), ('24/7', 'Replies'), ('Yours', 'Number and chats')], art=wa_card,
        hero_more=('#start', 'Two ways to start'), wa="Hi Mehul, I'd like a WhatsApp chatbot for my business. Can we talk?", hero_btn='Ask on WhatsApp',
        og_alt='WhatsApp chatbot for business by U Scale and Apex36: answers, bookings and orders on your own number',
        offers=[('WhatsApp automation', 'INR')], card='Answers, bookings and orders on your own WhatsApp number.',
        blocks=[
            sec('does', 'What it does', 'The questions you answer all day, answered.', '', features([
                ('clock', 'Timings, prices, location', 'The questions people ask before they visit, answered in seconds.'),
                ('calendar', 'Bookings', 'Free slots offered, booked and confirmed, with a reminder the day before.'),
                ('cart', 'Orders', 'Your catalogue in the chat, and a payment link when they’re ready.'),
                ('users', 'A person when needed', 'One tap hands the chat to you or your staff, with the history.'),
                ('globe', 'English, Hindi or Hinglish', 'Replies in the language your customers write in.'),
                ('shield', 'The official way', 'On WhatsApp’s Business Platform through an approved provider, not an unofficial tool that gets numbers banned.')])),
            sec('start', 'Two ways to start', 'Simple flows, or an AI that knows your business.', '', split_html(
                [f'Simple flows: greetings, menus, buttons and auto-replies, {WA_SETUP}', 'The messages written for you, in your voice',
                 'The bot linked from your website and Google listing', 'One person to talk to, from first call to launch'],
                ['AI chatbots that answer from your own price list and documents', 'Bookings and orders connected to your calendar or store',
                 'A fixed quote after a free call, before any work starts'],
                'https://apex36tech.com/services/ai-development', 'Apex36: AI development')),
            sec('costs', 'What it costs elsewhere', 'What a WhatsApp chatbot costs in 2026.', 'Vendors’ own published prices. A useful guide to what’s fair.', ranges_html([
                ('chat', 'Platform with AI replies', 'India, monthly, includes 1,000 AI messages', '₹1,350 a month', 'ai-aisensy'),
                ('tag', 'WhatsApp’s message fees', 'India, per message, at the platform’s rate', '₹1.09 marketing · ₹0.145 service', 'ai-aisensy'),
                ('bot', 'Rule-based bot, built for you', 'India, one-time', '₹50,000–₹1.5 lakh', 'ai-decipher'),
                ('spark', 'WhatsApp AI chatbot, custom', 'India, one-time', '₹2–5.5 lakh', 'ai-codingclave'),
                ('globe', 'WhatsApp AI setup by an agency', 'UK', 'from £2,500 + £99 a month', 'ai-softomate')])),
            process_sec('Live in 1–3 weeks. You test it first.'),
        ],
        answer=(f'U Scale sets up WhatsApp chatbots for small businesses on the official WhatsApp Business Platform: simple flows with menus, buttons and '
                f'auto-replies for {WA_SETUP}, with the platform billed at cost. AI chatbots that answer from your own price list and documents are built by '
                f'{APEX}, at a fixed quote agreed after a free call. The bot runs on your own number and hands chats to a person whenever needed.'),
        facts=[('Simple flows', f'{WA_SETUP} by U Scale; the WhatsApp platform and its message fees are billed at cost'),
               ('AI chatbots', f'Built by {APEX}; fixed quote after a free call'),
               ('Runs on', 'The WhatsApp Business Platform, through a Meta-approved provider'),
               ('Languages', 'English, Hindi and Hinglish'),
               ('You own', 'Your WhatsApp number, your contacts and your chat history'),
               ('Who you talk to', 'Mehul Karotra at U Scale, from first call to launch')],
        faq=[('How much does a WhatsApp chatbot cost?',
              f'Simple flows (greetings, menus, buttons, auto-replies) are {WA_SETUP} with us, plus the WhatsApp platform at cost, which starts around ₹1,350 a '
              'month on one Indian provider. An AI chatbot built on your own content is quoted by Apex36 after a free call; published prices in India run from '
              '₹50,000 for a rule-based bot to ₹2–5.5 lakh for a custom WhatsApp AI chatbot.'),
             ('Will my number get banned?',
              'Not for using a chatbot properly. We set it up on WhatsApp’s official Business Platform through an approved provider, with opt-ins and message '
              'templates that follow WhatsApp’s rules. Numbers get banned for spam and unofficial tools, which we don’t use.'),
             ('Can it reply in Hindi?',
              'Yes. It can reply in English, Hindi or Hinglish, and an AI chatbot can follow the language the customer writes in.'),
             ('Can I still reply myself?',
              'Yes. Any chat can be handed to you or your staff in one tap, with the full history, and the bot steps back.'),
             ('Who is Apex36?',
              'Apex36 Technologies is our sister company, an AI and software studio in India. We handle the conversation, the messages and how it fits your '
              'website; Apex36 builds the AI. You deal with us throughout.')],
        sources=['ai-aisensy', 'ai-decipher', 'ai-codingclave', 'ai-softomate', 'apex36'],
        cta_h='Tell us what people ask you', cta_lead='Send us the five questions you answer most on WhatsApp. We reply with how a bot would handle them and what it would cost.')


def _site_bot():
    return _ai(
        slug='ai-chatbot-for-website', crumb='AI chatbot for websites', service='AI chatbot for your website', service_type='Chatbot development',
        countries=['India', 'United Kingdom', 'United States', 'Australia', 'United Arab Emirates'],
        title='AI Chatbot for Your Website, Built on Your Own Pages | U Scale',
        desc='An AI chatbot that answers visitors from your own pages, says “I don’t know” when it doesn’t, and passes leads to WhatsApp. Built by Apex36.',
        h1='An AI chatbot for your website', eyebrow='AI, with Apex36',
        lead='It answers visitors from your own pages and price list, says so when it doesn’t know, and sends the good leads to your WhatsApp. Designed to look like part of your site.',
        stats=[('Your pages', 'Its only source'), ('24/7', 'Answers'), ('Free', 'First call')], art=site_card, hero_more=('#start', 'Who builds it'),
        wa="Hi Mehul, I'd like an AI chatbot on my website. Can we talk?", hero_btn='Ask on WhatsApp',
        og_alt='An AI chatbot for your website that answers from your own pages, by U Scale and Apex36', offers=[],
        card='Answers visitors from your own pages, day and night.',
        blocks=[
            sec('does', 'What it does', 'A helpful answer at 11 pm, from your own words.', '', features([
                ('file', 'Answers from your content', 'Your pages, price list and FAQs. Nothing it found somewhere else.'),
                ('alert', 'Says when it doesn’t know', 'And offers WhatsApp or a call instead of making something up.'),
                ('users', 'Collects the lead', 'Name and number, sent to you while the visitor is still interested.'),
                ('pen', 'Looks like your site', 'Designed with your colours and type, not a generic bubble.'),
                ('globe', 'English and Hindi', 'Answers in the visitor’s language.'),
                ('search', 'Shows what people ask', 'A monthly list of questions, so you know what to put on the site.')])),
            sec('start', 'Who builds it', 'We design it into your site. Apex36 builds the AI.', '', split_html(
                ['How the chat looks and where it sits on your site', 'What it should and shouldn’t say, written with you', 'Testing on phones before launch'],
                ['The AI that reads your pages and price list', 'Guardrails, so it answers only from your content', 'A fixed quote after a free call'],
                'https://apex36tech.com/services/ai-development', 'Apex36: AI development')),
            sec('costs', 'What it costs elsewhere', 'What a website chatbot costs in 2026.', 'Vendors’ own published prices, as a guide.', ranges_html([
                ('bot', 'Rule-based chatbot', 'India, one-time', '₹50,000–₹1.5 lakh', 'ai-decipher'),
                ('spark', 'AI chatbot on your own content', 'India, one-time', '₹3–8 lakh', 'ai-decipher'),
                ('tag', 'Chatbot on an existing platform, set up by an agency', 'UK', 'from £1,500 + £99 a month', 'ai-softomate'),
                ('globe', 'Mid-range AI chatbot', 'UK, first year', '£3,000–£8,000', 'ai-expertsure')])),
            process_sec('Live in 2–4 weeks. Tested on your questions first.'),
        ],
        answer=(f'U Scale adds AI chatbots to small business websites: the chat is designed into the site by U Scale and the AI is built by {APEX}. It answers '
                'visitors from the business’s own pages and price list, says when it doesn’t know, and passes leads to WhatsApp. The price is a fixed quote '
                'agreed after a free call; published prices in India run from ₹50,000 for a rule-based bot to ₹3–8 lakh for an AI chatbot on your own content.'),
        facts=[('Built by', f'{APEX}; designed into your site by U Scale'),
               ('Answers from', 'Your own pages, price list and FAQs only'),
               ('When it doesn’t know', 'It says so and offers WhatsApp or a call'),
               ('Works on', 'Any website, including ones we didn’t build'),
               ('Price', 'Fixed quote after a free call')],
        faq=[('How much does an AI chatbot for a website cost?',
              'It depends on how much it needs to know and connect to, so Apex36 quotes a fixed price after a free call. As a guide, published prices in India '
              'run from ₹50,000–₹1.5 lakh for a rule-based bot to ₹3–8 lakh for an AI chatbot trained on your own content, plus a small monthly running cost.'),
             ('Will it make things up?',
              'It is built to answer only from your pages and documents, and to say “I don’t know” and offer WhatsApp when the answer isn’t there. You review '
              'its answers to your real questions before it goes live.'),
             ('Does it work if you didn’t build my website?',
              'Yes. It goes onto any website with a short piece of code. If we did build your site, we design it to match exactly.'),
             ('What happens to the chats?',
              'They are yours. Leads go to your WhatsApp or email, and you get a list of what people asked each month. The privacy page on your site is '
              'updated to say the chat exists and how its data is used.'),
             ('Who is Apex36?',
              'Apex36 Technologies is our sister company, an AI and software studio in India. We handle the design and how it fits your site; Apex36 builds the '
              'AI. You deal with us throughout.')],
        sources=['ai-decipher', 'ai-softomate', 'ai-expertsure', 'apex36'],
        cta_h='Show us your website', cta_lead='Send us your site. We reply with the questions a chatbot should answer on it, and what it would cost.')


def _receptionist():
    return _ai(
        slug='ai-receptionist', crumb='AI receptionist', service='AI receptionist for small business', service_type='AI voice receptionist',
        countries=['India', 'United States', 'United Kingdom', 'Australia'],
        title='AI Receptionist for Small Business: Every Call Answered | U Scale',
        desc='An AI receptionist that answers your calls day and night, books appointments and sends you a summary. Convo AI, built by our sister company Apex36.',
        h1='An AI receptionist that answers every call', eyebrow='AI, with Apex36',
        lead='It picks up when you can’t, answers the usual questions, books the appointment and sends you a summary. Convo AI, built by our sister company, Apex36.',
        stats=[('24/7', 'Calls answered'), ('Booked', 'Into your calendar'), ('Free', 'First call')], art=call_card, hero_more=('#costs', 'What it costs'),
        wa="Hi Mehul, I'd like to know more about an AI receptionist for my business.", hero_btn='Ask on WhatsApp',
        og_alt='An AI receptionist for small business that answers calls and books appointments: Convo AI by Apex36, through U Scale', offers=[],
        card='Every call answered, appointments booked, a summary to you.',
        blocks=[
            sec('does', 'What it does', 'The phone, answered. Even at 11 pm.', '', features([
                ('phone', 'Answers every call', 'After hours, on busy days, when you’re with a customer.'),
                ('calendar', 'Books appointments', 'Into your calendar, with a confirmation to the caller.'),
                ('chat', 'Answers the usual questions', 'Timings, prices, location and what to bring.'),
                ('alert', 'Passes on urgent calls', 'To your phone, straight away, when it matters.'),
                ('mail', 'Sends you a summary', 'Who called, what they wanted and what was booked.'),
                ('users', 'Says it’s an assistant', 'Callers know they are talking to an AI, and can ask for you.')])),
            sec('costs', 'What it costs elsewhere', 'What an AI receptionist costs in 2026.', 'Vendors’ own published prices, as a guide.', ranges_html([
                ('globe', 'Market range', 'US, per month', '$25–$300+', 'ai-findskill'),
                ('globe', 'Market range', 'UK, per month; custom setups £2,000–£4,000+', '£30–£500+', 'ai-fasthosts'),
                ('globe', 'Market range', 'Australia, per month', 'A$60–A$500', 'ai-bevoice'),
                ('mic', 'Voice AI, per minute', 'India, pay as you go', '₹3–₹3.50 a minute', 'ai-sarvam')])),
            sec('start', 'Who builds it', 'Convo AI, by Apex36. Set up with us.', '', split_html(
                ['What it should say, written with you', 'Your timings, services and booking rules', 'Linked from your website and Google listing'],
                ['Convo AI, Apex36’s voice receptionist for bookings and appointments', 'Your calendar and phone line connected', 'A fixed quote after a free call'],
                'https://heyyconvo.com/', 'Convo AI by Apex36')),
            process_sec('Live in 1–3 weeks. You call it first.'),
        ],
        answer=(f'U Scale offers an AI receptionist for small businesses through Convo AI, the voice receptionist built by {APEX}. It answers calls day and '
                'night, answers the usual questions, books appointments into your calendar, passes urgent calls to you and sends a summary. It is quoted after '
                'a free call; published AI receptionist prices run from about $25 to $300+ a month in the US and £30 to £500+ a month in the UK.'),
        facts=[('Product', 'Convo AI, an AI voice receptionist for bookings and appointments, by Apex36 Technologies'),
               ('Does', 'Answers calls, books appointments, answers common questions, passes urgent calls on, sends summaries'),
               ('Set up by', 'U Scale and Apex36, with your timings, services and booking rules'),
               ('Price', 'Fixed quote after a free call'),
               ('Languages', 'Confirmed for your setup before you pay')],
        faq=[('How much does an AI receptionist cost?',
              'We quote after a free call, once we know your call volume and what it should do. As a guide, published prices run from about $25 to $300+ a '
              'month in the US, £30 to £500+ a month in the UK, A$60 to A$500 in Australia, and voice AI in India from about ₹3 a minute.'),
             ('Does it work for callers in India, in Hindi?',
              'Tell us your callers’ languages and your phone setup on the first call. We confirm what Convo AI supports for your setup, in writing, before you pay anything.'),
             ('Will callers know it’s an AI?',
              'Yes. It introduces itself as an assistant, and anyone can ask to speak to you. We think that’s the only honest way to do it.'),
             ('What happens with urgent calls?',
              'You choose what counts as urgent. Those calls are passed to your phone straight away; everything else gets booked or noted, with a summary to you.'),
             ('Who is Apex36?',
              'Apex36 Technologies is our sister company, an AI and software studio in India, and Convo AI is its voice receptionist. We set it up with you and stay your contact.')],
        sources=['ai-findskill', 'ai-fasthosts', 'ai-bevoice', 'ai-sarvam', 'apex36'],
        cta_h='Never miss a call', cta_lead='Tell us how many calls you get and when you miss them. We reply with how an AI receptionist would handle them.')


def _automation():
    return _ai(
        slug='n8n-automation', crumb='Automation', service='n8n, Make and Zapier automation for small businesses', service_type='Workflow automation',
        countries=['India', 'United Kingdom', 'Australia'],
        title='n8n, Make and Zapier Automation for Small Businesses | U Scale',
        desc='The repetitive jobs, automated with n8n, Make or Zapier: enquiries into a sheet, WhatsApp alerts, reminders and review requests. Bigger ones built by Apex36.',
        h1='Automation with n8n, Make and Zapier', eyebrow='Automation, with Apex36',
        lead='Enquiries into a sheet, a WhatsApp alert to you, the reply email, the invoice reminder: the jobs you do by hand every day, done automatically and correctly.',
        stats=[('n8n', 'Make · Zapier'), ('24/7', 'Runs'), ('Free', 'First call')], art=flow_card, hero_more=('#does', 'What we automate'),
        wa="Hi Mehul, I'd like to automate some work in my business. Can we talk?", hero_btn='Ask on WhatsApp',
        og_alt='n8n, Make and Zapier automation for small businesses, by U Scale and Apex36', offers=[],
        card='The repetitive jobs, done automatically.',
        blocks=[
            sec('does', 'What we automate', 'The jobs you do by hand every day.', '', features([
                ('file', 'Enquiries', 'From your website, Instagram or ads into one sheet or CRM, with nothing lost.'),
                ('chat', 'Alerts', 'A WhatsApp message to you the moment a lead or order comes in.'),
                ('mail', 'Replies and follow-ups', 'The first reply, your price list, and a follow-up two days later.'),
                ('tag', 'Invoices and reminders', 'Sent on time, with a polite reminder when one is late.'),
                ('star', 'Review requests', 'A message after each job asking for a Google review.'),
                ('layers', 'Reports', 'Leads, sales and ad results in one weekly summary.')])),
            sec('start', 'Who builds it', 'Small jobs by us. Big ones by Apex36.', '', split_html(
                ['Simple automations: forms, sheets, WhatsApp and email', 'Set up in your own n8n, Make or Zapier account', 'A fixed quote after a free call'],
                ['Workflows across several systems, or with AI in them', 'Built as software in your own cloud account when needed', 'Audit trails for sensitive data'],
                'https://apex36tech.com/services/workflow-automation', 'Apex36: workflow automation')),
            sec('costs', 'What it costs elsewhere', 'What automation costs in 2026.', 'Published prices, as a guide.', ranges_html([
                ('flow', 'Simple workflow, freelancer', 'India, 2–3 steps, one trigger', '₹10,000–₹15,000', 'ai-growai'),
                ('spark', 'AI-powered workflow, freelancer', 'India', '₹35,000–₹75,000', 'ai-growai'),
                ('layers', 'Single workflow, agency', 'India; multi-flow project ₹1 lakh', '₹40,000', 'ai-edesy'),
                ('globe', 'Simple workflow, agency', 'UK', 'from £1,500', 'ai-softomate')])),
            process_sec('Running in 1–2 weeks. You watch it work first.'),
        ],
        answer=(f'U Scale sets up simple automations for small businesses in n8n, Make or Zapier, in the business’s own account: enquiries into a sheet or CRM, '
                f'WhatsApp alerts, reply emails, invoice reminders and review requests. Workflows across several systems or with AI in them are built by {APEX}. '
                'Each job has a fixed quote after a free call; published prices in India start around ₹10,000–₹15,000 for a simple workflow.'),
        facts=[('Tools', 'n8n, Make or Zapier, in your own account'),
               ('Simple automations', 'Set up by U Scale; fixed quote after a free call'),
               ('Bigger or AI workflows', f'Built by {APEX}'),
               ('You own', 'The account, the workflows and the data')],
        faq=[('How much does automation cost?',
              'We quote each job after a free call. As a guide, published prices in India run from ₹10,000–₹15,000 for a simple workflow by a freelancer to '
              'about ₹40,000 for a single workflow by an agency, and ₹35,000–₹75,000 for one with AI in it.'),
             ('n8n, Make or Zapier: which one?',
              'Zapier is the easiest to start with, Make handles more complex logic for less, and n8n can run on your own server, which suits data you want '
              'to keep in-house. We pick with you, based on what you already use and the monthly cost.'),
             ('Do I need to pay for the tools?',
              'Usually yes, a monthly plan on the tool you choose, billed to you directly. Small automations often fit on a free or starter plan.'),
             ('What if it breaks?',
              'Each automation sends you an alert if a step fails, and we fix anything we built that stops working within the bug-fix window.')],
        sources=['ai-growai', 'ai-edesy', 'ai-softomate', 'apex36'],
        cta_h='Tell us the boring job', cta_lead='Describe one task you do by hand every day. We reply with how to automate it and what it would cost.')


def _marketing():
    items = [('Social post', price('Social post'), 'Designed for your brand'), ('Reel edit', price('Reel edit (your footage)'), 'From your footage'),
             ('Ads management', price('Ads management'), 'Google and Meta, plus a one-time setup'),
             ('AI search visibility', price('AI search visibility (GEO)'), 'How ChatGPT and Gemini describe you')]
    return _ai(
        slug='ai-marketing', crumb='AI marketing', service='AI marketing for small businesses', service_type='Digital marketing',
        countries=['India', 'United Kingdom', 'United States', 'United Arab Emirates'],
        title='AI Marketing for Small Business: Posts, Reels, Ads | U Scale',
        desc=f'Social posts, reels, ads and AI search for small businesses, with AI doing the first draft and a person doing the rest. Posts from {price("Social post")}, ads from {price("Ads management")}.',
        h1='AI marketing for small businesses', eyebrow='Marketing, done for you',
        lead='Posts, reels and ads where AI writes the first draft and a person who knows your business writes the final one. More for the same money, and none of it reads like a robot.',
        stats=[(price('Social post'), 'Post from'), (price('Reel edit (your footage)'), 'Reel edit'), ('You', 'Approve every post')], art=cal_card,
        hero_more=('#prices', 'See prices'), wa="Hi Mehul, I'd like help with marketing for my business. Can we talk?",
        og_alt='AI marketing for small businesses by U Scale: content, reels and ads with a person in charge', offers=[],
        card='Content, reels and ads, with AI drafts and a person in charge.',
        blocks=[
            sec('does', 'How it works', 'AI for speed. People for taste.', '', features([
                ('spark', 'AI drafts', 'Ideas, captions and ad variations, in minutes instead of hours.'),
                ('pen', 'A person edits', 'In your voice, with your facts. Nothing goes out sounding like a robot.'),
                ('photo', 'Reels', 'Edited from your own footage, with captions people can read on mute.'),
                ('bolt', 'More ad tests', 'More headlines and images tested, so the budget goes to what works.'),
                ('search', 'AI search', 'How ChatGPT, Gemini and Google’s AI describe your business, and fixing what’s wrong.'),
                ('check', 'You approve', 'Every post and ad, before it goes out.')])),
            work_sec(('brandgen', 'sashe', 'vidhi', 'spacestudio', 'antrah', 'roar'), h='Including an AI brand.',
                     lead='BrandGen, an AI tool for on-brand marketing visuals: its website and social media are ours.'),
            sec('prices', 'Prices', 'Every price, published.', '', price_list(items, 'One-off pieces or a monthly plan: 3 months minimum, then month to month.')),
            process_sec('From a free audit to your first posts in a week.'),
        ],
        answer=('U Scale runs marketing for small businesses with AI doing the first draft and a person writing the final one: social posts, reels, Google and '
                f'Meta ads and AI search visibility. A designed social post is {price("Social post")}, a reel edit {price("Reel edit (your footage)")}, ads '
                f'management {price("Ads management")} and AI search visibility {price("AI search visibility (GEO)")}. You approve everything before it goes out.'),
        facts=[('Who does the work', TEAM.replace('Our own team', 'U Scale’s own team').replace('designs and builds it', 'plans, writes and edits it')),
               ('Prices', f'Social post {price("Social post")} · reel edit {price("Reel edit (your footage)")} · ads management {price("Ads management")} · AI search visibility {price("AI search visibility (GEO)")}'),
               ('AI use', 'First drafts, ideas and ad variations; a person edits everything'),
               ('Approval', 'Every post and ad, by you, before it goes out'),
               ('Terms', '3 months minimum for monthly plans, then month to month with 30 days’ notice')],
        faq=[('What is AI marketing for a small business?',
              'Using AI for the slow parts, like first drafts, ideas and ad variations, so a person can spend their time on what makes your marketing yours. '
              'You get more, and better, for the same budget.'),
             ('Will my posts sound like AI?',
              'No. A person rewrites every draft in your voice, with your facts and your way of talking, and you approve it before it goes out.'),
             ('How much does it cost?',
              f'A designed social post is {price("Social post")}, a reel edit from your footage {price("Reel edit (your footage)")}, ads management '
              f'{price("Ads management")} plus a one-time setup, and AI search visibility {price("AI search visibility (GEO)")}. Every price is on our pricing page.'),
             ('Do you work with businesses outside India?',
              'Yes. The work happens over WhatsApp and video calls, and we can invoice in your currency.')],
        sources=[],
        related=[r for r in RELATED if r[0] != '/services/ai-marketing'] + [('/services/social-media-management-mumbai', 'Service', 'Social media management', 'Posts, reels and a monthly plan.')],
        cta_h='Get a free audit', cta_lead='Send your Instagram or website. We reply with what to post first and what it would cost.')


def pages():
    return [_whatsapp(), _site_bot(), _receptionist(), _automation(), _marketing()]
