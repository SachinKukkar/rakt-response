/**
 * Red-cell compatibility by ABO and Rh group, as a general guide for the public
 * (it is not a transfusion decision: blood banks always test and cross-match).
 * The Bombay phenotype ("Oh") lacks the H antigen and can receive only Oh blood.
 */
export const MATCH_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Oh"] as const;
export type MatchGroup = (typeof MATCH_GROUPS)[number];

const ABO_RH = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type AboRh = (typeof ABO_RH)[number];

function antigens(group: AboRh) {
  const abo = group.replace(/[+-]$/, "");
  return { a: abo.includes("A"), b: abo.includes("B"), rh: group.endsWith("+") };
}

/** Can red cells from `donor` be given to `recipient`? (ABO/Rh only.) */
function canGive(donor: AboRh, recipient: AboRh): boolean {
  const d = antigens(donor);
  const r = antigens(recipient);
  return (!d.a || r.a) && (!d.b || r.b) && (!d.rh || r.rh);
}

export interface Match {
  group: MatchGroup;
  /** Groups this person's red cells can usually go to. */
  givesTo: MatchGroup[];
  /** Groups this person can usually receive red cells from. */
  receivesFrom: MatchGroup[];
}

export function bloodMatch(group: MatchGroup): Match {
  if (group === "Oh") {
    // Oh cells carry no A, B or H antigen; by convention they are kept for other Oh patients.
    return { group, givesTo: ["Oh"], receivesFrom: ["Oh"] };
  }
  return {
    group,
    givesTo: ABO_RH.filter((r) => canGive(group, r)),
    receivesFrom: ABO_RH.filter((d) => canGive(d, group)),
  };
}
