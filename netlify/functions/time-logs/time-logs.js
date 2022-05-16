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

const arrToString = (arr, string) => {
  const filteredArr = arr.filter((item) => item.includes(string));
  const newString = filteredArr[0].replace(string, '');
  return newString;
};

const handler = async function (event) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let fromDate = '2021-01-01';
    let fromDateStr = fromDate.replace(/-/g, '');
    let toDate = dateConvert(yesterday);
    let toDateStr = toDate.replace(/-/g, '');
    let worktime = 7.5;
    let startingBalance = 0;

    //Get email from slack payload
    const eventBodyArr = event.body.split('&');
    const emailArr = eventBodyArr.filter((item) => item.includes('user_name'));
    const email = `${emailArr[0].replace('user_name=', '')}@woolman.io`;

    //Get custom data from slack payload
    const textArr = eventBodyArr.filter((item) => item.includes('text='));
    if (textArr) {
      let customContentArr = textArr[0].replace('text=', '');
      if (customContentArr.length > 1) {
        customContentArr = customContentArr.split('+');
      }

      //Check parameters

      if (customContentArr.some((e) => e.includes('from%3D'))) {
        const customDateFrom = arrToString(customContentArr, 'from%3D');
        fromDate = customDateFrom;
        fromDateStr = fromDate.replace(/-/g, '');
      }

      if (customContentArr.some((e) => e.includes('to%3D'))) {
        const customDateTo = arrToString(customContentArr, 'to%3D');
        toDate = customDateTo;
        toDateStr = toDate.replace(/-/g, '');
      }

      if (customContentArr.some((e) => e.includes('worktime%3D'))) {
        const customWorktime = arrToString(customContentArr, 'worktime%3D');
        worktime = +customWorktime;
      }

      if (customContentArr.some((e) => e.includes('balances%3D'))) {
        const customStartingBalance = arrToString(
          customContentArr,
          'balances%3D'
        );
        startingBalance = customStartingBalance;
        console.log(`Balances ${startingBalance}`);
      }
    }

    const userJSON = await fetchData(
      `https://woolman.eu.teamwork.com/projects/api/v3/people.json?searchTerm=${email}`
    );
    const userId = userJSON.people[0].id;

    const mainHoursJSON = await fetchData(
      `https://woolman.eu.teamwork.com/time/total.json?userId=${userId}&fromDate=${fromDateStr}&toDate=${toDateStr}&projectType=all`
    );
    const mainHours = mainHoursJSON['time-totals']['total-hours-sum'];

    const pastSevenDaysHours = await pastSevenDays(yesterday, userId, worktime);

    const days = workDays(new Date(fromDate), new Date(toDate));
    const mainHoursToCompare = days * worktime;

    const total_hours = Math.trunc(
      mainHours - mainHoursToCompare + startingBalance
    );
    const total_left_mins = Math.ceil(
      (Math.abs(mainHours - total_hours) * 60) % 60
    );
    const past_seven_days_h = Math.trunc(pastSevenDaysHours);
    const past_seven_days_left_mins = Math.ceil(
      (Math.abs(pastSevenDaysHours - past_seven_days_h) * 60) % 60
    );

    //hours: mainHours - mainHoursToCompare,
    //Texts to be rendered
    const totalsText =
      total_left_mins !== 0
        ? `${total_hours}h ${total_left_mins}min`
        : `${total_hours}h`;

    const past7Days =
      past_seven_days_left_mins !== 0
        ? `${past_seven_days_h}h ${past_seven_days_left_mins}min`
        : `${past_seven_days_h}h`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Your balances are ${totalsText} from ${fromDate} to ${toDate}. From last 7 days your balances are ${past7Days}`,
        response_type: 'ephemeral',
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        text: `Something went wrong. Make sure you typed extra parameters correctly!`,
        response_type: 'ephemeral',
      }),
    };
  }
};

module.exports = { handler };
