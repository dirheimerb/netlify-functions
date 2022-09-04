"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// TODO: Define event interface for handler function
var helpers_1 = require("./helpers");
//
var handler = function (event) {
    return __awaiter(this, void 0, void 0, function () {
        var yesterday, fromDate, fromDateStr, toDate, toDateStr, worktime, startingBalance, eventBodyArr, emailArr, email, textArr, customContentArr, customDateFrom, customDateTo, customWorktime, customStartingBalance, userJSON, userId, mainHoursJSON, mainHours, pastSevenDaysHours, days, mainHoursToCompare, calculatedMinutes, total_hours, total_left_mins, past_seven_days_h, past_seven_days_left_mins, totalsText, past7Days, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    console.log(event);
                    yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    fromDate = '2021-01-01';
                    fromDateStr = fromDate.replace(/-/g, '');
                    toDate = (0, helpers_1.dateConvert)(yesterday);
                    toDateStr = toDate.replace(/-/g, '');
                    worktime = 7.5;
                    startingBalance = 0;
                    eventBodyArr = event.body.split('&');
                    emailArr = eventBodyArr.filter(function (item) {
                        console.log(item);
                        item.includes('user_name');
                    });
                    email = "".concat(emailArr[0].replace('user_name=', ''), "@woolman.io");
                    textArr = eventBodyArr.filter(function (item) {
                        console.log(item);
                        item.includes('text=');
                    });
                    customContentArr = textArr[0].replace('text=', '');
                    console.log(customContentArr);
                    if (customContentArr.length > 1) {
                        customContentArr = customContentArr.split('+');
                    }
                    if (customContentArr.length > 0) {
                        //Get custom starting date from Slack parameters
                        if (customContentArr.some(function (e) { return e.includes('from%3D'); })) {
                            customDateFrom = (0, helpers_1.arrToString)(customContentArr, 'from%3D');
                            fromDate = customDateFrom;
                            fromDateStr = fromDate.replace(/-/g, '');
                        }
                        //Get custom end date from Slack parameters
                        if (customContentArr.some(function (e) { return e.includes('to%3D'); })) {
                            customDateTo = (0, helpers_1.arrToString)(customContentArr, 'to%3D');
                            toDate = customDateTo;
                            toDateStr = toDate.replace(/-/g, '');
                        }
                        //Get custom worktime from Slack parameters
                        if (customContentArr.some(function (e) { return e.includes('worktime%3D'); })) {
                            customWorktime = (0, helpers_1.arrToString)(customContentArr, 'worktime%3D');
                            worktime = +customWorktime;
                        }
                        //Get custom starting balances from Slack parameters
                        if (customContentArr.some(function (e) { return e.includes('balances%3D'); })) {
                            customStartingBalance = (0, helpers_1.arrToString)(customContentArr, 'balances%3D');
                            startingBalance = +customStartingBalance;
                        }
                    }
                    return [4 /*yield*/, (0, helpers_1.fetchTeamworkData)("https://woolman.eu.teamwork.com/projects/api/v3/people.json?searchTerm=".concat(email))];
                case 1:
                    userJSON = _a.sent();
                    userId = userJSON.people[0].id;
                    return [4 /*yield*/, (0, helpers_1.fetchTeamworkData)("https://woolman.eu.teamwork.com/time/total.json?userId=".concat(userId, "&fromDate=").concat(fromDateStr, "&toDate=").concat(toDateStr, "&projectType=all"))];
                case 2:
                    mainHoursJSON = _a.sent();
                    mainHours = mainHoursJSON['time-totals']['total-hours-sum'];
                    return [4 /*yield*/, (0, helpers_1.pastSevenDays)(yesterday, userId, worktime)];
                case 3:
                    pastSevenDaysHours = _a.sent();
                    days = (0, helpers_1.workDays)(new Date(fromDate), new Date(toDate));
                    mainHoursToCompare = days * worktime;
                    calculatedMinutes = mainHours - mainHoursToCompare + startingBalance;
                    total_hours = Math.trunc(calculatedMinutes);
                    total_left_mins = Math.ceil((calculatedMinutes % 1) * 60);
                    past_seven_days_h = Math.trunc(pastSevenDaysHours);
                    past_seven_days_left_mins = Math.ceil(((pastSevenDaysHours - past_seven_days_h) % 1) % 60);
                    totalsText = total_left_mins !== 0
                        ? "".concat(total_hours, "h ").concat(total_left_mins, "min")
                        : "".concat(total_hours, "h");
                    past7Days = past_seven_days_left_mins !== 0
                        ? "".concat(past_seven_days_h, "h ").concat(past_seven_days_left_mins, "min")
                        : "".concat(past_seven_days_h, "h");
                    return [2 /*return*/, {
                            statusCode: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                text: "Your balances are ".concat(totalsText, " from ").concat(fromDate, " to ").concat(toDate, ". From last 7 days your balances are ").concat(past7Days),
                                response_type: 'ephemeral',
                            }),
                        }];
                case 4:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [2 /*return*/, {
                            statusCode: 200,
                            body: JSON.stringify({
                                text: "Something went wrong. Make sure you typed extra parameters correctly!",
                                response_type: 'ephemeral',
                            }),
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports.handler = handler;
//# sourceMappingURL=time-logs.js.map