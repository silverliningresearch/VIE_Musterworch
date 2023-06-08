/************************************/
function CalculateAirportAirLineReport() {
  prepareInterviewData();
  CalculateDOOP(); //add DOOP to quota list

  var daily_plan_data_temp;
  var other_dest_completed = 0;
  daily_plan_data_temp = [];
  daily_plan_data_temp.length = 0;
  
  total_completed = 0;
  total_quota_completed = 0;

  //special for VIE
  for (i = 0; i < interview_data.length; i++) {
    total_completed++;
    var found = false;

    for (j = 0; j < quota_data.length; j++) {
      if (quota_data[j].Flight_To.toUpperCase() == interview_data[i].Flight_To.toUpperCase()) 
      { 
        found = true;
      }
    }

    if (!found) other_dest_completed++;
  }
  
  for (i = 0; i < quota_data.length; i++) {
    row = quota_data[i];
    row.Completed = 0;
    for (j = 0; j < interview_data.length; j++) {
      if (row.Flight_To.toUpperCase() == interview_data[j].Flight_To.toUpperCase()) 
      { 
        row.Completed++;
      }
    }

    row.Difference = row.Completed -  row.Quota;
    row.Difference_percent =(100*(row.Difference/row.Quota)).toFixed(1);
    row.Prioritisation_score = row.Difference_percent*row.Difference/100;

    row.Completed_percent =(100*(row.Completed/row.Quota)).toFixed(0);
        
    if ( row.Difference > 0) { //over quota
      total_quota_completed = total_quota_completed +row.Quota*1;
    }
    else { //<= 0
      if (row.Completed) {
        total_quota_completed = total_quota_completed + row.Completed*1;
      }
    }

    if (row.Flight_To.toUpperCase() =="_OTHER")
    {
      row.Completed = other_dest_completed;
    }
  }

  for (i = 0; i < daily_plan_data.length; i++) {//Flight_To_report.length;
    row = daily_plan_data[i];
    for (j = 0; j < quota_data.length; j++) {
      if (row.Flight_To.toUpperCase() == quota_data[j].Flight_To.toUpperCase()) 
      {
        if ( quota_data[j].Difference < 0) {
          row.doop = quota_data[j].doop;
          row.remaining_flights = quota_data[j].remaining_flights;
          row.Completed = quota_data[j].Completed;
          row.Difference = quota_data[j].Difference;
          row.Difference_percent = quota_data[j].Difference_percent;
          row.Completed_percent = quota_data[j].Completed_percent;
          row.Prioritisation_score = quota_data[j].Prioritisation_score;
          daily_plan_data_temp.push(row);
        }
      }
    }  
  }

  total_completed_percent = (100*(total_completed/total_quota)).toFixed(0);   
  daily_plan_data = [];
  daily_plan_data.length = 0;

 //sort decending
  daily_plan_data_temp.sort(function(a, b) {
    return parseFloat(b.Prioritisation_score) - parseFloat(a.Prioritisation_score);
  });

  for (i = 0; i < daily_plan_data_temp.length; i++) {
    row = daily_plan_data_temp[i];
    row.Priority = 0;
    daily_plan_data.push(row);
    if((i< daily_plan_data_temp.length*0.25 ) || (row.remaining_flights<5))
    {
      row.Priority = 1;
    }
  }
}

function getDOOP(date) //"07-02-2023"
{
  var parts = date.split("-")
  var day = parts[0];
  var Month = parts[1];
  var Year = parts[2];

  const d = new Date();
  d.setDate(day);
  d.setMonth(Month-1); //month start from 0
  d.setYear(Year);

  return d.getDay(); //Sun: 0; Sat: 6
}

function isNotThePastDate(date) //"07-02-2023"
{
  var current_day_of_month =  new Date().getDate();
  var current_month =  new Date().getMonth()+1;

  var parts = date.split("-")
  var flight_day = parseInt(parts[0]);
  var Month = parseInt(parts[1]);
  
  var result = ((flight_day >= current_day_of_month) || (Month>current_month));
  //console.log("flight_day", date);
  //console.log("current_day_of_month", current_day_of_month);
  return (result);
}

function CalculateDOOP() {
  for (var i = 0; i < quota_data.length; i++) {
    quota_data[i].doop = " ";
    quota_data[i].remaining_flights = 0;
    var mon =0;
    var tue =0;
    var wed =0;
    var thu =0;
    var fri =0;
    var sat =0;
    var sun =0;

    var remaining_flights = 0;
    for (var j = 0; j < this_month_flight_list.length; j++) {
      if (quota_data[i].Flight_To.toUpperCase() == this_month_flight_list[j].Flight_To.toUpperCase()) 
      {
        //get remaining_flights
        if (isNotThePastDate(this_month_flight_list[j].Date)) {
          remaining_flights++;
        }

        if ('KL1724-AMS' == quota_data[i].Flight_To.toUpperCase())
        {
          console.log("KL1724-AMS	:", this_month_flight_list[j] )
        }
        switch (getDOOP( this_month_flight_list[j].Date)) {
          case 0:
            sun = "7";
            break;
          case 1:
            mon = "1";
            break;
          case 2:
            tue = "2";
            break;
          case 3:
            wed = "3";
            break;
          case 4:
            thu = "4";
            break;
          case 5:
            fri = "5";
            break;
          case 6:
            sat = "6";
            break;
          default:
            break;
        }
      }
    }
    quota_data[i].doop =[mon, tue, wed, thu, fri, sat, sun].join('');
    quota_data[i].remaining_flights = remaining_flights;
  }
}

function CalculateLessFlights() {
  //Special for BRU
  less_than_2_flights_list = [];
  less_than_2_flights_list.length = 0;
  less_than_6_flights_list = [];
  less_than_6_flights_list.length = 0;
 
  for (var i = 0; i < quota_data.length; i++) {
    var quota = quota_data[i];
    if (quota.remaining_flights<6) {

      for (var j = 0; j < this_month_flight_list.length; j++) {
        if (quota.Flight_To.toUpperCase() == this_month_flight_list[j].Flight_To.toUpperCase()) 
        {
          if (quota.Difference < 0) {
            row = this_month_flight_list[j];
            row.remaining_flights  = quota.remaining_flights;
            row.Quota = quota.Quota;
            row.Completed = quota.Completed;
            row.Difference = quota.Difference;
            row.Completed_percent = quota.Completed_percent;

            less_than_6_flights_list.push(row);

            if (quota.remaining_flights<2) {
              less_than_2_flights_list.push(row);
            }
          }
        }
      }
    }
  }
  //console.log("less_than_2_flights_list: ", less_than_2_flights_list);
}
