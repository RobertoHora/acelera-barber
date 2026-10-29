import {it,expect} from 'vitest';
import {wifiQrPayload,reviewQrUrl} from '@/lib/qr-payloads';
it('escapes Wi-Fi credentials and supports open networks',()=>{expect(wifiQrPayload('Loja;ORC','abc:def\\ghi')).toBe('WIFI:T:WPA;S:Loja\\;ORC;P:abc\\:def\\\\ghi;;');expect(wifiQrPayload('Livre','')).toContain('T:nopass');});
it('never makes up a review destination',()=>{expect(reviewQrUrl()).toBeNull();expect(reviewQrUrl('https://evil.test')).toBeNull();expect(reviewQrUrl(undefined,'abc id')).toContain('abc%20id');});
