import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSettings } from '../src/data/defaultSettings.js';
import { normalizeRecord, normalizeSettings, ValidationError } from '../src/dev/validation.js';
import { serviceOptions, photoRules } from '../src/pages/ContactPage/data/contactData.js';
import { createInitialInquiry, validateInquiry } from '../src/pages/ContactPage/data/inquiry.js';

const empty = () => ({services:[],categories:[],articles:[],projects:[]});

test('empty defaults retain contract shape but no fake contacts', () => {
  const settings = createDefaultSettings();
  for (const key of ['phone','email','street','locality','city','state','zip','hours','hoursNote','serviceArea','phoneHref']) assert.equal(settings[key],'');
  assert.deepEqual(settings.serviceStates,[]);
  assert.deepEqual(settings.map,{latitude:'',longitude:'',label:''});
  assert.ok(Object.values(settings.socials).every((v) => v === ''));
  settings.map.label = 'Changed';
  assert.equal(createDefaultSettings().map.label,'');
});
test('empty settings can round-trip through backup normalization', () => {
  const value = normalizeSettings(createDefaultSettings(),{allowUnconfigured:true});
  assert.equal(value.locality,'');assert.equal(value.phoneHref,'');assert.equal(value.company,'Veldridge Roofing');
});
test('ordinary settings save still requires complete contacts', () => {
  assert.throws(() => normalizeSettings(createDefaultSettings()),ValidationError);
});
test('backup exception rejects partially configured contacts', () => {
  assert.throws(() => normalizeSettings({...createDefaultSettings(),phone:'2155550101'},{allowUnconfigured:true}),ValidationError);
  assert.throws(() => normalizeSettings({...createDefaultSettings(),socials:{facebook:'https://example.com'}},{allowUnconfigured:true}),ValidationError);
});
test('Contact works with not-sure before services exist', () => {
  assert.deepEqual(serviceOptions,[{id:'not-sure',label:'Not sure yet'}]);
  assert.deepEqual(validateInquiry({...createInitialInquiry(null),name:'Test',email:'test@example.com'}),{});
  assert.equal(photoRules.maxCount,5);assert.equal(photoRules.maxBytes,10*1024*1024);
});
test('service required fields and two independent property flags survive cleanup', () => {
  assert.throws(() => normalizeRecord('services',{},empty(),new Set()),ValidationError);
  const s=normalizeRecord('services',{title:'Test',summary:'Test summary',imageId:'media-1',imageAlt:'Test roof',propertyTypes:['Residential','Commercial'],order:3},empty(),new Set(['media-1']));
  assert.deepEqual(s.propertyTypes,['Residential','Commercial']);assert.equal(s.order,3);assert.equal(s.homeImageId,'media-1');
});
test('title-only article draft remains allowed but publication is validated', () => {
  assert.equal(normalizeRecord('articles',{title:'Test draft'},empty(),new Set()).status,'draft');
  assert.throws(() => normalizeRecord('articles',{title:'Test draft',status:'published'},empty(),new Set()),ValidationError);
});
test('projects still require a service and a supported property type', () => {
  assert.throws(() => normalizeRecord('projects',{title:'Test project'},empty(),new Set()),ValidationError);
  const content={...empty(),services:[{id:'service-1',propertyTypes:['Residential']}]};
  const record=normalizeRecord('projects',{title:'Test project',serviceId:'service-1',propertyType:'Residential'},content,new Set());
  assert.equal(record.status,'draft');assert.deepEqual(record.photos,[]);
  assert.throws(() => normalizeRecord('projects',{...record,status:'published'},content,new Set()),ValidationError);
});
