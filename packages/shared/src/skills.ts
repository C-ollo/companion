import type { Skill } from "./types";

/**
 * Starter library of general independent-living skills, written by the team.
 * Not taken from First Place, PEERS, or any licensed curriculum.
 */
export const SKILLS: Skill[] = [
  // Cooking
  {
    id: "stovetop_cooking",
    name: "Stovetop cooking",
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
    name: "Heat food in the microwave",
    category: "cooking",
    description: "Heat a meal in the microwave for the right amount of time.",
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
    name: "Write a grocery list",
    category: "cooking",
    description: "Check what food you need and write it down before shopping.",
    nextSkillIds: ["grocery_shopping"],
  },
  {
    id: "grocery_shopping",
    name: "Go grocery shopping",
    category: "cooking",
    description: "Buy the food on your list at a store.",
    nextSkillIds: [],
  },
  // Laundry
  {
    id: "laundry",
    name: "Laundry",
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
    name: "Take the light rail to work",
    category: "getting_around",
    description: "Ride the light rail to work and back.",
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
 * Appliances Point & Ask must never give step-by-step guidance for.
 * The AI is told this too, but the API enforces it in code as well.
 */
export const BLOCKED_APPLIANCES = [
  "stove",
  "cooktop",
  "oven",
  "space_heater",
  "fireplace",
  "electrical_panel",
  "medication",
] as const;

/** Appliances we've tested Point & Ask against. Anything else takes the "not sure" path. */
export const SUPPORTED_APPLIANCES = ["washing_machine"] as const;
