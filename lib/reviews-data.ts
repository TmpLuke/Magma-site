export interface Review {
  id: string;
  productId?: string;
  username: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

export const allReviews: Review[] = [
  {
    id: "rev_1",
    productId: "prod_1",
    username: "Mabz",
    avatar: "M",
    rating: 5,
    text: "Magma Cheats is the best! Been using they're BO7 cheat almost prestige 2 now and no bans. They have the best cheat and best support team who are very responsive and helpful. Long live Magma!",
    date: "Dec 2025",
    verified: true,
  },
  {
    id: "rev_2",
    productId: "prod_2",
    username: "Jibegz",
    avatar: "J",
    rating: 5,
    text: "Mufasa is very quick when responding and very helpful and this the best bo7 cheat by far too. Mufasa is the goat!",
    date: "Dec 2025",
    verified: true,
  },
  {
    id: "rev_3",
    productId: "prod_1",
    username: "Markky15_",
    avatar: "M",
    rating: 5,
    text: "I purchased the Inferno 1-Day key and the cheat itself worked perfectly for me. The setup was smooth and everything performed as expected. I also want to give a shout-out to Mufasa for being really helpful in support...",
    date: "Nov 2025",
    verified: true,
  },
  {
    id: "rev_4",
    productId: "prod_2",
    username: "Milanek",
    avatar: "M",
    rating: 5,
    text: "Moh replied to my ticket very quickly, he quickly explained what and how and thanks to him I can cheat :)",
    date: "Nov 2025",
    verified: true,
  },
  {
    id: "rev_5",
    productId: "prod_1",
    username: "Philthiest",
    avatar: "P",
    rating: 5,
    text: "I am using Frost BF6. Was purchased on Nov112025. Excellent customer support on MOH's end! Quick response, fast fix for my questions. (Even though majority of it was user issue)...",
    date: "Nov 2025",
    verified: true,
  },
  {
    id: "rev_6",
    productId: "prod_2",
    username: "Mamirose",
    avatar: "M",
    rating: 5,
    text: "First time using this cheese purchased Armani. Shout out to the team for coming in clutch a$$ time and responding so fast. And shout out again to MOH for helping me with all my questions.",
    date: "Nov 2025",
    verified: true,
  },
  {
    id: "rev_7",
    productId: "prod_1",
    username: "GamerX",
    avatar: "G",
    rating: 5,
    text: "Absolutely love the Armani cheat for Apex. The aimbot is smooth and the ESP is crystal clear. Been using it for 2 weeks now with zero issues.",
    date: "Oct 2025",
    verified: true,
  },
  {
    id: "rev_8",
    productId: "prod_2",
    username: "ProPlayer99",
    avatar: "P",
    rating: 4,
    text: "Great product overall. The COD cheat works flawlessly. Only minor issue was initial setup but support helped me through it quickly.",
    date: "Oct 2025",
    verified: true,
  },
  {
    id: "rev_9",
    productId: "prod_3",
    username: "ValorantKing",
    avatar: "V",
    rating: 5,
    text: "Phantom is amazing for Valorant. The triggerbot feels very natural and the radar is super helpful. Highly recommend!",
    date: "Oct 2025",
    verified: true,
  },
  {
    id: "rev_10",
    username: "NewUser2025",
    avatar: "N",
    rating: 5,
    text: "Best cheat provider I've ever used. Fast delivery, working products, and amazing support. What more could you ask for?",
    date: "Sep 2025",
    verified: true,
  },
  {
    id: "rev_11",
    productId: "prod_1",
    username: "ApexPredator",
    avatar: "A",
    rating: 5,
    text: "The Armani cheat is undetected and works perfectly. Customer support is top tier. Will definitely renew my subscription.",
    date: "Sep 2025",
    verified: true,
  },
  {
    id: "rev_12",
    productId: "prod_2",
    username: "CODWarrior",
    avatar: "C",
    rating: 5,
    text: "Inferno is hands down the best COD cheat on the market. Smooth aimbot, reliable ESP, and never had any detection issues.",
    date: "Sep 2025",
    verified: true,
  },
];

export function getReviewsByProductId(productId: string): Review[] {
  return allReviews.filter((r) => r.productId === productId);
}

export function getAverageRating(): number {
  const total = allReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((total / allReviews.length) * 10) / 10;
}

export function getTotalReviews(): number {
  return allReviews.length;
}
