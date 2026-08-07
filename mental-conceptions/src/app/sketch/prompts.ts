export type SketchCondition = "A" | "B";

export type SketchPrompt = {
  id: string;
  taskIndex: number;
  condition: SketchCondition;
  scenario: string;
};

type PromptBase = {
  id: string;
  scenario: string;
};

const DATASET_A: PromptBase[] = [
  {
    id: "ranking",
    scenario:
      "This dataset shows the rankings of three restaurants. Restaurant N has a ranking of 2, Restaurant G has a ranking of 3, and Restaurant S has a ranking of 1. ",
  },
  {
    id: "countdown",
    scenario:
      "This dataset shows the number of daily tasks a team completed at different time points before the project deadline. The team completed 6 tasks at 2 days before the project deadline, 4 tasks at 3 days before the project deadline, and 10 tasks at 1 day before the project deadline. "
  },
  {
    id: "sunlight",
    scenario:
      "This dataset shows the level of sunlight exposure across three zones of the sea. The central zone had 80% of sunlight exposure, the northern zone had 20%, and the southern zone had 50%. ",
  },
  {
    id: "time",
    scenario:
      "This dataset shows the class assignments that a student has completed during different times of day. The student completed science in the afternoon, English in the morning, and math in the evening. ",
  },
  {
    id: "politics",
    scenario:
  "This dataset shows the political orientation scores of three politicians, where -100 = completely liberal, 0 = neutral, and 100 = completely conservative. Politician N had a score of 0, Politician G had a score of -30, and Politician S had a score of 80. "
}, 
  {
    id: "season", 
    scenario:
    "This dataset shows the bird sightings at a nature reserve during three seasons. The reserve had 50 sightings in the spring season, 20 sightings in the fall season, and 80 sightings in the following spring. "
  }

];

const DATASET_B: PromptBase[] = [
  {
    id: "rating",
    scenario:
      "This dataset shows the ratings of three restaurants. Restaurant N has a rating of 2, Restaurant G has a rating of 3, and Restaurant S has a rating of 1. ",
  },
  {
    id: "countup",
    scenario:
      "This dataset shows the number of daily tasks a team completed at different time points since the project started. The team completed 6 tasks at 2 days since the project started, 4 tasks at 3 days since the project started, and 10 tasks at 1 day since the project started. ",
  },
  {
    id: "oil",
    scenario:
      "This dataset shows the level of oil contamination across three zones of the sea. The central zone had 80% of oil contamination, the northern zone had 20%, and the southern zone had 50%. ",
  },
  {
    id: "effort",
    scenario:
      "This dataset shows the class assignments that a student has considered as different levels of effort. The student considered science as medium effort, English as low effort, and math as high effort. ",
  },
  {
    id: "support",
    scenario:
      "This dataset shows the public support scores of three politicians, where -100 = completely opposed, 0 = neutral, and 100 = completely supportive. Politician N had a score of 0, Politician G had a score of -30, and Politician S had a score of 80. ",
  },
  {
    id: "year",
    scenario:
      "This dataset shows the bird sightings at a nature reserve during three years. The reserve had 50 sightings in the year 2010, 20 sightings in the year 2012, and 60 sightings in the year 2014. ",
  },
];

export const TASK_COUNT = DATASET_B.length; // change this depending on which dataset is used

export const BASE_CONDITION_SEQUENCE: SketchCondition[] = [
  "A",
  "A",
  "A",
  "A",
  "A",
  "A",
];

export const getComplementConditionSequence = (
  sequence: SketchCondition[]
): SketchCondition[] => sequence.map((condition) => (condition === "A" ? "B" : "A"));

export const getConditionSequenceForParticipant = (
  participantSlot: number
): SketchCondition[] => {
  const isOddSlot = participantSlot % 2 === 1;
  return isOddSlot
    ? BASE_CONDITION_SEQUENCE
    : getComplementConditionSequence(BASE_CONDITION_SEQUENCE);
};

export const getSketchPrompts = (
  conditionSequence: SketchCondition[]
): SketchPrompt[] =>
  conditionSequence.map((condition, taskIndex) => {
    const source = condition === "A" ? DATASET_A : DATASET_B;
    const prompt = source[taskIndex];

    return {
      ...prompt,
      taskIndex,
      condition,
    };
  });

export const getSketchPromptsForParticipant = (
  participantNumber: number
): SketchPrompt[] =>
  getSketchPrompts(getConditionSequenceForParticipant(participantNumber));
