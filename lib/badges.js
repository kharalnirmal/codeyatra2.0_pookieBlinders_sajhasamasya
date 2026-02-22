// Badge definitions — id must stay stable (stored in DB as strings)
export const BADGE_DEFS = [
  {
    id: "first_step",
    label: "First Step",
    emoji: "🌱",
    description: "Raised your first issue",
    check: (u) => u.issuesRaised >= 1,
  },
  {
    id: "reporter",
    label: "Reporter",
    emoji: "📢",
    description: "Raised 5 issues",
    check: (u) => u.issuesRaised >= 5,
  },
  {
    id: "community_hero",
    label: "Community Hero",
    emoji: "🏆",
    description: "Raised 10 issues",
    check: (u) => u.issuesRaised >= 10,
  },
  {
    id: "active",
    label: "Active Citizen",
    emoji: "🔥",
    description: "Raised 25 issues",
    check: (u) => u.issuesRaised >= 25,
  },
  {
    id: "problem_solver",
    label: "Problem Solver",
    emoji: "✅",
    description: "Had an issue resolved",
    check: (u) => u.issuesSolved >= 1,
  },
  {
    id: "fixer",
    label: "Fixer",
    emoji: "🔧",
    description: "Had 5 issues resolved",
    check: (u) => u.issuesSolved >= 5,
  },
  {
    id: "volunteer",
    label: "Volunteer",
    emoji: "🤝",
    description: "Volunteered for 3 issues",
    check: (u) => u.volunteerCount >= 3,
  },
  {
    id: "century",
    label: "Century",
    emoji: "💯",
    description: "Earned 100 points",
    check: (u) => u.points >= 100,
  },
  {
    id: "legend",
    label: "Legend",
    emoji: "⭐",
    description: "Earned 500 points",
    check: (u) => u.points >= 500,
  },
];

export const AUTHORITY_BADGE_DEFS = [
  {
    id: "first_resolver",
    label: "First Resolver",
    emoji: "🎯",
    description: "Resolved your first issue",
    check: (u) => u.totalResolved >= 1,
  },
  {
    id: "problem_crusher",
    label: "Problem Crusher",
    emoji: "💪",
    description: "Resolved 5 issues",
    check: (u) => u.totalResolved >= 5,
  },
  {
    id: "area_guardian",
    label: "Area Guardian",
    emoji: "🛡️",
    description: "Resolved 10 issues in your area",
    check: (u) => u.totalResolved >= 10,
  },
  {
    id: "department_star",
    label: "Department Star",
    emoji: "⭐",
    description: "Resolved 25 issues",
    check: (u) => u.totalResolved >= 25,
  },
  {
    id: "quick_responder",
    label: "Quick Responder",
    emoji: "⚡",
    description: "Maintained a rating of 4.5 or higher",
    check: (u) => u.rating >= 4.5,
  },
  {
    id: "legendary_authority",
    label: "Legendary Authority",
    emoji: "👑",
    description: "Resolved 50 issues and earned 500 points",
    check: (u) => u.totalResolved >= 50 && u.points >= 500,
  },
];

export function getBadgeDefsForRole(role) {
  return role === "authority" ? AUTHORITY_BADGE_DEFS : BADGE_DEFS;
}

/**
 * Returns array of badge IDs the user has earned but not yet stored.
 * Call this after updating stats; save the returned IDs to user.badges.
 */
export function computeNewBadges(user) {
  const defs = getBadgeDefsForRole(user.role);
  const existing = new Set(user.badges || []);
  return defs.filter((b) => !existing.has(b.id) && b.check(user)).map(
    (b) => b.id,
  );
}
