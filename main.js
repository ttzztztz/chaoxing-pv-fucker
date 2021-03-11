const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const fs = require("fs/promises");
const sto = require('timers/promises');

const EXEC_TIMES = 60;

const send_pv_req = async ({ cookie, config }, chaperid) => {
  const url = `https://fystat-ans.chaoxing.com/log/setlog?personid=${config.personid}&courseId=${config.courseId}&classId=${config.classId}&encode=${config.encode}&chapterId=${chaperid}`;
  const resp = await fetch(url, {
    headers: { cookie },
  });
  const txt = await resp.text();
  console.log(`chapterid=${chaperid}, resp=${txt}`);

  return txt === 'success'
};

const chapterid_list = [];
const getTeacherAjax = (_courseid, _classid, chaperid) => {
  chapterid_list.push(chaperid);
}

const menu = async ({ cookie, config }) => {
  const url = `https://mooc1-2.chaoxing.com/mycourse/studentstudycourselist?courseId=${config.courseId}&clazzid=${config.classId}`;
  const resp = await fetch(url, {
    headers: { cookie },
  });
  const html = await resp.text();

  const dom = new JSDOM(html);
  dom.window.document
    .querySelectorAll(".cells .ncells h4 a")
    .forEach((item) => eval(item.href));
};

(async () => {
  const cookie = await fs.readFile("./cookie.txt");
  const config = JSON.parse(await fs.readFile("./config.json"));
  const ctx = { cookie, config };

  await menu(ctx);
  console.log(chapterid_list);

  for (let i = 0; i < EXEC_TIMES; i++) {
    const res = await send_pv_req(ctx, chapterid_list[i % chapterid_list.length]);
    if (!res) {
      process.exit(-1);
    }

    await sto.setTimeout(~~(10000 * Math.random()));
    console.log(`Done #${i}`);
  }
})();

