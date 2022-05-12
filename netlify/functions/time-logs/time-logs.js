const fetch = require('node-fetch');

const workDays = (start, end) => {
  let count = 0;
  let cur = start;
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    const isWeekend = dayOfWeek == 6 || dayOfWeek == 0;
    if (!isWeekend) count++;
    const nextDay = new Date(cur);
    nextDay.setDate(nextDay.getDate() + 1);
    cur = nextDay;
  }
  return count;
};

const dateConvert = (date) => date.toISOString().split('T')[0].toString();

const fetchData = async function (url) {
  const credentials = `${process.env.TEAMWORK_USER}:${process.env.TEAMWORK_PASS}`;
  const data = await fetch(url, {
    headers: {
      Authorization: 'Basic '.concat(
        Buffer.from(credentials, 'utf8').toString('base64')
      ),
    },
  });
  const dataJSON = await data.json();
  return dataJSON;
};

const pastSevenDays = async function (yesterday, userId, worktime) {
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const fromDate = dateConvert(from);
  const fromDateStr = fromDate.replace(/-/g, '');
  const toDate = dateConvert(yesterday);
  const toDateStr = toDate.replace(/-/g, '');

  const timeJSON = await fetchData(
    `https://woolman.eu.teamwork.com/time/total.json?userId=${userId}&fromDate=${fromDateStr}&toDate=${toDateStr}&projectType=all`
  );
  const totalHours = timeJSON['time-totals']['total-hours-sum'];

  const days = workDays(new Date(fromDate), new Date(toDate));
  const hoursToCompare = days * worktime;

  return totalHours - hoursToCompare;
};

const handler = async function (event) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const email = event.queryStringParameters.email;
    const fromDate = event.queryStringParameters.from || '2021-01-01';
    const fromDateStr = fromDate.replace(/-/g, '');
    const toDate = event.queryStringParameters.to || dateConvert(yesterday);
    const toDateStr = toDate.replace(/-/g, '');
    const worktime = event.queryStringParameters.worktime
      ? +event.queryStringParameters.worktime
      : 7.5;

    if (!email) {
      throw 'No email given!';
    }

    const userJSON = await fetchData(
      `https://woolman.eu.teamwork.com/projects/api/v3/people.json?searchTerm=${email}`
    );
    const userId = userJSON.people[0].id;
    console.log(userId);

    const mainHoursJSON = await fetchData(
      `https://woolman.eu.teamwork.com/time/total.json?userId=${userId}&fromDate=${fromDateStr}&toDate=${toDateStr}&projectType=all`
    );
    const mainHours = mainHoursJSON['time-totals']['total-hours-sum'];
    console.log(mainHours);

    const pastSevenDaysHours = await pastSevenDays(yesterday, userId, worktime);

    const days = workDays(new Date(fromDate), new Date(toDate));
    console.log('days', days);
    const mainHoursToCompare = days * worktime;

    console.log(mainHours - mainHoursToCompare);
    const total_hours = Math.trunc(mainHours - mainHoursToCompare);
    const total_left_mins = Math.ceil(
      (Math.abs(mainHours - total_hours) * 60) % 60
    );
    const past_seven_days_h = Math.trunc(pastSevenDaysHours);
    const past_seven_days_left_mins = Math.ceil(
      (Math.abs(pastSevenDaysHours - past_seven_days_h) * 60) % 60
    );
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: event.queryStringParameters.text,
        hours: mainHours - mainHoursToCompare,
        as_text:
          total_left_mins !== 0
            ? `${total_hours}h ${total_left_mins}min`
            : `${total_hours}h`,
        last_7_days:
          past_seven_days_left_mins !== 0
            ? `${past_seven_days_h}h ${past_seven_days_left_mins}min`
            : `${past_seven_days_h}h`,
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err }),
    };
  }
};

module.exports = { handler };
