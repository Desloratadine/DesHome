/**
 * Fortune Module - Daily fortune (Qian) drawing system
 * Uses localStorage to limit one draw per day
 */

const qianList = [
    {
        content: "˖˚ ꔫ 莓好運氣正在派送 ♡․⁺",
        explain: "今天会收到甜甜的小幸运哦～ 可能是奶茶第二杯半价，或是路上捡到超可爱的小贴纸！"
    },
    {
        content: "₊⁺ ꒰১ 星屑降落在你指尖 ໒꒱ ⁺₊",
        explain: "灵感像星星一样闪呀闪～ 做决定时跟着直觉走，会发现超棒的新方向！"
    },
    {
        content: "‧₊ ๋ ⊹ 棉花糖般的松弛日 ˚⊹ ․⁺",
        explain: "不用急着赶进度呀～ 像棉花糖慢慢融化那样，享受发呆和晒太阳的小确幸吧～"
    },
    {
        content: "⊹ ꔫ ⊹ 樱花瓣敲你的窗 ⊹ ꔫ ⊹",
        explain: "会有温柔的好事发生哦～ 可能是朋友的一句关心，或是偶然听到超喜欢的歌！"
    },
    {
        content: "₊⁺·𖧷 𝖲𝖜𝖊𝖊𝖙 𝖘𝖚𝖗𝖕𝖗𝖎𝖘𝖊𝖘 ♡·⁺₊",
        explain: "藏在生活里的小惊喜正在发芽～ 拆开快递、打开冰箱都可能遇到甜甜的意外！"
    },
    {
        content: "˖˚. ❅ 薄荷味的顺利日 ‧₊˚⊹",
        explain: "做事像含了薄荷糖一样清爽～ 作业、工作都能顺顺当当，效率超高！"
    },
    {
        content: "˚₊♡. 𝙲𝚊𝚝 𝚙𝚊𝚠𝚜 𝚘𝚏 𝚕𝚞𝚌𝚔 ⟡𓈒˚₊",
        explain: "被猫咪爪子轻轻拍过的好运～ 出门会遇到心软的神，困难都会变小小只！"
    },
    {
        content: "⁺ ˖୨୧ 奶泡般的温柔包裹 ୨୧˖˚",
        explain: "今天会被温柔包围哦～ 家人朋友的关心像奶泡一样软乎乎，超治愈！"
    }
];

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', function () {
    const qianTong = document.getElementById('qianTong');
    const qianResult = document.getElementById('qianResult');
    const qianContent = document.getElementById('qianContent');
    const qianExplain = document.getElementById('qianExplain');
    const qianTip = document.getElementById('qianTip');

    if (!qianTong) return;

    let hasDrawnToday = localStorage.getItem('hasDrawnQian_' + getTodayDate()) === 'true';

    if (hasDrawnToday) {
        qianTong.textContent = "今日已抽(>_<)";
        qianTong.style.cursor = "default";
        qianTip.textContent = "明天再来试试运气吧~";
        const lastQian = JSON.parse(localStorage.getItem('lastQian_' + getTodayDate()));
        if (lastQian) {
            qianContent.textContent = lastQian.content;
            qianExplain.textContent = lastQian.explain;
            qianResult.style.display = "block";
        }
    }

    qianTong.addEventListener('click', function () {
        if (hasDrawnToday) return;

        qianTong.style.transform = "scale(0.9) rotate(-5deg)";
        setTimeout(() => {
            qianTong.style.transform = "scale(1.1) rotate(5deg)";
            setTimeout(() => {
                qianTong.style.transform = "";

                const randomIndex = Math.floor(Math.random() * qianList.length);
                const selectedQian = qianList[randomIndex];

                qianContent.textContent = selectedQian.content;
                qianExplain.textContent = selectedQian.explain;
                qianResult.style.display = "block";

                hasDrawnToday = true;
                localStorage.setItem('hasDrawnQian_' + getTodayDate(), 'true');
                localStorage.setItem('lastQian_' + getTodayDate(), JSON.stringify(selectedQian));

                qianTong.textContent = "今日已抽(>_<)";
                qianTong.style.cursor = "default";
                qianTip.textContent = "明天再来试试运气吧~";
            }, 300);
        }, 300);
    });
});