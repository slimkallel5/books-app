import { Router } from 'express';
import { LOCALES, MESSAGES, levelLabel, type Locale } from '@maktaba/shared';
import { notFound } from '../../lib/errors.js';

export const i18nRouter = Router();

/** GET /i18n/:locale — the UI dictionary used by web and mobile. */
i18nRouter.get('/:locale', (req, res, next) => {
  const locale = req.params.locale as Locale;
  if (!LOCALES.includes(locale)) return next(notFound('Unsupported locale'));

  const messages = MESSAGES[locale];
  res.json({
    locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    messages,
    levels: {
      all: messages.all,
      g1: messages.g1,
      g2: messages.g2,
      g3: messages.g3,
      g4: messages.g4,
      g5: messages.g5,
      g6: messages.g6,
    },
    levelLabels: Object.fromEntries(
      (['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as const).map((l) => [l, levelLabel(l, locale)]),
    ),
  });
});
