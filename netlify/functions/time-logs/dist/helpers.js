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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrToString = exports.dateConvert = exports.workDays = exports.pastSevenDays = exports.fetchTeamworkData = void 0;
var node_fetch_1 = __importDefault(require("node-fetch"));
var fetchTeamworkData = function (url) {
    return __awaiter(this, void 0, void 0, function () {
        var credentials, data, dataJSON;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    credentials = "".concat(process.env.TEAMWORK_USER, ":").concat(process.env.TEAMWORK_PASS);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url, {
                            headers: {
                                Authorization: 'Basic '.concat(Buffer.from(credentials, 'utf8').toString('base64')),
                            },
                        })];
                case 1:
                    data = _a.sent();
                    return [4 /*yield*/, data.json()];
                case 2:
                    dataJSON = _a.sent();
                    return [2 /*return*/, dataJSON];
            }
        });
    });
};
exports.fetchTeamworkData = fetchTeamworkData;
var pastSevenDays = function (yesterday, userId, worktime) {
    return __awaiter(this, void 0, void 0, function () {
        var from, fromDate, fromDateStr, toDate, toDateStr, timeJSON, totalHours, days, hoursToCompare;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    from = new Date();
                    from.setDate(from.getDate() - 7);
                    fromDate = (0, exports.dateConvert)(from);
                    fromDateStr = fromDate.replace(/-/g, '');
                    toDate = (0, exports.dateConvert)(yesterday);
                    toDateStr = toDate.replace(/-/g, '');
                    return [4 /*yield*/, (0, exports.fetchTeamworkData)("https://woolman.eu.teamwork.com/time/total.json?userId=".concat(userId, "&fromDate=").concat(fromDateStr, "&toDate=").concat(toDateStr, "&projectType=all"))];
                case 1:
                    timeJSON = _a.sent();
                    totalHours = timeJSON['time-totals']['total-hours-sum'];
                    days = (0, exports.workDays)(new Date(fromDate), new Date(toDate));
                    hoursToCompare = days * worktime;
                    return [2 /*return*/, +totalHours - hoursToCompare];
            }
        });
    });
};
exports.pastSevenDays = pastSevenDays;
/**
 * Function that calculates work days for passed time
 * @param start Startig date for calculation
 * @param end End date for calculation
 * @returns
 */
var workDays = function (start, end) {
    var count = 0;
    var cur = start;
    while (cur <= end) {
        var dayOfWeek = cur.getDay();
        var isWeekend = dayOfWeek == 6 || dayOfWeek == 0;
        if (!isWeekend)
            count++;
        var nextDay = new Date(cur);
        nextDay.setDate(nextDay.getDate() + 1);
        cur = nextDay;
    }
    return count;
};
exports.workDays = workDays;
/**
 * Converst date object to a string with formating
 * @param date Date object to be converted
 * @returns Date as a string YYYY-MM--DD
 */
var dateConvert = function (date) {
    return date.toISOString().split('T')[0].toString();
};
exports.dateConvert = dateConvert;
/**
 * Function that return a tring from an array with strings we are looking for
 * @param arr array to be converted
 * @param string string to filter
 * @returns filtered string of values
 */
var arrToString = function (arr, string) {
    var filteredArr = arr.filter(function (item) { return item.includes(string); });
    var newString = filteredArr[0].replace(string, '');
    return newString;
};
exports.arrToString = arrToString;
//# sourceMappingURL=helpers.js.map