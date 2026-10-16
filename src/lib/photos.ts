/**
 * Photographs used on public pages (public/images/photos), from Unsplash
 * (Unsplash License) and Pexels (Pexels License). Both are free to use and need
 * no credit, so the site doesn't show one; `credit` is kept here for our records.
 * Replace any of them with the team's own photos by keeping the file name.
 */
export interface Photo {
  src: string;
  width: number;
  height: number;
  /** English alt text; translated where it is rendered. */
  alt: string;
  credit: string;
}

export const PHOTOS = {
  hero: {
    src: "/images/photos/hero-donor-arm.jpg",
    width: 3840,
    height: 2559,
    alt: "A donor giving blood: the needle line taped to the arm, a red thread on the wrist and a soft ball in the hand",
    credit: "Rahul Sapra / Pexels",
  },
  clinic: {
    src: "/images/photos/donor-prep.jpg",
    width: 2880,
    height: 1645,
    alt: "A health worker in gloves preparing a donor's arm for a blood donation",
    credit: "Nguyễn Hiệp / Unsplash",
  },
  bloodBag: {
    src: "/images/photos/blood-bag.jpg",
    width: 2000,
    height: 1333,
    alt: "A bag of donated blood hanging from a stand",
    credit: "Aman Chaturvedi / Unsplash",
  },
  redCells: {
    src: "/images/photos/red-cells.jpg",
    width: 2400,
    height: 1371,
    alt: "Red blood cells, magnified",
    credit: "Anirudh / Unsplash",
  },
  donorChair: {
    src: "/images/photos/donor-chair.jpg",
    width: 2000,
    height: 1333,
    alt: "A donor's arm during a donation, the hand squeezing a soft ball",
    credit: "LuAnn Hunt / Unsplash",
  },
  holdingHand: {
    src: "/images/photos/holding-hand.jpg",
    width: 2000,
    height: 1116,
    alt: "A gloved hand resting reassuringly on a patient's arm",
    credit: "Nguyễn Hiệp / Unsplash",
  },
  handsHeart: {
    src: "/images/photos/hands-heart.jpg",
    width: 2000,
    height: 1333,
    alt: "Many hands painted red, held together to form a heart",
    credit: "Tim Marshall / Unsplash",
  },
} as const satisfies Record<string, Photo>;

