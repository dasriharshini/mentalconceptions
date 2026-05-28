export type SketchPrompt = {
  id: string;
  scenario: string;
};

export const SKETCH_PROMPTS: SketchPrompt[] = [
  {
    id: "website-visitors",
    scenario:
      'This dataset shows the unique visitor counts for websites in the “Computer” and “Social Network” categories. In the Computer group, Apple had 60 visitors, Dell had 20, and HP had 15. In the Social Network group, Facebook had 140 visitors, Twitter had 50, and LinkedIn had 35. ',
  },
  {
    id: "smartphone-market-share",
    scenario:
      "This dataset shows the market share of major smartphone brands in 2021. Apple, Xiaomi, and Google each held 15% of the total market share, Oppo and Vivo each held 10%, and the remaining 35% was held by other brands. ",
  },
  {
    id: "state-unemployment",
    scenario:
      "This dataset shows unemployment rates for each U.S. state in 2020, falling between 4% to 12%. For example, Nevada had an unemployment rate of 12%, Hawaii had 11%, California had 10%, Florida had 8%, Wisconsin had 6%, and Nebraska had 4%. ",
  },
  {
    id: "internet-speeds",
    scenario:
      "This dataset shows average internet speeds in 2021 for six countries: 78 Mbps in China, 14 Mbps in India, 24 Mbps in Malaysia, 99 Mbps in South Korea, 68 Mbps in Singapore, and 35 Mbps in Vietnam. ",
  },
  {
    id: "coffee-prices",
    scenario:
      "This dataset shows Robusta coffee prices each month in 2018, measured in dollars per pound. The price was around $0.89 from January to May, $0.85 in July, $0.77 in September, $0.85 in October, $0.84 in November, and $0.78 in December. ",
  },
  {
    id: "metro-systems",
    scenario:
      "This dataset shows the number of stations, total track length, and annual ridership for metro systems in three cities. Tokyo has 330 stations, 250 km of track, and 3.5 billion ridership. Paris has 300 stations, 310 km of track, with 2.1 billion riders. ", 
  },
  {
    id: "baby-names",
    scenario:
      "This dataset shows the number of babies named Amelia and Isla in the UK from 2011 to 2014. There were 5,500 babies named Amelia in 2011, 6,600 in 2012, and 6,200 in 2013. There were 3,000 babies named Isla in 2011, 3,100 in 2012, and 3,100 in 2013. ",
  },
  {
    id: "trip-distance-bins",
    scenario:
      "This dataset shows the number of customers in trips of 10-kilometer intervals from 0 to 60 KM. There were 70 customers for trips between 0-10 KM, 175 for trips between 10-20KM, 215 between 20-30KM, 245 between 30–40 KM, 180 in between 40–50 KM, and 105 between 50–60 KM.", 
  },
  {
    id: "height-weight",
    scenario:
      "This dataset shows height and weight measurements for three individuals. The height and weight for each of them are: 167 cm and 50 kg; 168 cm and 58 kg; 174 cm and 63 kg. ", 
  },
  {
    id: "olympic-medals",
    scenario:
      "This dataset shows the proportions of medals earned by two countries at the 2020 Olympics. The United States earned 35% gold, 36% silver, and 29% bronze. Australia received 37% gold, 16% silver, and 47% bronze. ", 
  },
  {
    id: "oil-prices",
    scenario:
      "This dataset shows oil prices from July to December in 2020. The price was $58 in July, $51 in August, $29 in September, $17 in October, $28 in November, and $38 in December. ", 
  },
  {
    id: "room-service-prices",
    scenario:
      "This dataset shows room service prices for three items – sandwich, bottled water, and peanuts – in Helsinki and Copenhagen. In Helsinki, a sandwich costs $38, water costs $6, and peanuts cost $12. In Copenhagen, a sandwich costs $24, water costs $3, and peanuts cost $10. ", 
  },
];
