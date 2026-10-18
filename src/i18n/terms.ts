/**
 * The site calls its volunteers "Rakt Mitra" (plural "Rakt Mitras"). Code, addresses (/volunteer)
 * and the database keep the word "volunteer", so messages written by database functions still say
 * it; `translate()` passes every string through `siteTerms()` before showing or translating it.
 * Paths and identifiers such as /volunteer/requests or volunteer_id are left alone.
 */
const RULES: Array<[RegExp, string]> = [
  // Phrases that need more than a word swap.
  [/\bthis is a Rakt Response volunteer\b/g, "this is a Rakt Mitra from Rakt Response"],
  [/\bRakt Response volunteers\b/g, "Rakt Mitras"],
  [/\bRakt Response volunteer\b/g, "Rakt Mitra"],
  [/\ba volunteer community team\b/g, "a community team of Rakt Mitras"],
  [/\ba community, volunteer-run platform\b/g, "a community platform run by Rakt Mitras"],
  [/\ba free, volunteer-run platform\b/g, "a free platform run by Rakt Mitras"],
  [/\ba volunteer coordination platform\b/g, "a coordination platform run by Rakt Mitras"],
  [/\bfor volunteer coordination\b/g, "for Rakt Mitras to coordinate"],
  [/\bVolunteered\?/g, "Served as a Rakt Mitra?"],
  [/\bVolunteer-run\b/g, "Run by Rakt Mitras"],
  [/\bvolunteer-run\b/g, "run by Rakt Mitras"],
  [/\bVolunteer-verified\b/g, "Verified by a Rakt Mitra"],
  [/\bvolunteer-verified\b/g, "verified by a Rakt Mitra"],
  // The word itself. No lookbehind: iOS 15 and older can't parse it.
  [/(^|[^/_.\w-])Volunteers(?![/_\w-])/g, "$1Rakt Mitras"],
  [/(^|[^/_.\w-])volunteers(?![/_\w-])/g, "$1Rakt Mitras"],
  [/(^|[^/_.\w-])Volunteer(?![/_\w-])/g, "$1Rakt Mitra"],
  [/(^|[^/_.\w-])volunteer(?![/_\w-])/g, "$1Rakt Mitra"],
];

export function siteTerms(text: string): string {
  if (!/olunteer/.test(text)) return text;
  let out = text;
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
  return out;
}

/** Hindi: स्वयंसेवक(ों) and वॉलंटियर(ों) become रक्त मित्र(ों). */
export function siteTermsHindi(text: string): string {
  return text.replace(/स्वयंसेवक/g, "रक्त मित्र").replace(/वॉलंटियर/g, "रक्त मित्र");
}
