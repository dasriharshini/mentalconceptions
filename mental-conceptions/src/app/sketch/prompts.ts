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
      "This dataset shows the ratings of three restaurants. Restaurant A has a rating of 2, Restaurant B has a rating of 3, and Restaurant C has a rating of 1. ",
  },
  {
    id: "product",
    scenario:
      "This dataset shows annual retail performance by product department. Electronics accounted for 125 thousand units, Furniture accounted for 90 thousand units, and Clothing accounted for 70 thousand units. ",
  },
  {
    id: "person",
    scenario:
      "This dataset shows the results of a small local poll tallying the votes received for a leadership position across two different voting areas. At the Community Center, Blair had 10 votes, Stella had 12 votes, and Ben had 5 votes. At the Public Library, Blair had 15 votes, Stella had 10 votes, and Ben had 15 votes. ",
  },
  {
    id: "running",
    scenario:
      "This dataset shows a recreational runner's annual mileage over a five-year period. The distance run was 350 miles in 2020, 420 miles in 2021, 390 miles in 2022, 510 miles in 2023, and 600 miles in 2024. ",
  },
  {
    id: "elevation",
    scenario:
      "This dataset shows the elevation reached by each exploration team while surveying a mountain range. Team A reached an elevation of 2,400 meters. Team B reached 1,000 meters, and Team C reached 1,500 meters. ",
  },
  {
    id: "length",
    scenario:
      "This dataset shows the total length of three rivers. River A recorded 45 miles, River B recorded 32 miles, and River C recorded 60 miles. ",
  },
];

export const TASK_COUNT = DATASET_A.length;

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
