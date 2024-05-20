import fetch from 'node-fetch';
import cheerio from 'cheerio';

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {
    const text = args.length >= 1 ? args.slice(0).join(" ") : (m.quoted && m.quoted?.text || m.quoted?.caption || m.quoted?.description) || null;

    if (!text) return m.reply(`Input query. Example: ${usedPrefix + command} hello.`);
    const stylizedText = stylizeText(text);
    try {
        await conn.reply(m.chat, stylizedText, m);
    } catch (error) {
        await m.reply(`Error: ${error.message} ❌`);
    }
}
handler.help = ['font', 'styletext'].map(v => v + ' <text>')
handler.tags = ['tools']
handler.command = /^(font|styletext)$/i
handler.owner = false

handler.limit = true

export default handler

const stylizeText = async (query) => {
    try {
        const response = await fetch(`http://qaz.wtf/u/convert.cgi?text=${encodeURIComponent(query)}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const tableData = $('table tr').map((i, row) => {
            const cells = $(row).find('td');
            return cells.length > 1 ? {
                name: $(cells[0]).find('.aname').text() || $(cells[0]).text(),
                value: $(cells[1]).html().trim()
            } : null;
        }).get().filter(Boolean);

        return tableData;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};