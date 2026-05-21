export type SketchPrompt = {
  id: string;
  scenario: string;
};

export const SKETCH_PROMPTS: SketchPrompt[] = [
  {
    id: "website-visitors",
    scenario:
      'This dataset shows website unique visitor counts in the "Computer" and "Social Network" categories. In the Computer group, Apple had 60 visitors, Dell had 20, and HP had 15. In the Social Networks group, Facebook had the most with unique 140 visitors. Twitter had 50, Orkut 45, and LinkedIn had 35 unique visitors.',
  },
  {
    id: "smartphone-market-share",
    scenario:
      "This dataset shows the global smartphone market share in 2021 for three major brands (Samsung, Apple, and Vivo). Samsung held the largest portion at about 43%, followed by Apple with 37%. Vivo made up the remaining 20% of the total among this group. These values represent each brand's share of the combined total.",
  },
  {
    id: "state-unemployment",
    scenario:
      "This dataset shows unemployment rates for each U.S. state in 2020. Nevada had the highest rate of 12%, followed by Hawaii at 11% and California at 10%. In contrast, states such as Nebraska at 4.2%, Utah at 4.3%, and South Dakota at 4.6% reported much lower unemployment throughout the year.",
  },
  {
    id: "internet-speeds",
    scenario:
      "This dataset shows average internet speeds the year of 2021 for three major Asian countries: China, India, and Japan. Among them, China had the highest average internet speed at 78 Mbps, followed by Japan at 40 Mbps. India had the lowest speed in this group, with an average of 14 Mbps.",
  },
  {
    id: "coffee-prices",
    scenario:
      "This dataset shows coffee prices for the brand Robusta each month in 2019, measured in dollars per pound. Prices were highest in January at about $0.85 and then declined steadily. Small increases appeared in April and August, but the overall trend across the year was a clear drop in price.",
  },
  {
    id: "metro-systems",
    scenario:
      "This dataset shows the stations, total track length, and annual ridership for metro systems in three cities. Tokyo has 330 stations, 250 km of track, and the highest ridership at 3.5 billion. Paris operates 300 stations, 310 km, with 2.1 billion riders. N.Y.C., though larger with 470 stations and 460 km of track, has lower ridership (1.0 billion).",
  },
  {
    id: "baby-names",
    scenario:
      "This dataset shows the number of babies named Amelia, Isla, and Olivia in the UK from 2008 to 2011. Amelia increased from 3,600 to 5,200. Isla grew from 2,000 to 3,400, while Olivia, starting highest at 5,200, rose more gradually to 6,000. Olivia stayed the most popular, but Amelia's rapid growth closed the gap.",
  },
  {
    id: "trip-distance-bins",
    scenario:
      "This dataset shows customer counts in 10-kilometer trip intervals from 0 to 60 KM. It shows an upward trend in customers from 70 in the 0-10 KM bin to a peak of 245 in the 30-40 KM bin. After this peak, it declines to 180 in the 40-50 KM bin and further to 105 in the 50-60 KM bin.",
  },
  {
    id: "height-weight",
    scenario:
      "This dataset shows height and weight measurements for six individuals, ranging from 165 cm and 65 kg to 180 cm and 87 kg. It illustrates a clear relationship: as height increases, weight also tends to increase. The shortest person in the group (165 cm) weighs 65 kg, while the tallest (178 cm) weighs 87 kg.",
  },
  {
    id: "olympic-medals",
    scenario:
      "This dataset shows the Olympic medal percentages for three countries at the 2020 Olympics (United States, Great Britain, and Australia). The United States earned 35% gold, 36% silver, and 29% bronze. Great Britain had a more even mix with 34% gold, 32% silver, and 34% bronze. Australia received 47% bronze, 37% gold, and 16% silver.",
  },
  {
    id: "oil-prices",
    scenario:
      "This dataset shows oil prices from January to April 2020. Over these four months, prices dropped sharply. The price was $58 in January, then fell to $51 in February, $29 in March, and finally $17 in April. Overall, this represents a major decline in oil prices during a short period.",
  },
  {
    id: "room-service-prices",
    scenario:
      "This dataset shows room service prices for three items: sandwich, bottled water, and peanuts in Helsinki, Seoul, and Copenhagen. Helsinki is the most expensive, with prices of $39, $14, and $6. Seoul is next at $28, $13, and $7. Copenhagen is the cheapest, with prices of $26, $11, and $4. This dataset shows apparent cost differences between the cities.",
  },
];
