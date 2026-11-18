import test from 'node:test';
import assert from 'node:assert/strict';
import { adminFieldPlaceholder } from '../src/admin/components/fieldExamples.js';

for (const label of [
  'Service name *', 'Short description', 'Full description', 'Eyebrow', 'Contact button label',
  'Project title *', 'Project summary', 'Property description', 'On-site duration', 'Main material', 'Finish / color',
  'Photo caption', 'Alt text override', 'Title *', 'Introduction / card excerpt', 'Section heading', 'Paragraphs',
  'Source label', 'Source URL', 'Category name *', 'Description', 'Author name *', 'Review text',
  'Company name *', 'Phone *', 'Email *', 'Street address', 'City', 'State', 'ZIP code',
  'Business hours', 'Additional hours note', 'Add an internal note',
]) test(`example for ${label}`, () => assert.ok(adminFieldPlaceholder({ label })?.length > 0));

test('examples do not alter field values or props', () => {
  const props = Object.freeze({ label: 'Service name *', value: 'Existing title' });
  adminFieldPlaceholder(props);
  assert.equal(props.value, 'Existing title');
  assert.equal(Object.hasOwn(props, 'placeholder'), false);
});
test('explicit placeholders, including an intentionally empty one, win', () => {
  assert.equal(adminFieldPlaceholder({ label: 'Title', placeholder: 'Custom example' }), 'Custom example');
  assert.equal(adminFieldPlaceholder({ label: 'Title', placeholder: '' }), '');
});
for (const type of ['date', 'number', 'file', 'checkbox']) test(`native ${type} controls are unchanged`, () => {
  assert.equal(adminFieldPlaceholder({ label: 'Title', type }), undefined);
});
test('selects keep their actual options instead of text examples', () => {
  assert.equal(adminFieldPlaceholder({ name: 'state', children: ['PA', 'NJ'] }), undefined);
});
test('repeated work items and points get useful examples', () => {
  assert.match(adminFieldPlaceholder({ name: 'point-0' }), /condition/);
  assert.match(adminFieldPlaceholder({ name: 'work-2' }), /flashing/);
});
test('unknown fields do not receive a misleading example', () => {
  assert.equal(adminFieldPlaceholder({ label: 'Unknown field', name: 'unknown' }), undefined);
});
