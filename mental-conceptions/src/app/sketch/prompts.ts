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
    id: "rating",
    scenario:
      "This dataset shows the ratings of three restaurants. Restaurant A has a rating of 4, Restaurant B has a rating of 5, and Restaurant C has a rating of 2. ",
  },
  {
    id: "state",
    scenario:
      "This dataset shows annual retail performance by US state. California accounted for 125 thousand units, Texas accounted for 90 thousand units, and Florida accounted for 70 thousand units. ",
  },
  {
    id: "fruit",
    scenario:
      "This dataset shows the results of a small local poll tallying the votes received for favorite fruits. Banana had 10 votes, strawberries had 15 votes, and blueberries had 12 votes. ",
  },
  {
    id: "running",
    scenario:
      "This dataset shows a recreational runner's annual mileage over a five-year period. The distance run was 350 miles in 2020, 420 miles in 2021, 390 miles in 2022, 510 miles in 2023, and 600 miles in 2024. ",
  },
  {
    id: "depth",
    scenario:
      "This dataset shows the depth reached by each exploration team while surveying an underwater canyon. Team A reached a depth of 2,400 meters. Team B reached 1,000 meters, and Team C reached 1,500 meters. ",
  },
  {
    id: "area",
    scenario:
      "This dataset shows the total surface area of three lakes. Lake A recorded 60 square miles, Lake B recorded 45 square miles, and Lake C recorded 32 square miles. ",
  },
];

const DATASET_B: PromptBase[] = [
  {
    id: "ranking",
    scenario:
      "This dataset shows the rankings of three restaurants. Restaurant A has a ranking of 4, Restaurant B has a ranking of 5, and Restaurant C has a ranking of 2. ",
  },
  {
    id: "product",
    scenario:
      "This dataset shows annual retail performance by product department. Electronics accounted for 125 thousand units, Furniture accounted for 90 thousand units, and Clothing accounted for 70 thousand units. ",
  },
  {
    id: "person",
    scenario:
      "This dataset shows the results of a small local poll tallying the votes received for a leadership position. Blair had 10 votes, Stella had 15 votes, and Ben had 12 votes. ",
  },
  {
    id: "stock",
    scenario:
      "This dataset shows the stock price of a company over a five-year period. The stock price was $350 in 2020, $420 in 2021, $390 in 2022, $510 in 2023, and $600 in 2024. ",
  },
  {
    id: "elevation",
    scenario:
      "This dataset shows the elevation reached by each exploration team while surveying a mountain range. Team A reached an elevation of 2,400 meters. Team B reached 1,000 meters, and Team C reached 1,500 meters. ",
  },
  {
    id: "length",
    scenario:
      "This dataset shows the total length of three rivers. River A recorded 60 miles, River B recorded 45 miles, and River C recorded 32 miles. ",
  },
];

export const TASK_COUNT = DATASET_A.length;

export const BASE_CONDITION_SEQUENCE: SketchCondition[] = [
  "A",
  "B",
  "B",
  "A",
  "A",
  "B",
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
