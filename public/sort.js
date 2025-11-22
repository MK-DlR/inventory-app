// public/sort.js

// wrap everything in DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  // get all radio buttons
  document.querySelectorAll('input[name="sort"]');
  // get the plant list

  // get references to all elements needed:
  // 1. all the radio buttons (name="sort")
  // 2. <ul id="plant-list"> element

  // add event listeners to all radio buttons
  // when any radio is clicked, trigger the sort function

  // create sort function that
  // figures out value of clicked radio button
  // based on value determines:
  // which data attribute to sort by
  // which direction (asc or desc)
  // grabs all li elements and converts to array
  // sorts array based on data attribute
  // clears ul and re-appends sorted li element

  // use Array.from() to convert li elements to array
  // use .localeCompare() for sorting strings
  // use - for sorting numbers
  // use new Date() to parse ISO strings to compare dates
});
