const Timetable = require('comcigan-parser');

async function test() {
    const timetable = new Timetable();
    try {
        await timetable.init();
        console.log('Searching for 동탄국제고등학교...');
        const searchResult = await timetable.search('동탄국제고등학교');
        console.log('Search Result:', searchResult);

        if (searchResult && searchResult.length > 0) {
            const school = searchResult[0];
            console.log(`Found school: ${school.name}, Code: ${school.code}`);

            timetable.setSchool(school.code);
            console.log('Fetching timetable...');
            const result = await timetable.getTimetable();
            console.log('Timetable fetched successfully.');
            console.log('Keys:', Object.keys(result));
        } else {
            console.log('School not found.');
        }

    } catch (e) {
        console.error('Error details:', e);
    }
}

test();
