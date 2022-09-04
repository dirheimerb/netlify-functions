// TODO: Define event interface for handler function
import { Handler } from '@netlify/functions';
import {
  fetchTeamworkData,
  pastSevenDays,
  workDays,
  dateConvert,
  arrToString,
} from './helpers';

//
const handler: Handler = async (event, context) => {
  try {
    console.log('event');
    console.log(event);
    //Get date for yesterday
    const yesterday: Date = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    //Orignal date when we started to log hours
    let fromDate: string = '2021-01-01';
    //Date to teamwork format
    let fromDateStr: string = fromDate.replace(/-/g, '');
    //Default to date
    let toDate: string = dateConvert(yesterday);
    //Default to date to teamwork format
    let toDateStr: string = toDate.replace(/-/g, '');
    //Default worktime
    let worktime: number = 7.5;
    //Default balances from before 2021-01-01
    let startingBalance: number = 0;

    //Get Slack payload body
    const eventBodyArr = event.body.split('&');
    //Filter user name from Slcak payload body
    const emailArr = eventBodyArr.filter((item: any) =>
      item.includes('user_name')
    );
    console.log('emailArr');
    console.log(emailArr);
    //Convert username to woolman email
    const email = `${emailArr[0].replace('user_name=', '')}@woolman.io`;

    //Get custom data from slack payload
    const textArr = eventBodyArr.filter((item: any) => {
      console.log('text item');
      console.log(item);
      item.includes('text=');
    });
    //remove text= string from custom data
    let customContentArr: any = textArr[0].replace('text=', '');
    console.log('customContentArr');
    console.log(customContentArr);
    if (customContentArr.length > 1) {
      customContentArr = customContentArr.split('+');
    }
    if (customContentArr.length > 0) {
      //Get custom starting date from Slack parameters
      if (customContentArr.some((e: any) => e.includes('from%3D'))) {
        const customDateFrom = arrToString(customContentArr, 'from%3D');
        fromDate = customDateFrom;
        fromDateStr = fromDate.replace(/-/g, '');
      }
      //Get custom end date from Slack parameters
      if (customContentArr.some((e: any) => e.includes('to%3D'))) {
        const customDateTo = arrToString(customContentArr, 'to%3D');
        toDate = customDateTo;
        toDateStr = toDate.replace(/-/g, '');
      }
      //Get custom worktime from Slack parameters
      if (customContentArr.some((e: any) => e.includes('worktime%3D'))) {
        const customWorktime = arrToString(customContentArr, 'worktime%3D');
        worktime = +customWorktime;
      }
      //Get custom starting balances from Slack parameters
      if (customContentArr.some((e: any) => e.includes('balances%3D'))) {
        const customStartingBalance = arrToString(
          customContentArr,
          'balances%3D'
        );
        startingBalance = +customStartingBalance;
      }
    }

    const userJSON = await fetchTeamworkData(
      `https://woolman.eu.teamwork.com/projects/api/v3/people.json?searchTerm=${email}`
    );
    const userId = userJSON.people[0].id;

    const mainHoursJSON = await fetchTeamworkData(
      `https://woolman.eu.teamwork.com/time/total.json?userId=${userId}&fromDate=${fromDateStr}&toDate=${toDateStr}&projectType=all`
    );
    const mainHours = mainHoursJSON['time-totals']['total-hours-sum'];

    const pastSevenDaysHours = await pastSevenDays(yesterday, userId, worktime);

    const days = workDays(new Date(fromDate), new Date(toDate));
    const mainHoursToCompare = days * worktime;

    const calculatedMinutes = mainHours - mainHoursToCompare + startingBalance;

    const total_hours = Math.trunc(calculatedMinutes);
    const total_left_mins = Math.ceil((calculatedMinutes % 1) * 60);
    const past_seven_days_h = Math.trunc(pastSevenDaysHours);
    const past_seven_days_left_mins = Math.ceil(
      ((pastSevenDaysHours - past_seven_days_h) % 1) % 60
    );

    //Texts to be rendered
    const totalsText: string =
      total_left_mins !== 0
        ? `${total_hours}h ${total_left_mins}min`
        : `${total_hours}h`;

    const past7Days: string =
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
      statusCode: 200,
      body: JSON.stringify({
        text: `Something went wrong. Make sure you typed extra parameters correctly!`,
        response_type: 'ephemeral',
      }),
    };
  }
};

export { handler };
