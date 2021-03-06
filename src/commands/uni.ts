import { padEnd } from 'lodash';
import moment from 'moment-timezone';

import { PeriodType } from '../../term_data/types';
import getStatus from '../getStatus';
import { Command } from '../types';

const PERIOD_EMOJI_MAP: Record<PeriodType, string> = {
  exam: '📝',
  recess: '📘',
  vacation: '🏖',
  class: '📚',
};

const uni: Command = {
  initialHandler: async (ctx) => {
    const now = moment.tz('Asia/Singapore');
    const currentStatus = getStatus(now);

    let message = '';

    for (const [uni, status] of Object.entries(currentStatus)) {
      const {
        term,
        daysToVacation,
        nextPeriod,
        currentPeriod,
        prevPeriod,
      } = status;

      message += `*${uni}*\n`;
      message += `${term.label}\n`;

      if (currentPeriod) {
        const currentPeriodEnd = moment.tz(
          currentPeriod.date_end,
          'Asia/Singapore'
        );

        // Fixes diff counting by using inclusive end
        currentPeriodEnd.set('hour', 23);
        currentPeriodEnd.set('minute', 59);
        currentPeriodEnd.set('second', 59);

        message += `\`${padEnd(currentPeriod.type, 10)}\` ends in \`${moment
          .tz(currentPeriodEnd, 'Asia/Singapore')
          .diff(now, 'days')}d\` _(${currentPeriodEnd.format('D MMM')})_\n`;
      }

      if (nextPeriod) {
        message += `\`${padEnd(nextPeriod.type, 10)}\` begins in \`${moment
          .tz(nextPeriod.date_start, 'Asia/Singapore')
          .diff(now, 'days')}d\`\n`;
      }

      if (
        currentPeriod?.type !== 'vacation' &&
        nextPeriod?.type !== 'vacation'
      ) {
        message += `\`vacation  \` begins in \`${daysToVacation}d\``;
      }

      message += '\n\n';
    }

    ctx.replyWithMarkdown(message);
  },
};

export default uni;
