import type { Skill } from "./types";

/**
 * Starter library of general independent-living skills, written by the team.
 * Not taken from First Place, PEERS, or any licensed curriculum.
 */
export const SKILLS: Skill[] = [
  // Cooking
  {
    id: "stovetop_cooking",
    name: "Stovetop Pasta",
    category: "cooking",
    description: "Cook a simple meal on the stove, like pasta or eggs.",
    nextSkillIds: ["simple_sauce", "cook_for_a_friend"],
  },
  {
    id: "simple_sauce",
    name: "Make a simple tomato sauce",
    category: "cooking",
    description: "Make a tomato sauce in a pan to go with pasta.",
    nextSkillIds: ["cook_for_a_friend"],
  },
  {
    id: "microwave_meal",
    name: "Warm Food Safely",
    category: "cooking",
    description: "Warm food safely without the stove, like in the microwave.",
    nextSkillIds: ["stovetop_cooking"],
  },
  {
    id: "cook_for_a_friend",
    name: "Cook for a friend",
    category: "cooking",
    description: "Plan and cook a meal to share with someone.",
    nextSkillIds: [],
  },
  {
    id: "grocery_list",
    name: "Grocery List",
    category: "cooking",
    description: "Check what food you need and write it down before shopping.",
    nextSkillIds: ["grocery_shopping"],
  },
  {
    id: "grocery_shopping",
    name: "Grocery Store & Touchscreen Kiosk",
    category: "cooking",
    description: "Buy the food on your list at a store, including the self-checkout.",
    nextSkillIds: [],
  },
  {
    id: "cafe_self_order",
    name: "Café Self-Order",
    category: "cooking",
    description: "Order food or a drink on a café touchscreen kiosk and pay.",
    nextSkillIds: ["grocery_shopping"],
  },
  // Laundry
  {
    id: "laundry",
    name: "Washing Machine Laundry",
    category: "laundry",
    description: "Wash a load of clothes in a washing machine.",
    nextSkillIds: ["dryer", "fold_clothes"],
  },
  {
    id: "dryer",
    name: "Use the dryer",
    category: "laundry",
    description: "Dry a load of clothes in a dryer.",
    nextSkillIds: ["fold_clothes"],
  },
  {
    id: "fold_clothes",
    name: "Fold and put away clothes",
    category: "laundry",
    description: "Fold clean clothes and put them where they belong.",
    nextSkillIds: [],
  },
  // Cleaning
  {
    id: "dishes",
    name: "Wash the dishes",
    category: "cleaning",
    description: "Wash dishes by hand or load and run the dishwasher.",
    nextSkillIds: ["clean_kitchen"],
  },
  {
    id: "clean_kitchen",
    name: "Clean the kitchen",
    category: "cleaning",
    description: "Wipe counters, clean the sink, and take out the trash.",
    nextSkillIds: [],
  },
  // Getting around
  {
    id: "light_rail_to_work",
    name: "Light Rail Public Transit",
    category: "getting_around",
    description: "Ride the light rail to where you need to go and back.",
    nextSkillIds: ["new_bus_route"],
  },
  {
    id: "new_bus_route",
    name: "Try a new bus route",
    category: "getting_around",
    description: "Plan and ride a bus route you have not used before.",
    nextSkillIds: [],
  },
  // Money
  {
    id: "pay_rent_online",
    name: "Pay rent online",
    category: "money",
    description: "Pay your rent on time using a website or app.",
    nextSkillIds: ["weekly_budget"],
  },
  {
    id: "weekly_budget",
    name: "Make a weekly budget",
    category: "money",
    description: "Plan how much money you can spend this week.",
    nextSkillIds: [],
  },
  // Health
  {
    id: "refill_medication",
    name: "Ask for a medication refill",
    category: "health",
    description: "Notice when medicine is running low and ask for a refill.",
    nextSkillIds: ["prepare_doctor_visit"],
  },
  {
    id: "prepare_doctor_visit",
    name: "Prepare for a doctor visit",
    category: "health",
    description: "Write down what you want to tell or ask the doctor.",
    nextSkillIds: [],
  },
  // Friends
  {
    id: "invite_friend_over",
    name: "Invite a friend over",
    category: "friends",
    description: "Ask a friend to visit and agree on a day and time.",
    nextSkillIds: ["cook_for_a_friend"],
  },
  // Work
  {
    id: "get_ready_for_work",
    name: "Get ready for work on time",
    category: "work",
    description: "Get dressed, pack what you need, and leave on time.",
    nextSkillIds: ["light_rail_to_work"],
  },
];

const SKILLS_BY_ID = new Map(SKILLS.map((skill) => [skill.id, skill]));

export function getSkill(id: string): Skill | undefined {
  return SKILLS_BY_ID.get(id);
}

/**
 * Things Point & Ask must never give step-by-step guidance for: stoves, ovens,
 * heaters, electrical work, and medication. The AI is told this too, but the API
 * also enforces it in code. Microwaves are allowed (warming food safely).
 */
const BLOCKED_PATTERN = /stove|oven|cooktop|burner|range_top|heater|fireplace|electrical|medic|pill|drug/;

export const BLOCKED_ITEM_EXAMPLES = ["stoves", "ovens", "burners", "heaters", "fireplaces", "electrical panels", "medication"];

export function isSafetyBlocked(item: string): boolean {
  const name = item.toLowerCase();
  if (name.includes("microwave")) return false;
  return BLOCKED_PATTERN.test(name);
}
