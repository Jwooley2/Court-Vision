/**
 * Editorial profiles: personal, positive, fact-based; not generic AI-generated
 * praise. Every published player should have a reviewed original biography.
 * No automatic fallback that invents facts for an unfamiliar player.
 */
export const playerBios: Record<string, { narrative: string; reviewed: boolean; sourceNotes: string }> = {
  michael_jordan: {
    narrative: "Cut from his high school varsity team, Michael Jordan took rejection personally—and made the basketball world pay for it. Fueled by an insatiable hunger to win and a ruthless competitive spirit, **“Air Jordan”** became the most feared man on the hardwood. Six championships, six Finals MVPs, and countless shattered dreams later, **“His Airness”** had become more than a legend—he was the standard by which greatness itself would be judged.",
    reviewed: true,
    sourceNotes: "Founder-provided original copy. The varsity setback was as a sophomore; Jordan played on the junior varsity team. Championship and Finals MVP totals cross-checked with NBA.com.",
  },
  lebron_james: {
    narrative: "From the streets of Akron to the brightest spotlight basketball could offer, **“The Chosen One”** carried impossible expectations before he ever played an NBA minute. Instead of buckling, **“King James”** built a reign on power, vision, and a refusal to stop evolving—turning four championships, four MVPs, and unmatched longevity into a career few could have imagined. The kid from Ohio did more than live up to the hype. He made the hype look small.",
    reviewed: true,
    sourceNotes: "Original editorial copy. Akron background, prep-era Chosen One nickname, four NBA titles and four MVPs verified against NBA.com. Longevity is qualitative, not a comparison score.",
  },
};

export function getPlayerBio(externalId: string | null | undefined) {
  return externalId ? playerBios[externalId] ?? null : null;
}

export function renderBioSegments(narrative: string) {
  return narrative.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) =>
    part.startsWith("**") && part.endsWith("**")
      ? { text: part.slice(2, -2), emphasized: true }
      : { text: part, emphasized: false }
  );
}
