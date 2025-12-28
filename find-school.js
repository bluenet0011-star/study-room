const Timetable = require('comcigan-parser');
const timetable = new Timetable();

async function findSchool() {
    await timetable.init();
    const schools = await timetable.search('동탄국제고등학교');
    console.log(schools);
}

findSchool();
