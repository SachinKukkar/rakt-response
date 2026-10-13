export const PUBLIC_NAV = [
  { href: "/blood-requests", label: "Find Blood" },
  { href: "/learn", label: "Learn" },
  { href: "/eligibility", label: "Can I donate?" },
  { href: "/impact", label: "Our Impact" },
  { href: "/stories", label: "Stories" },
  { href: "/about", label: "About" },
] as const;

export const MORE_LINKS = [
  { href: "/why-donate", label: "Why donate" },
  { href: "/donation-types", label: "Whole blood vs SDP" },
  { href: "/donation-process", label: "Donation process" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
] as const;

/** Footer link groups (labels are English keys, translated where rendered). */
export const FOOTER_GROUPS = [
  {
    title: "Get involved",
    links: [
      { href: "/register", label: "Become a Donor" },
      { href: "/blood-requests/new", label: "Request blood" },
      { href: "/blood-requests", label: "Find Blood" },
      { href: "/share-your-story", label: "Share your story" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learn", label: "Blood donation basics" },
      { href: "/eligibility", label: "Can I donate?" },
      { href: "/why-donate", label: "Why donate" },
      { href: "/donation-types", label: "Whole blood vs SDP" },
      { href: "/donation-process", label: "Donation process" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "About us",
    links: [
      { href: "/about", label: "About" },
      { href: "/impact", label: "Our Impact" },
      { href: "/stories", label: "Stories" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
] as const;
