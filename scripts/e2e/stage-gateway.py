from pathlib import Path
import hashlib,json
root=Path('/home/ubuntu/acelera-barber');gateway=Path('/home/ubuntu/orc-prospecting-whatsapp/server.js')
s=gateway.read_text();original=s
if 'lauraTestRouter' in s: raise SystemExit('Gateway already contains Laura hooks; inspect rather than reapply.')
s="import { createTestRouter } from '/home/ubuntu/acelera-barber/services/laura-engine/gateway/test-router.mjs';\n"+s
anchor="const __dirname = path.dirname(__filename);"
s=s.replace(anchor,anchor+'''
// Exclusive assisted-test reservation. No extra WhatsApp connection is created.
const lauraPrivateEnv = '/home/ubuntu/acelera-barber/.runtime/e2e/app.env';
let lauraToken = '';
try { lauraToken = fs.readFileSync(lauraPrivateEnv,'utf8').match(/^LAURA_INTERNAL_TOKEN=(.+)$/m)?.[1] || ''; } catch {}
const lauraTestRouter = createTestRouter({
 stateFile:'/home/ubuntu/acelera-barber/.runtime/e2e/active.json',
 spoolDir:'/home/ubuntu/acelera-barber/.runtime/e2e/gateway-spool',
 token:lauraToken,
});
''')
s=s.replace('export function assertTargetAuthorized(target) {','export function assertTargetAuthorized(target) {\n  lauraTestRouter.assertOutbound(target);')
s=s.replace("app.use(express.json({ limit: '50mb' }));", "app.use(express.json({ limit: '50mb' }));\napp.use(lauraTestRouter.middleware);")
s=s.replace('      // Notifica todos os listeners',"      if (await lauraTestRouter.route('inbound', inbound)) continue;\n\n      // Notifica todos os listeners")
s=s.replace('  for (const chat of unanswered) {\n    try {',"  for (const chat of unanswered) {\n    try {\n      if (await lauraTestRouter.route('inbound', {remoteJid:chat.remoteJid,phone:chat.phone,text:chat.lastMessageText,messageId:chat.lastMessageId||null,timestamp:chat.lastMessageTimestamp,isScanUnanswered:true})) continue;")
s=s.replace('      // Notifica o Runner para resetar',"      if (await lauraTestRouter.route('presence', {remoteJid,phone,presence:activeEntry.lastKnownPresence,timestamp:new Date().toISOString()})) return;\n\n      // Notifica o Runner para resetar")
s=s.replace("          console.log(`🎧 [Recibo Mensagem]", "          if (await lauraTestRouter.route('receipt', {remoteJid,phone,messageId,status:isPlayed?'PLAYED':'READ',timestamp:new Date().toISOString()})) continue;\n\n          console.log(`🎧 [Recibo Mensagem]")
# protect additional HTTP endpoints which bypass exported send functions
s=s.replace('  const target = req.body?.to || req.body?.phone || req.body?.jid;','  const target = req.body?.to || req.body?.phone || req.body?.jid;\n  try { if(target) lauraTestRouter.assertOutbound(target); } catch(e) { return res.status(403).json({error:e.message}); }')
s=s.replace('const result = await sock.sendMessage(jid,', 'lauraTestRouter.assertOutbound(jid);\n      const result = await sock.sendMessage(jid,')
# Stage patch, do not modify the running gateway before runtime gates are validated.
private=root/'.runtime/e2e/gateway-backup';private.mkdir(exist_ok=True,mode=0o700)
(private/'server.original.js').write_text(original);(private/'server.patched.js').write_text(s)
(private/'manifest.json').write_text(json.dumps({'originalSha256':hashlib.sha256(original.encode()).hexdigest(),'patchedSha256':hashlib.sha256(s.encode()).hexdigest(),'installed':False},indent=2))
for f in private.iterdir():f.chmod(0o600)
print('Gateway patch staged with backup; live source/process unchanged.')
