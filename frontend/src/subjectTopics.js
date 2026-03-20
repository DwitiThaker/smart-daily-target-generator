/**
 * Centralized subject → topics mapping.
 *
 * To extend or sync with a backend later:
 *   - Replace this object with an async fetch (e.g. GET /api/topics)
 *   - The shape must remain { [subject: string]: string[] }
 */
export const SUBJECT_TOPICS = {
  Polity: [
    'Fundamental Rights',
    'Directive Principles',
    'Fundamental Duties',
    'Parliament',
    'Judiciary',
    'President & Vice-President',
    'Governor & State Legislature',
    'Election Commission',
    'Constitutional Amendments',
    'Emergency Provisions',
  ],
  Economy: [
    'Inflation',
    'GDP & National Income',
    'Fiscal Policy',
    'Monetary Policy',
    'Banking & RBI',
    'Capital Markets',
    'International Trade',
    'Balance of Payments',
    'Budget & Taxation',
    'Economic Reforms',
  ],
  History: [
    'Freedom Struggle',
    'Mughal Empire',
    'Revolt of 1857',
    'Vedic Age',
    'Mauryan Empire',
    'Gupta Empire',
    'Medieval Kingdoms',
    'Colonial India',
    'Social Reform Movements',
    'Post-Independence India',
  ],
  Geography: [
    'Rivers',
    'Climate',
    'Soils',
    'Mountains',
    'Drainage System',
    'Natural Vegetation',
    'Agriculture',
    'Minerals & Industries',
    'Coastal & Marine Geography',
    'World Geography',
  ],
  Environment: [
    'Biodiversity',
    'Climate Change',
    'Ecosystems',
    'Environmental Acts & Policies',
    'National Parks & Sanctuaries',
    'Pollution',
    'Sustainable Development',
    'International Environmental Agreements',
  ],
  Science: [
    'Physics Basics',
    'Chemistry Basics',
    'Biology & Life Sciences',
    'Space & ISRO',
    'Disease & Public Health',
    'Technology & Innovation',
  ],
  Ethics: [
    'Foundational Values',
    'Emotional Intelligence',
    'Public Administration Ethics',
    'Case Studies',
    'Thinkers & Philosophies',
    'Attitude & Aptitude',
  ],
}

/** Returns the list of topics for a given subject, or [] if not found. */
export function getTopics(subject) {
  return SUBJECT_TOPICS[subject] ?? []
}
