const ipc = require("electron").ipcRenderer;
var format = "HHmmssd";

//When click on the tray icon AMPM : change 12/24
ipc.on("AMPM", (event) => {
  if (format == "HHmmssd") {
    format = "hhmmssdA";
    $(".ampm").css("display", "block");
  } else {
    format = "HHmmssd";
    $(".ampm").css("display", "none");
  }
});

//JQuery
window.$ = window.jQuery = require("jquery");

//When ready send win.show()
$(document).ready(function () {
  ipc.send("ready");
});

$(function () {
  // Cache some selectors
  let clock = $("#clock"),
    ampm = clock.find(".ampm");

  // Map digits to their names (this will be an array)
  let digit_to_name = "zero one two three four five six seven eight nine".split(
    " "
  );

  // This object will hold the digit elements
  let digits = {};

  // Positions for the hours, minutes, and seconds
  let positions = ["h1", "h2", ":", "m1", "m2", ":", "s1", "s2"];

  // Generate the digits with the needed markup,
  // and add them to the clock

  let digit_holder = clock.find(".digits");

  $.each(positions, function () {
    if (this == ":") {
      digit_holder.append('<div class="dots">');
    } else {
      let pos = $("<div>");

      for (let i = 1; i < 8; i++) {
        pos.append('<span class="d' + i + '">');
      }

      // Set the digits as key:value pairs in the digits object
      digits[this] = pos;

      // Add the digit elements to the page
      digit_holder.append(pos);
    }
  });

  // Add the weekday names

  let weekday_names = "MON TUE WED THU FRI SAT SUN".split(" "),
    weekday_holder = clock.find(".weekdays");

  $.each(weekday_names, function () {
    weekday_holder.append("<span>" + this + "</span>");
  });

  let weekdays = clock.find(".weekdays span");

  // Run a timer every second and update the clock

  (function update_time() {
    // Use moment.js to output the current time as a string
    // hh is for the hours in 12-hour format,
    // mm - minutes, ss-seconds (all with leading zeroes),
    // d is for day of week and A is for AM/PM

    let now = moment().format(format);

    digits.h1.attr("class", digit_to_name[now[0]]);
    digits.h2.attr("class", digit_to_name[now[1]]);
    digits.m1.attr("class", digit_to_name[now[2]]);
    digits.m2.attr("class", digit_to_name[now[3]]);
    digits.s1.attr("class", digit_to_name[now[4]]);
    digits.s2.attr("class", digit_to_name[now[5]]);

    // The library returns Sunday as the first day of the week.
    // Stupid, I know. Lets shift all the days one position down,
    // and make Sunday last

    let dow = now[6];
    dow--;

    // Sunday!
    if (dow < 0) {
      // Make it last
      dow = 6;
    }

    // Mark the active day of the week
    weekdays.removeClass("active").eq(dow).addClass("active");

    // Set the am/pm text:
    ampm.text(now[7] + now[8]);

    let date = $(".date-text");
    date.text(moment().format("DD / MM / YY"));
    // Schedule this function to be run again in 1 sec
    setTimeout(update_time, 1000);
  })();
});
