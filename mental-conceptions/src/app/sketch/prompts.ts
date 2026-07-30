export type SketchCondition = "A" | "B";

export type SketchPrompt = {
  id: string;
  taskIndex: number;
  condition: SketchCondition;
  scenario: string;
  semanticCluster: PromptCluster;
};

type PromptCluster = "comparison" | "trend" | "measurement";

type PromptBase = {
  id: string;
  scenario: string;
  semanticCluster: PromptCluster;
};

const DATASET_A: PromptBase[] = [
  {
    id: "ranking",
    semanticCluster: "comparison",
    scenario:
      "This dataset shows the rankings of three restaurants. Restaurant A has a ranking of 2, Restaurant B has a ranking of 3, and Restaurant C has a ranking of 1. ",
  },
  {
    id: "state",
    semanticCluster: "comparison",
    scenario:
      "This dataset shows annual retail performance by US state. California accounted for 125 thousand units, Texas accounted for 90 thousand units, and Florida accounted for 70 thousand units. ",
  },
  {
    id: "fruit",
    semanticCluster: "comparison",
    scenario:
      "This dataset shows the results of a small local poll tallying the votes received for favorite fruits across two different voting areas. At the Community Center, Bananas had 10 votes, Strawberries had 12 votes, and Blueberries had 5 votes. At the Public Library, Bananas had 15 votes, Strawberries had 10 votes, and Blueberries had 15 votes. ",
  },
  {
    id: "stock",
    semanticCluster: "trend",
    scenario:
      "This dataset shows the stock price of a company over a five-year period. The stock price was $350 in 2020, $420 in 2021, $390 in 2022, $510 in 2023, and $600 in 2024. ",
  },
  {
    id: "depth",
    semanticCluster: "measurement",
    scenario:
      "This dataset shows the depth reached by each exploration team while surveying an underwater canyon. Team A reached a depth of 2,400 meters. Team B reached 1,000 meters, and Team C reached 1,500 meters. ",
  },
  {
    id: "area",
    semanticCluster: "measurement",
    scenario:
      "This dataset shows the total surface area of three lakes. Lake A recorded 45 square miles, Lake B recorded 32 square miles, and Lake C recorded 60 square miles. ",
  },
];

const DATASET_B: PromptBase[] = [
  {
    id: "rating",
    semanticCluster: "comparison",
    scenario:
      "This dataset shows the ratings of three restaurants. Restaurant A has a rating of 2, Restaurant B has a rating of 3, and Restaurant C has a rating of 1. ",
  },
  {
    id: "product",
    semanticCluster: "comparison",
    scenario:
      "This dataset shows annual retail performance by product department. Electronics accounted for 125 thousand units, Furniture accounted for 90 thousand units, and Clothing accounted for 70 thousand units. ",
  },
  {
    id: "person",
    semanticCluster: "comparison",
    scenario:
      "This dataset shows the results of a small local poll tallying the votes received for a leadership position across two different voting areas. At the Community Center, Blair had 10 votes, Stella had 12 votes, and Ben had 5 votes. At the Public Library, Blair had 15 votes, Stella had 10 votes, and Ben had 15 votes. ",
  },
  {
    id: "running",
    semanticCluster: "trend",
    scenario:
      "This dataset shows a recreational runner's annual mileage over a five-year period. The distance run was 350 miles in 2020, 420 miles in 2021, 390 miles in 2022, 510 miles in 2023, and 600 miles in 2024. ",
  },
  {
    id: "elevation",
    semanticCluster: "measurement",
    scenario:
      "This dataset shows the elevation reached by each exploration team while surveying a mountain range. Team A reached an elevation of 2,400 meters. Team B reached 1,000 meters, and Team C reached 1,500 meters. ",
  },
  {
    id: "length",
    semanticCluster: "measurement",
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

export const shuffleArray = <T,>(items: T[]): T[] => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = nextItems[index];
    nextItems[index] = nextItems[swapIndex];
    nextItems[swapIndex] = current;
  }

  return nextItems;
};

const createConstrainedPromptOrder = (prompts: SketchPrompt[]): SketchPrompt[] => {
  const remaining = [...prompts];
  const ordered: SketchPrompt[] = [];

  const backtrack = (previousCluster: PromptCluster | null): boolean => {
    if (remaining.length === 0) {
      return true;
    }

    const candidates = shuffleArray(
      remaining.filter((prompt) => prompt.semanticCluster !== previousCluster)
    );

    for (const candidate of candidates) {
      const candidateIndex = remaining.findIndex(
        (prompt) => prompt.id === candidate.id && prompt.taskIndex === candidate.taskIndex
      );

      if (candidateIndex < 0) {
        continue;
      }

      const [nextPrompt] = remaining.splice(candidateIndex, 1);
      ordered.push(nextPrompt);

      if (backtrack(nextPrompt.semanticCluster)) {
        return true;
      }

      ordered.pop();
      remaining.splice(candidateIndex, 0, nextPrompt);
    }

    return false;
  };

  if (backtrack(null)) {
    return ordered;
  }

  return shuffleArray(prompts);
};

export const createRandomizedPromptOrder = (
  participantNumber: number
): string[] =>
  createConstrainedPromptOrder(getSketchPromptsForParticipant(participantNumber)).map(
    (prompt) => prompt.id
  );

export const getSketchPromptsForParticipant = (
  participantNumber: number
): SketchPrompt[] =>
  getSketchPrompts(getConditionSequenceForParticipant(participantNumber));
