// The forum's section taxonomy. Client developers choose which section codes exist; which community
// holds each code is decided by its candidates (see docs/architecture.md). This is the v1 draft
// tracked in docs/sections.md: candidates are curated here until section communities exist and
// winners move to a directory file and then to voting.

export type ForumSection = {
  /** Directory code: the route segment in `/s/:code`, stable once published. */
  code: string;
  /** Category color, as in Discourse: the badge square and the row's left border. */
  color: string;
  title: string;
  description: string;
  /** Suggested post flairs for the section's communities: projects and thread types. */
  flairs: string[];
  /** Community addresses competing for the code, highest-ranked first. The first one opens at `/s/:code`. */
  candidates: string[];
};

export type ForumCategory = {
  title: string;
  sections: ForumSection[];
};

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    title: 'Bitsocial',
    sections: [
      {
        code: 'announcements',
        color: '#2563eb',
        title: 'Announcements',
        description: 'Releases, roadmap updates and official news. Only the community owners post new threads.',
        flairs: ['Release', 'Roadmap', 'News'],
        candidates: [],
      },
      {
        code: 'general',
        color: '#9ca3af',
        title: 'General & meta',
        description: 'Bitsocial as a whole, how the project is run, and feedback on this forum.',
        flairs: ['Question', 'Proposal', 'Feedback', 'Forum'],
        candidates: [],
      },
      {
        code: 'bso',
        color: '#f59e0b',
        title: 'BSO & Bitsocial Chain',
        description: 'The BSO token, Bitsocial Chain, .bso names and the 5chan Pass.',
        flairs: ['BSO', 'Chain', 'Names', '5chan Pass'],
        candidates: [],
      },
    ],
  },
  {
    title: 'Apps & bots',
    sections: [
      {
        code: 'seedit',
        color: '#22d3ee',
        title: 'Seedit',
        description: 'The Reddit-style Bitsocial client: bugs, feature requests and releases.',
        flairs: ['Bug', 'Feature request', 'Question', 'Release'],
        candidates: [],
      },
      {
        code: '5chan',
        color: '#f97316',
        title: '5chan',
        description: 'The imageboard client, its boards and directories.',
        flairs: ['Bug', 'Feature request', 'Question', 'Release', 'Boards'],
        candidates: [],
      },
      {
        code: 'ai',
        color: '#a855f7',
        title: 'AI & bots',
        description: 'AskWise, the image classifier bot, and other bots that run on Bitsocial communities.',
        flairs: ['AskWise', 'Image classifier', 'Bots'],
        candidates: [],
      },
    ],
  },
  {
    title: 'Development',
    sections: [
      {
        code: 'pkc',
        color: '#1a4fd0',
        title: 'PKC protocol',
        description: 'pkc-js, bitsocial-react-hooks, pubsub and protocol proposals.',
        flairs: ['pkc-js', 'react-hooks', 'pubsub', 'BSIP'],
        candidates: [],
      },
      {
        code: 'challenges',
        color: '#ef4444',
        title: 'Challenges',
        description: 'Anti-spam challenges: spam-blocker, mintpass, ai-moderation-challenge, voucher and captchas.',
        flairs: ['spam-blocker', 'mintpass', 'ai-moderation', 'voucher', 'captcha'],
        candidates: [],
      },
      {
        code: 'infra',
        color: '#10b981',
        title: 'Infrastructure',
        description: 'Indexer, discovery, previewer, seeder, stats, Forge RPC and bitsocial-cli.',
        flairs: ['indexer', 'discovery', 'previewer', 'seeder', 'stats', 'Forge RPC', 'bitsocial-cli'],
        candidates: [],
      },
    ],
  },
  {
    title: 'Off-topic',
    sections: [
      {
        code: 'off-topic',
        color: '#6b7280',
        title: 'Off-topic',
        description: 'Anything that does not fit a project section.',
        flairs: [],
        candidates: [],
      },
    ],
  },
];
