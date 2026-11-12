import project01 from '../assets/projects/project-01.webp';
import project02 from '../assets/projects/project-02.webp';
import project03 from '../assets/projects/project-03.webp';
import project04 from '../assets/projects/project-04.webp';
import project05 from '../assets/projects/project-05.webp';
import project06 from '../assets/projects/project-06.webp';
import project07 from '../assets/projects/project-07.webp';
import project08 from '../assets/projects/project-08.webp';
import project09 from '../assets/projects/project-09.webp';
import project10 from '../assets/projects/project-10.webp';
import project11 from '../assets/projects/project-11.webp';
import project12 from '../assets/projects/project-12.webp';
import project13 from '../assets/projects/project-13.webp';
import project14 from '../assets/projects/project-14.webp';
import project15 from '../assets/projects/project-15.webp';
import project16 from '../assets/projects/project-16.webp';
import project17 from '../assets/projects/project-17.webp';
import project18 from '../assets/projects/project-18.webp';

export const INITIAL_PROJECT_COUNT = 12;
export const PROJECT_BATCH_SIZE = 6;
export const projectCategories = [
  { id: 'all', label: 'All Projects' },
  { id: 'replacement', label: 'Roof Replacement' },
  { id: 'repairs', label: 'Repairs' },
  { id: 'renovation', label: 'Roof Renovation' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'solar', label: 'Solar' },
];

// ALL records below are illustrative design content, not verified company work.
// Crops show details of ONE image, never unrelated properties or fake before/after.
// Replace each photos array with actual same-project photographs before publication.
const samplePhotos = (src, alt) => [
  { id: 'overview', src, alt, caption: 'Project photograph / overview' },
  { id: 'roof-detail', src, alt: `${alt} — cropped roof detail`, caption: 'Roof detail / crop of the same photograph', crop: { scale: 1.7241, left: -39.66, top: -20.69 } },
  { id: 'finish-detail', src, alt: `${alt} — cropped finishing detail`, caption: 'Finishing detail / crop of the same photograph', crop: { scale: 1.9231, left: -23.08, top: -76.92 } },
];

const records = [
  {
    id: 'standing-seam-roof-upgrade', title: 'Standing-Seam Roof Upgrade', dialogTitle: 'Standing-Seam\nRoof Upgrade', category: 'replacement', image: project01,
    imageAlt: 'Charcoal standing-seam roof on a timber-clad home',
    summary: 'A clean-lined metal roof with coordinated flashing and a careful finish, designed around the home.',
    property: 'Single-family home', duration: '4 working days', material: 'Standing-seam steel', finish: 'Charcoal',
    work: ['Removed the old roof covering', 'Installed underlayment and metal panels', 'Finished flashing, edges and site cleanup'],
  },
  {
    id: 'a-new-roof-a-fresh-outlook', title: 'A New Roof, A Fresh Outlook', category: 'replacement', image: project02,
    imageAlt: 'Dark tiled roof with a dormer and crisp ridge details',
    summary: 'A coordinated roof replacement with attention to the dormer, ridge and edges.',
    property: 'Detached home', duration: '5 working days', material: 'Roof tiles and underlayment', finish: 'Slate gray',
    work: ['Prepared the roof for new covering', 'Installed tiles and coordinated ridge details', 'Checked dormer transitions and cleared the site'],
  },
  {
    id: 'low-slope-commercial-roof', title: 'Low-Slope Commercial Roof', category: 'commercial', image: project03,
    imageAlt: 'A light-colored low-slope roof on a commercial building',
    summary: 'A low-slope roofing concept planned around the building and its day-to-day use.',
    property: 'Commercial property', duration: '6 working days', material: 'Single-ply roof membrane', finish: 'White',
    work: ['Prepared the existing roof surface', 'Installed membrane and perimeter details', 'Reviewed drainage and rooftop penetrations'],
  },
  {
    id: 'rooftop-solar-installation', title: 'Rooftop Solar Installation', category: 'solar', image: project04,
    imageAlt: 'Solar panels arranged on a residential pitched roof',
    summary: 'A rooftop solar concept that considers panel layout and the roof beneath it together.',
    property: 'Single-family home', duration: '3 working days', material: 'PV panels and mounting system', finish: 'Black panels',
    work: ['Reviewed roof condition and panel layout', 'Coordinated mounting and roofing details', 'Completed installation checks and cleanup'],
  },
  {
    id: 'a-classic-roof-renewed', title: 'A Classic Roof, Renewed', category: 'renovation', image: project05,
    imageAlt: 'A traditional tiled roof with a brick chimney',
    summary: 'A roof refresh that retains the character of the home while addressing worn details.',
    property: 'Detached home', duration: '4 working days', material: 'Roof tiles and flashing', finish: 'Warm brown',
    work: ['Reviewed the condition of the existing roof', 'Renewed selected tiles and flashing', 'Finished the ridge and chimney transitions'],
  },
  {
    id: 'woodland-home-roof-refresh', title: 'Woodland Home Roof Refresh', category: 'renovation', image: project06,
    imageAlt: 'A tiled roof above a wood-clad home beside trees',
    summary: 'A considered roofing refresh with a finish that complements the timber exterior.',
    property: 'Woodland home', duration: '4 working days', material: 'Roof tiles and underlayment', finish: 'Gray',
    work: ['Assessed the covering and roof details', 'Renewed worn materials and edge details', 'Checked the finished roof and cleaned the work area'],
  },
  {
    id: 'chimney-flashing-repairs', title: 'Chimney & Flashing Repairs', category: 'repairs', image: project07,
    imageAlt: 'A residential roof and chimney under a cloudy sky',
    summary: 'Focused repair work around the chimney and the transitions where details matter most.',
    property: 'Single-family home', duration: '2 working days', material: 'Metal flashing and roof tiles', finish: 'Matched to the roof',
    work: ['Inspected the chimney-to-roof junction', 'Renewed selected flashing and adjacent tiles', 'Reviewed the repaired transitions'],
  },
  {
    id: 'metal-roof-detail-repairs', title: 'Metal Roof Detail Repairs', category: 'repairs', image: project08,
    imageAlt: 'A roofing professional working on a metal roof',
    summary: 'A targeted repair concept for metal-roof seams and finishing details.',
    property: 'Residential property', duration: '2 working days', material: 'Metal panels and flashing', finish: 'Dark gray',
    work: ['Inspected the affected roof detail', 'Repaired selected seams and flashing', 'Checked the completed repair area'],
  },
  {
    id: 'a-thoughtful-roof-renovation', title: 'A Thoughtful Roof Renovation', category: 'renovation', image: project09,
    imageAlt: 'Dark roof tiles on a residential roof with a chimney',
    summary: 'A practical renovation concept shaped around the condition of the existing roof.',
    property: 'Detached home', duration: '4 working days', material: 'Roof tiles and ridge components', finish: 'Graphite',
    work: ['Assessed the existing roof structure', 'Renewed selected covering and ridge details', 'Reviewed the finish and cleared the site'],
  },
  {
    id: 'new-roofing-lasting-character', title: 'New Roofing, Lasting Character', category: 'replacement', image: project10,
    imageAlt: 'A gray tiled roof and chimney above brick walls',
    summary: 'A new roof concept that complements the brickwork and the home’s established character.',
    property: 'Single-family home', duration: '5 working days', material: 'Roof tiles and underlayment', finish: 'Gray',
    work: ['Removed the worn roof covering', 'Installed underlayment and roof tiles', 'Finished chimney flashing and perimeter details'],
  },
  {
    id: 'residential-roof-replacement', title: 'Residential Roof Replacement', category: 'replacement', image: project11,
    imageAlt: 'Roofing professionals installing roof tiles',
    summary: 'A replacement roof concept with care at each stage, from preparation to finishing.',
    property: 'Residential property', duration: '5 working days', material: 'Roof tiles and accessories', finish: 'Coordinated gray',
    work: ['Prepared the roof for replacement', 'Installed the new covering in sections', 'Checked the final details and cleaned the work area'],
  },
  {
    id: 'roof-repairs-down-to-the-detail', title: 'Roof Repairs, Down To The Detail', category: 'repairs', image: project12,
    imageAlt: 'Roofers working on a standing-seam roof above timber walls',
    summary: 'A focused roofing repair concept with attention to the seams, edges and transitions.',
    property: 'Timber-clad home', duration: '3 working days', material: 'Standing-seam metal and flashing', finish: 'Charcoal',
    work: ['Reviewed the affected roof areas', 'Repaired panels and coordinated flashing', 'Completed finishing checks and cleanup'],
  },
  // Extra illustrative entries exercise Load More without duplicating the first 12 cards.
  {
    id: 'residential-roofing-concept', title: 'Residential Roofing Concept', category: 'replacement', image: project13,
    imageAlt: 'Residential roofing example from the project image collection',
    summary: 'A sample replacement project showing how a new roof can complement a home.',
    property: 'Residential property', duration: '4 working days', material: 'Architectural shingles', finish: 'Charcoal',
    work: ['Reviewed replacement options', 'Prepared and installed the covering', 'Finished roof details and cleanup'],
  },
  {
    id: 'business-roofing-concept', title: 'Business Roofing Concept', category: 'commercial', image: project14,
    imageAlt: 'Commercial roofing example from the project image collection',
    summary: 'An illustrative commercial project with a practical approach to planning and coordination.',
    property: 'Commercial property', duration: '6 working days', material: 'Commercial roofing system', finish: 'Project-matched finish',
    work: ['Reviewed the roof and project scope', 'Coordinated work around the property', 'Completed finishing checks'],
  },
  {
    id: 'targeted-roof-repair-concept', title: 'Targeted Roof Repair Concept', category: 'repairs', image: project15,
    imageAlt: 'Roof repair example from the project image collection',
    summary: 'A sample repair project focused on the affected area rather than replacing the whole roof.',
    property: 'Single-family home', duration: '2 working days', material: 'Matching roofing and flashing', finish: 'Matched to the existing roof',
    work: ['Located the affected details', 'Renewed selected roofing materials', 'Checked the repair and cleared the site'],
  },
  {
    id: 'roof-refresh-concept', title: 'Roof Refresh Concept', category: 'renovation', image: project16,
    imageAlt: 'Roof renovation example from the project image collection',
    summary: 'An illustrative roof refresh that balances condition, appearance and the needs of the home.',
    property: 'Detached home', duration: '3 working days', material: 'Roof covering and accessories', finish: 'Coordinated finish',
    work: ['Assessed existing materials', 'Renewed worn sections', 'Reviewed transitions and finishing details'],
  },
  {
    id: 'solar-ready-roofing-concept', title: 'Solar-Ready Roofing Concept', category: 'solar', image: project17,
    imageAlt: 'Solar roofing example from the project image collection',
    summary: 'A sample solar project bringing the roof condition and panel layout into one plan.',
    property: 'Residential property', duration: '3 working days', material: 'PV panels and mounting system', finish: 'Black panels',
    work: ['Reviewed roofing readiness', 'Coordinated panel positioning', 'Checked mounting and roof details'],
  },
  {
    id: 'roof-care-and-repair-concept', title: 'Roof Care & Repair Concept', category: 'repairs', image: project18,
    imageAlt: 'Roof inspection example from the project image collection',
    summary: 'An illustrative inspection-led repair plan that starts with understanding the roof.',
    property: 'Single-family home', duration: '2 working days', material: 'Selected roofing components', finish: 'Matched to the property',
    work: ['Reviewed visible roof concerns', 'Addressed selected repair priorities', 'Discussed the finished work and roof care'],
  },
];

export const galleryProjects = records.map((project) => ({
  ...project,
  isDemo: true,
  categoryLabel: projectCategories.find(({ id }) => id === project.category).label,
  photos: samplePhotos(project.image, project.imageAlt),
}));
