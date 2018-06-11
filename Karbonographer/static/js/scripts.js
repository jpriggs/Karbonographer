$(document).ready(function() {
  var remainingTime = "";
  var currType = "";

  //Sets initial display values in the center of the watch
  $("#digital-display").text("00:00:00");
  $("#type-display").text("timer");

  //Sanitizes user inputs into the timer fields
  $("#timer-box, #break-box").on("focus", function() {
    var currString = "";

    //Checks that every keystroke is a number, the enter key, or the backspace key
    $(this).keydown(function(e) {
      if(((e.keyCode >= 48 || e.which >= 48) && (e.keyCode <= 57 || e.which <= 57)) || ((e.keyCode >= 96 || e.which >= 96) && (e.keyCode <= 105 || e.which <= 105)) || e.keyCode === 8 || e.keyCode === 13) {
        //**ENTER KEY functionality
        if (e.keyCode === 13 || e.which === 13) {
          if (($(this).attr("id") === "timer-box" || $(this).attr("id") === "break-box") && $(this).val()) {
            var sanitizedInput = "";

            //Determines which input box was active when enter key was pressed
            if ($(this).attr("id") === "timer-box") {
              sanitizedInput = sanitizeInput($(this).val()) !== "00:00:00" ? sanitizeInput($(this).val()) : "00:10:00";
            }
            else if ($(this).attr("id") === "break-box") {
              sanitizedInput = sanitizeInput($(this).val()) !== "00:00:00" ? sanitizeInput($(this).val()) : "00:05:00";
            }
            //Displays active input box's value in its field
            $(this).val(sanitizedInput);

            //Displays the current type timer input into the clock's digital display
            if((currType === "timer" || currType === "") && $(this).attr("id") === "timer-box") {
              $("#digital-display").text(sanitizedInput);
              if (currType === "timer") {
                remainingTime = sanitizedInput;
              }
            }
            else if (currType === "break" && $(this).attr("id") === "break-box") {
              $("#digital-display").text(sanitizedInput);
              if (currType === "break") {
                remainingTime = sanitizedInput;
              }
            }
          }
          //Removes focus from the input box
          $(this).blur();
        }
      }
      else {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
      }
    });

    $(this).keyup(function(e) {
      //Formats the input to automatically add decimals HH:MM:SS
      currString = $(this).val().replace(/:/g, "").replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1:");
      $(this).val(currString);
    });
  });

  //Manages Start, Stop, and Reset button click functionality
  $("#start-stop, #reset").on("click", function(){
    var thisElement = $(this).attr("id");
    if (($(this).attr("id") === "start-stop" && $(this).find("p").text() === "Start") || $(this).attr("id") == "reset") {
      //**START CLICKED
      if ($(this).attr("id") === "start-stop") {
        //Disable input fields
        $("#timer-box").prop("disabled", true);
        $("#break-box").prop("disabled", true);
      }
      //**RESET CLICKED
      else {
        $("#timer-box").prop("disabled", false);
        $("#break-box").prop("disabled", false);
      }
      manageButtonClick(thisElement);
    }
    //**STOP CLICKED
    else {
      $("#timer-box").prop("disabled", false);
      $("#break-box").prop("disabled", false);
      $(this).find("p").text("Start");
    }
  });

  //Manages the button click animations
  $("#start-stop, #reset").mouseup(function() {
    $(this).css("box-shadow", "none");
  });
  $("#start-stop, #reset").mousedown(function() {
    $(this).css("box-shadow", "inset 1px 1px 20px 0.1px black");
  });

  //User input sanitizing prototype
  function sanitizeInput(string) {
    var inputArray = [];
    string = string.replace(/:/g, "");
    var zeroPadLength = 6 - string.length;

    //Add zeros to beginning of the string for an incomplete user input
    for (var i = 0; i < zeroPadLength; i++) {
      string = "0" + string;
    }
    var hoursString = string.slice(0, 2);
    var minutesString = string.slice(2, 4);
    var secondsString = string.slice(4, 6);

    //Converts any minutes or seconds value over 59 to 59 and sets time above 24 hours to 24 hours
    if (parseInt(hoursString) > 23) {
      string = "240000";
    }
    else if (parseInt(minutesString) > 59) {
      minutesString = "59";
      string = hoursString + minutesString + secondsString;
    }
    else if (parseInt(secondsString) > 59) {
      secondsString = "59";
      string = hoursString + minutesString + secondsString;
    }
    string = string.match(/.{2}/g).join(":");
    return string;
  }

  //Button click managing prototype
  function manageButtonClick(element) {
    //On any button press, disable buttons until animations complete
    $("#start-stop").prop("disabled", true);
    $("#reset").prop("disabled", true);
    setTimeout(function() {
      $("#start-stop").prop("disabled", false);
      $("#reset").prop("disabled", false);
    }, 1100);

    //**RESET BUTTON** functionality
    if($("#" + element).attr("id") === "reset") {
      remainingTime = "";
      currType = "";
      $("#timer-box").val("");
      $("#break-box").val("");
      $("#digital-display").text("00:00:00");
      $("#type-display").text("timer");
      $(".watch-elements").removeClass("alt-watch-elements");
      $(".main-background").removeClass("alt-background");
      $(".seconds-container").css({"transform": "rotate(0deg)"});
      $(".minutes-container").css({"transform": "rotate(0deg)"});
      $(".hours-container").css({"transform": "rotate(0deg)"});

      //Toggle button text back to "START"
      if($("#start-stop").find("p").text() === "Stop") {
        $("#start-stop").find("p").text("Start");
      }
    }
    //**START BUTTON** functionality
    if($("#" + element).attr("id") === "start-stop" && $("#start-stop").find("p").text() === "Start") {
      //Toggle start/stop button names
      $("#start-stop").find("p").text("Stop");

      var timerString = "";
      var breakString = "";
      //**PAUSED "TIMER" STATE
      if(currType === "timer") {
        if (remainingTime === $("#timer-box").val()) {
          timerString = sanitizeInput($("#timer-box").val());
        }
        else if (remainingTime === "00:00:00") {
          breakString = sanitizeInput($("#break-box").val());
          currType = "break";
          toggleColors(currType);
        }
        else {
          timerString = remainingTime;
        }
        breakString = sanitizeInput($("#break-box").val());
      }
      //**PAUSED "BREAK" STATE
      else if (currType === "break") {
        if (remainingTime === $("#break-box").val()) {
          breakString = sanitizeInput($("#break-box").val());
        }
        else if (remainingTime === "00:00:00") {
          timerString = sanitizeInput($("#timer-box").val());
          currType = "timer";
          toggleColors(currType);
        }
        else {
          breakString = remainingTime;
        }
        timerString = sanitizeInput($("#timer-box").val());
      }
      //**Initial "START" STATE
      else {
        //Sets the current input field values or default values on initial start
        timerString = sanitizeInput($("#timer-box").val() && sanitizeInput($("#timer-box").val()) !== "00:00:00" ? $("#timer-box").val() : "00:10:00");
        breakString = sanitizeInput($("#break-box").val() && sanitizeInput($("#break-box").val()) !== "00:00:00" ? $("#break-box").val() : "00:05:00");
        //Validates and sanitizes the current input values
        $("#timer-box").val(timerString);
        $("#break-box").val(breakString);
      }

      //Sets the current timer type and displays it in the watch display
      currType = currType === "" ? "timer" : currType;
      if (currType === "timer") {
        $("#digital-display").text(timerString);
      }
      else {
        $("#digital-display").text(breakString);
      }
      $("#type-display").text(currType);
      //Start's the countdown prototype
      countdownManager(timerString, breakString, currType);
    }
  }

  //Countdown timer managing prototype
  function countdownManager(timerStr, breakStr, type) {
    //Update to global variable
    var activeType = type;
    var timerArray = [];
    var breakArray = [];
    timerArray = timerStr.split(":");
    breakArray = breakStr.split(":");
    var milliValue = 1000;
    var secValue = 60 * milliValue;
    var minValue = 60 * secValue;
    var hourValue = 60 * minValue;
    var timerSecs = parseInt((timerArray[0] * minValue) + (timerArray[1] * secValue) + timerArray[2] * milliValue);
    var breakSecs = parseInt((breakArray[0] * minValue) + (breakArray[1] * secValue) + breakArray[2] * milliValue);
    var activeSecs = 0;
    var alarm = new Audio("https://freesound.org/data/previews/276/276608_4409114-lq.mp3");

    //Checks which timer type is the current one, sets the timer and hand position
    if (activeType === "timer") {
      activeSecs = timerSecs;
      if ($("#timer-box").val() === $("#digital-display").text()) {
        setClockHands(timerArray);
      }
    }
    else {
      activeSecs = breakSecs;
      if ($("#break-box").val() === $("#digital-display").text()) {
        setClockHands(breakArray);
      }
    }

    //Starts the current timer countdown
    var countdown = setInterval(function() {
      activeSecs -= 1000;

      //Checks if a timer just finished and automatically starts the next timer
      if (activeSecs < 0) {
        if (activeType === "timer" && activeSecs < 0) {
          activeType = "break";
          activeSecs = breakSecs;
          setClockHands(breakArray);
          //Prevents clock slowdown and spam of alarm sound
          if (parseInt($("#break-box").val().replace(/:/g, "")) > 4) {
            alarm.play();
          }
        }
        else if (activeType === "break" && activeSecs < 0)
        {
          activeType = "timer";
          activeSecs = timerSecs;
          setClockHands(timerArray);
          //Prevents clock slowdown and spam of alarm sound
          if (parseInt($("#timer-box").val().replace(/:/g, "")) > 4) {
            alarm.play();
          }
        }
        //Inverts the page's color on timer type change
        toggleColors(activeType);
      }

      //Calculation from seconds to HH:MM:SS for the timer display on the clock
      var hours = Math.floor((activeSecs % hourValue) / minValue);
      var minutes = Math.floor((activeSecs % minValue) / secValue);
      var seconds = Math.floor((activeSecs % secValue) / milliValue);
      hours = ("0" + hours).slice(-2);
      minutes = ("0" + minutes).slice(-2);
      seconds = ("0" + seconds).slice(-2);
      remainingTime = (hours + ":" + minutes + ":" + seconds);

      //Move hands on each interval
      var hourDegree = (((parseInt(hours) / 12) * 360) + ((parseInt(minutes) / 12) * 6));
      var hourRotate = "rotate(" + hourDegree + "deg)";
      var minDegree = (((parseInt(minutes) / 60) * 360) + ((parseInt(seconds) / 60) * 6));
      var minRotate = "rotate(" + minDegree + "deg)";
      var secDegree = (parseInt(seconds) * 6);
      var secRotate = "rotate(" + secDegree + "deg)";

      $(".hours-container").css({"-webkit-transform": hourRotate, "-moz-transform": hourRotate, "-ms-transform": hourRotate, "-o-transform": hourRotate, "transform": hourRotate});
      $(".minutes-container").css({"-webkit-transform": minRotate, "-moz-transform": minRotate, "-ms-transform": minRotate, "-o-transform": minRotate, "transform": minRotate});
      $(".seconds-container").css({"-webkit-transform": secRotate, "-moz-transform": secRotate, "-ms-transform": secRotate, "-o-transform": secRotate, "transform": secRotate});

      //Stop the timer on any button press
      $("#start-stop, #reset").on("click", function() {
        clearInterval(countdown);
        if ($(this).attr("id") === "start-stop") {
          currType = activeType;
        }
      });

      //Displays the current countdown value in the center watch display
      if (activeSecs >= 0) {
        $("#digital-display").text(hours + ":" + minutes + ":" + seconds);
      }
    }, 1000);
  }
});

//Changes the page's color scheme
function toggleColors(timerType) {
  $(".watch-elements").toggleClass("alt-watch-elements");
  $(".main-background").toggleClass("alt-background");
  $("#type-display").fadeOut("slow", function() {
    $("#type-display").fadeIn(500).text(timerType);
  });
}

//Start of clock's hand animation prototype
function setClockHands(timerArr) {
  var tickDegree = 6;
  var totalDegree = 360;
  var secsPerFullRotation = 60;
  var hoursPerFullRotation = 12;
  var hourPosition = parseInt(timerArr[0]);
  var minPosition = parseInt(timerArr[1]);
  var secPosition = parseInt(timerArr[2]);

  //Offset hands to match animation delay and digital display timing
  if (secPosition === 0) {
    secPosition = 59;
    minPosition -= 1;
  }
  else {
    secPosition -= 1;
  }
  var hourTransform = (((hourPosition / hoursPerFullRotation) * totalDegree) + ((minPosition / hoursPerFullRotation) * tickDegree));
  var minTransform = (((minPosition / secsPerFullRotation) * totalDegree) + ((secPosition / secsPerFullRotation) * tickDegree));
  var secTransform = (secPosition * tickDegree);
  var hand = {
    "hours-container": hourTransform,
    "minutes-container": minTransform,
    "seconds-container": secTransform
  };

  //Iterate on each hand container animating the initial starting rotation
  for (var [key, value] of Object.entries(hand)) {
    var setAnimation = document.getElementById(key).animate([
      // keyframes
      {transform: "rotateZ(0deg)"},
      {transform: "rotateZ(" + value + "deg)"}
    ], {
      // timing options
      duration: 1000,
      iterations: 1
    });
  }
  //After animation, sets the starting position for the hand
  var hRotate = "rotate(" + hourTransform + "deg)";
  var mRotate = "rotate(" + minTransform + "deg)";
  var sRotate = "rotate(" + secTransform + "deg)";
  $(".hours-container").css({"-webkit-transform": hRotate, "-moz-transform": hRotate, "-ms-transform": hRotate, "-o-transform": hRotate, "transform": hRotate});
  $(".minutes-container").css({"-webkit-transform": mRotate, "-moz-transform": mRotate, "-ms-transform": mRotate, "-o-transform": mRotate, "transform": mRotate});
  $(".seconds-container").css({"-webkit-transform": sRotate, "-moz-transform": sRotate, "-ms-transform": sRotate, "-o-transform": sRotate, "transform": sRotate});
}
