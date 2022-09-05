import { Handler } from '@netlify/functions';
import {
  fetchTeamworkData,
  pastSevenDays,
  workDays,
  dateConvert,
  arrToString,
} from './helpers';

//Netlify mandatory handler function, thins function is run when Netlify function is
const handler: Handler = async (event, context) => {
  try {
    //Get date for yesterday
    const yesterday: Date = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    //Default from date
    let fromDate: string = '2021-01-01';
    //From date to teamwork format
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
    const eventBodyArr: Array<string> = event.body.split('&');
    //Filter user name from Slcak payload body
    const emailArr: Array<string> = eventBodyArr.filter((item: string) =>
      item.includes('user_name')
    );
    //Convert username to woolman email
    const email: string = `${emailArr[0].replace('user_name=', '')}@woolman.io`;
    //Get custom data from slack payload
    const textArr: Array<string> = eventBodyArr.filter((item: string) =>
      item.includes('text=')
    );
    //Remove text= string from custom data
    const customParameter: string = textArr[0].replace('text=', '');
    //If list is not empty, split it to array from + characters
    if (customParameter) {
      const customParameters: Array<string> = customParameter.split('+');
      //Get custom starting date from Slack parameters
      if (customParameters.some((e: string) => e.includes('from%3D'))) {
        const customDateFrom = arrToString(customParameters, 'from%3D');
        fromDate = customDateFrom;
        fromDateStr = fromDate.replace(/-/g, '');
      }
      //Get custom end date from Slack parameters
      if (customParameters.some((e: string) => e.includes('to%3D'))) {
        const customDateTo = arrToString(customParameters, 'to%3D');
        toDate = customDateTo;
        toDateStr = toDate.replace(/-/g, '');
      }
      //Get custom worktime from Slack parameters
      if (customParameters.some((e: string) => e.includes('worktime%3D'))) {
        const customWorktime = arrToString(customParameters, 'worktime%3D');
        worktime = +customWorktime;
      }
      //Get custom starting balances from Slack parameters
      if (customParameters.some((e: string) => e.includes('balances%3D'))) {
        const customStartingBalance = arrToString(
          customParameters,
          'balances%3D'
        );
        startingBalance = +customStartingBalance;
      }
    }

    const userJSON = await fetchTeamworkData(
      `https://woolman.eu.teamwork.com/projects/api/v3/people.json?searchTerm=${email}`
    );
    const userId = userJSON.people[0].id;
    console.log(userJSON);

    const mainHoursJSON = await fetchTeamworkData(
      `https://woolman.eu.teamwork.com/time/total.json?userId=${userId}&fromDate=${fromDateStr}&toDate=${toDateStr}&projectType=all`
    );
    const mainHours = mainHoursJSON['time-totals']['total-hours-sum'];
    console.log(mainHoursJSON);

    const pastSevenDaysHours: number = await pastSevenDays(
      yesterday,
      userId,
      worktime
    );

    const days = workDays(new Date(fromDate), new Date(toDate));
    const mainHoursToCompare: number = days * worktime;

    const calculatedMinutes: number =
      mainHours - mainHoursToCompare + startingBalance;

    const total_hours: number = Math.trunc(calculatedMinutes);
    const total_left_mins: number = Math.ceil((calculatedMinutes % 1) * 60);
    const past_seven_days_h: number = Math.trunc(pastSevenDaysHours);
    const past_seven_days_left_mins: number = Math.ceil(
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Something went wrong. Make sure you typed extra parameters correctly!`,
        response_type: 'ephemeral',
      }),
    };
  }
};
//Export handler as Netlify has documented it
export { handler };
