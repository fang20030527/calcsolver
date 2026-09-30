import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isAllowedActivityUrl, localActivities, searchActivities } from '../src/lib/activities.ts';

test('external activities have 130 unique four-digit codes and approved sources',()=>{
  const activities = JSON.parse(readFileSync(new URL('../src/data/activities.json',import.meta.url),'utf8'));
  assert.equal(activities.length,130);
  assert.equal(new Set(activities.map((activity:{code:string})=>activity.code)).size,130);
  for(const activity of activities) {
    assert.match(activity.code,/^\d{4}$/);
    assert.notEqual(activity.code,'0000');
    assert.ok(activity.name);
    assert.ok(isAllowedActivityUrl(activity.iframe));
  }
});
test('embed validation rejects script URLs, userinfo, lookalike hosts and unconfigured local paths',()=>{
  for(const url of ['javascript:alert(1)','http://math.geet.in.net/game','https://math.geet.in.net.evil.test/game','https://user:password@math.geet.in.net/game','//math.geet.in.net/game','/admin/','https://math.geet.in.net:9999/game']) assert.equal(isAllowedActivityUrl(url),false,url);
  assert.equal(isAllowedActivityUrl('https://math.geet.in.net/get/2048/game.html'),true);
  assert.equal(isAllowedActivityUrl('/games/2048/'),true);
});
test('activity search matches names and codes without case sensitivity',()=>{
  assert.equal(searchActivities(localActivities,'  SNAKE ')[0]?.code,'3002');
  assert.equal(searchActivities(localActivities,'3001')[0]?.name,'2048 Classic');
  assert.equal(searchActivities(localActivities,'unfindable').length,0);
  assert.equal(searchActivities(localActivities,'').length,2);
});
