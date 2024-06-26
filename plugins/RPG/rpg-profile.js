import {
    join
} from 'path';
import {
    xpRange
} from '../../lib/levelling.js';
import {
    BannerBot
} from "../../lib/welcome.js";
import fetch from 'node-fetch';
const checkUser = (id, adminList) => {
    const admin = adminList.find((participant) => participant.id === id)?.admin;
    return admin === 'superadmin' ? 'Super Admin' : admin === 'admin' ? 'Admin' : 'Member';
};

const potongString = (str) => str.length <= 80 ? str : str.slice(0, 80);


const handler = async (m, {
    conn,
    args,
    usedPrefix,
    command,
    groupMetadata,
    participants
}) => {
    try {
        const adminList = groupMetadata.participants || participants;
        const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
        const {
            exp,
            limit,
            level,
            role,
            money,
            lastclaim,
            lastweekly,
            registered,
            regTime,
            age,
            banned,
            pasangan
        } = global.db.data.users[who] || {};
        const {
            min,
            xp,
            max
        } = xpRange(level, global.multiplier);
        const name = m.name.split("\n")[0];
        const pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png');
        if (typeof global.db.data.users[who] == "undefined") {
            global.db.data.users[who] = {
                exp: 0,
                limit: 10,
                lastclaim: 0,
                registered: false,
                name: conn.getName(m.sender),
                age: -1,
                regTime: -1,
                afk: -1,
                afkReason: '',
                banned: false,
                level: 0,
                lastweekly: 0,
                role: 'Warrior V',
                autolevelup: false,
                money: 0,
                pasangan: "",
            };
        }
        const math = max - xp;
        const caption = `*YOUR PROFILE*
*🏷️ Nama:* *(${name})* ${registered ? '(' + name + ') ' : ''} ( @${who.split("@")[0]} )
*❤️ Pasangan:*  ${pasangan ? `@${pasangan.split("@")[0]}` : `Tidak Punya`}
*💲 Money:* *RP* ${money}
*🏆 Level* ${level}
*🎋 Role:* ${role}
*🧬 XP:* TOTAL ${exp} (${exp - min} / ${xp}) [${math <= 0 ? `Siap untuk *${usedPrefix}levelup*` : `${math} XP lagi untuk levelup`}]
*📨 Terdaftar:* ${registered ? 'Ya (' + new Date(regTime).toLocaleString() + ')' : 'Tidak'} ${lastclaim > 0 ? '\n*⏱️Terakhir Klaim:* ' + new Date(lastclaim).toLocaleString() : ''}\n\n Ketik ${usedPrefix}inv untuk melihat Inventory RPG`;

        const contohStringPanjang = `Ini adalah profil dari ${name}, seorang ${checkUser(m.sender, adminList)} di ${groupMetadata.subject}.`;
        const hasilPotong = potongString(contohStringPanjang);

        const profileBuffer = BannerBot(m.name.split("\n")[0]);
        try {
            await conn.sendFile(m.chat, profileBuffer, '', caption, m, null, {
                mentions: await conn.parseMention(caption)
            });
        } catch (e) {
            await conn.sendFile(m.chat, pp, '', caption, m, null, {
                mentions: await conn.parseMention(caption)
            });
        }
    } catch (e) {
        throw e;
    }
};

handler.help = ['profile'].map(v => v + ' <user>');
handler.tags = ['rpg'];
handler.command = /^(pro(fil)?(file)?)$/i;
handler.group = true

export default handler;