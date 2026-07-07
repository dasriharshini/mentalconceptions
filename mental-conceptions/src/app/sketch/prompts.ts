export type SketchPrompt = {
  id: string;
  scenario: string;
};

export const SKETCH_PROMPTS: SketchPrompt[] = [
  {
    id: "rating",
    scenario:
      'This dataset shows the ratings of three restaurants. Restaurant A has a rating of 4, Restaurant B has a rating of 5, and Restaurant C has a rating of 2. ',
  }, 
  {
    id: "state",
    scenario:
      'This dataset shows annual retail performance by US state. California accounted for 125 thousand units, Texas accounted for 90 thousand units, and Florida accounted for 70 thousand units. ',
  }, 
  {
    id: "fruit",
    scenario:
      'This dataset shows the results of a small local poll tallying the votes received for favorite fruits. Banana had 10 votes, strawberries had 15 votes, and blueberries had 12 votes. ',
  }, 
  {
    id: "running", 
    scenario:
    'This dataset shows a recreational runner’s annual mileage over a five-year period. The distance run was 350 miles in 2020, 420 miles in 2021, 390 miles in 2022, 510 miles in 2023, and 600 miles in 2024. '
  }, 
  {
    id: "depth", 
    scenario:
    'This dataset shows the depth reached by each exploration team while surveying an underwater canyon. Team A reached a depth of 2,400 meters. Team B reached 1,000 meters, and Team C reached 1,500 meters. '
  }, 
  {
    id: "area", 
    scenario:
    'This dataset shows the total surface area of three lakes. Lake A recorded 60 square miles, Lake B recorded 45 square miles, and Lake C recorded 32 square miles. '
  }
];
