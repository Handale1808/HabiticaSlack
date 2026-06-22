/** @type {Array<{ name: string, description: string, stat_type: "wonder" | "magic" | "acorns", min_amount: number, max_amount: number }>} */
const WIN_CONDITIONS = [
  {
    name: "productive-day",
    description:
      "The user completed 5 or more tasks in a single day.",
    stat_type: "wonder",
    min_amount: 5,
    max_amount: 15,
  },
  {
    name: "creative-burst",
    description:
      "The user completed at least one task that is clearly creative in nature (writing, drawing, designing, brainstorming, making something).",
    stat_type: "magic",
    min_amount: 3,
    max_amount: 10,
  },
  {
    name: "variety-seeker",
    description:
      "The user completed tasks in 3 or more distinct categories in a single day.",
    stat_type: "wonder",
    min_amount: 4,
    max_amount: 12,
  },
  {
    name: "consistent-effort",
    description:
      "The user completed at least one task that demonstrates sustained effort or attention to detail (reviewing, editing, iterating, researching).",
    stat_type: "magic",
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
    stat_type: "magic",
    min_amount: 4,
    max_amount: 12,
  },
  {
    name: "high-achiever",
    description:
      "The user completed 10 or more tasks in a single day.",
    stat_type: "wonder",
    min_amount: 10,
    max_amount: 25,
  },
];

module.exports = WIN_CONDITIONS;
