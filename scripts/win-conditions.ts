type StatType = "wonder" | "magic" | "acorns";

export interface WinCondition {
  name: string;
  description: string;
  stat_type: StatType;
  min_amount: number;
  max_amount: number;
}

const WIN_CONDITIONS: WinCondition[] = [
  // --- software dev ---
  {
    name: "shipped-it",
    description:
      "The user deployed or built files for production. Look for tasks like 'deployed changes', 'built files', 'pushed to prod', or similar.",
    stat_type: "wonder",
    min_amount: 8,
    max_amount: 20,
  },
  {
    name: "planner",
    description:
      "The user created or completed an implementation plan. Look for tasks like 'implementation plan', 'planned', 'mapped out', 'wrote plan for'.",
    stat_type: "magic",
    min_amount: 5,
    max_amount: 15,
  },
  {
    name: "full-stack",
    description:
      "The user worked on both frontend and backend tasks in the same day. Frontend includes UI, components, pages, styles. Backend includes routes, middleware, webhooks, database, auth.",
    stat_type: "wonder",
    min_amount: 6,
    max_amount: 18,
  },
  {
    name: "bug-slayer",
    description:
      "The user fixed, debugged, or resolved an issue. Look for tasks like 'fixed', 'resolved', 'debugged', 'looked into why', 'deleted', 'removed'.",
    stat_type: "magic",
    min_amount: 4,
    max_amount: 12,
  },
  {
    name: "hook-line-sinker",
    description:
      "The user created or updated a custom hook. Look for tasks like 'made use[X] hook', 'updated hook', 'made hook'.",
    stat_type: "magic",
    min_amount: 5,
    max_amount: 14,
  },
  {
    name: "integration-wizard",
    description:
      "The user worked on integrating a third-party service. Look for mentions of Stripe, Supabase, Habitica, Slack, webhooks, APIs, or external services.",
    stat_type: "wonder",
    min_amount: 6,
    max_amount: 16,
  },
  {
    name: "ui-glow-up",
    description:
      "The user made multiple UI or visual improvements in a single day. Look for tasks like 'updated UI', 'changed appearance', 'updated styles', 'updated button', 'changed colours', 'made shiny'.",
    stat_type: "acorns",
    min_amount: 4,
    max_amount: 12,
  },
  {
    name: "data-architect",
    description:
      "The user worked on data structures, database tables, or data models. Look for tasks like 'made table', 'created bucket', 'made data structures', 'updated schema'.",
    stat_type: "magic",
    min_amount: 5,
    max_amount: 15,
  },
  {
    name: "auth-whisperer",
    description:
      "The user worked on authentication, login, sessions, or middleware. Look for tasks like 'updated auth', 'made login', 'updated middleware', 'persist login', 'sign up'.",
    stat_type: "wonder",
    min_amount: 5,
    max_amount: 14,
  },
  {
    name: "productive-day",
    description:
      "The user completed 5 or more tasks in a single day.",
    stat_type: "wonder",
    min_amount: 5,
    max_amount: 15,
  },
  {
    name: "on-a-roll",
    description:
      "The user completed 10 or more tasks in a single day.",
    stat_type: "wonder",
    min_amount: 12,
    max_amount: 28,
  },
  {
    name: "legendary-day",
    description:
      "The user completed 20 or more tasks in a single day. This is exceptional.",
    stat_type: "wonder",
    min_amount: 20,
    max_amount: 40,
  },
 
  // --- planning and organisation ---
  {
    name: "list-goblin",
    description:
      "The user made, organised, or worked through a list of tasks. Look for mentions of lists, task lists, to-dos, or any task explicitly about organising or writing down tasks.",
    stat_type: "acorns",
    min_amount: 3,
    max_amount: 10,
  },
  {
    name: "admin-mode",
    description:
      "The user completed tasks that are administrative or organisational in nature — emails, bookings, forms, settings, accounts, billing, or anything that is not directly creative or technical but still necessary.",
    stat_type: "acorns",
    min_amount: 3,
    max_amount: 9,
  },
  {
    name: "researcher",
    description:
      "The user spent time researching or investigating something. Look for tasks like 'looked into', 'researched', 'investigated', 'read about', 'found out about'.",
    stat_type: "acorns",
    min_amount: 3,
    max_amount: 10,
  },
 
  // --- touching grass and life stuff ---
  {
    name: "grass-toucher",
    description:
      "The user did something outside, in nature, or away from the screen. Look for tasks like 'went outside', 'walked', 'garden', 'park', 'fresh air', 'run', or any activity that implies leaving the house.",
    stat_type: "acorns",
    min_amount: 5,
    max_amount: 14,
  },
  {
    name: "body-mover",
    description:
      "The user did physical exercise or movement. Look for tasks like 'gym', 'workout', 'yoga', 'run', 'walk', 'swim', 'stretch', or any physical activity.",
    stat_type: "acorns",
    min_amount: 5,
    max_amount: 14,
  },
  {
    name: "well-fed",
    description:
      "The user cooked, meal prepped, or ate intentionally. Look for tasks like 'cooked', 'meal prep', 'made food', 'groceries', 'ate', 'made dinner/lunch/breakfast'.",
    stat_type: "acorns",
    min_amount: 3,
    max_amount: 9,
  },
  {
    name: "social-creature",
    description:
      "The user spent time with or reached out to another person. Look for tasks like 'sent email', 'messaged', 'called', 'met with', 'hung out', 'visited', 'had coffee', 'sent [person] email'.",
    stat_type: "acorns",
    min_amount: 4,
    max_amount: 11,
  },
  {
    name: "self-care",
    description:
      "The user did something intentionally restorative or caring for themselves. Look for tasks like 'rested', 'nap', 'bath', 'skincare', 'journalled', 'meditated', 'mental health', or any task about looking after themselves.",
    stat_type: "acorns",
    min_amount: 4,
    max_amount: 12,
  },
  {
    name: "creative-spark",
    description:
      "The user did something creative outside of coding — writing, drawing, designing for fun, crafting, photography, music, or any non-technical creative task.",
    stat_type: "acorns",
    min_amount: 4,
    max_amount: 13,
  },
  {
    name: "learner",
    description:
      "The user learned something new or studied. Look for tasks involving reading, courses, tutorials, research for personal growth, or any task that implies acquiring knowledge.",
    stat_type: "acorns",
    min_amount: 4,
    max_amount: 12,
  },
  {
    name: "productive-day",
    description: "The user completed 5 or more tasks in a single day.",
    stat_type: "wonder",
    min_amount: 5,
    max_amount: 15,
  },
  {
    name: "creative-burst",
    description:
      "The user completed at least one task that is clearly creative in nature (writing, drawing, designing, brainstorming, making something).",
    stat_type: "acorns",
    min_amount: 3,
    max_amount: 10,
  },
  {
    name: "variety-seeker",
    description: "The user completed tasks in 3 or more distinct categories in a single day.",
    stat_type: "wonder",
    min_amount: 4,
    max_amount: 12,
  },
  {
    name: "consistent-effort",
    description:
      "The user completed at least one task that demonstrates sustained effort or attention to detail (reviewing, editing, iterating, researching).",
    stat_type: "acorns",
    min_amount: 2,
    max_amount: 8,
  },
  {
    name: "health-focus",
    description:
      "The user completed at least one task related to physical health, exercise, sleep, or wellbeing.",
    stat_type: "acorns",
    min_amount: 3,
    max_amount: 10,
  },
  {
    name: "social-connection",
    description:
      "The user completed at least one task involving communication, helping others, meeting people, or collaboration.",
    stat_type: "acorns",
    min_amount: 2,
    max_amount: 8,
  },
  {
    name: "learning-day",
    description:
      "The user completed at least one task related to learning, studying, reading, or skill development.",
    stat_type: "acorns",
    min_amount: 4,
    max_amount: 12,
  },
  {
    name: "high-achiever",
    description: "The user completed 10 or more tasks in a single day.",
    stat_type: "wonder",
    min_amount: 10,
    max_amount: 25,
  },
];

export default WIN_CONDITIONS;
