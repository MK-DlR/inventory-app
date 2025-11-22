// public/sort.js

// wrap everything in DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  // get all radio buttons
  const radioButtons = document.querySelectorAll('input[name="sort"]');
  // get the plant list
  const plantList = document.getElementById("plant-list");

  // add event listeners to all radio buttons
  radioButtons.forEach((button) => {
    // trigger the sort function
    button.addEventListener("change", sortPlants);
  });

  // create sort function
  function sortPlants() {
    let selectedButton = document.querySelector('input[name="sort"]:checked');
    let value = selectedButton.value; // get value string
    // split on - and destructure into two variables
    let [fieldCode, direction] = value.split("-");

    // create an object to map fieldCode to data attribute name
    const fieldMap = {
      sci: "scientific",
      com: "common",
      quant: "quantity",
      added: "created",
      edited: "updated",
    };
    const field = fieldMap[fieldCode];

    // get all <li> elements and convert to array
    const items = Array.from(plantList.querySelectorAll("li"));
    // sort array based on data attribute
    items.sort((a, b) => {
      // get data attribute values
      let aData = a.dataset[field];
      let bData = b.dataset[field];

      let result;

      // check field being sorted by
      if (field === "scientific" || field === "common") {
        // string comparison
        result = aData.localeCompare(bData);
      } else if (field === "quantity") {
        // number comparison - convert strings to numbers first
        result = Number(aData) - Number(bData);
      } else if (field === "created" || field === "updated") {
        // date comparison - convert strings to Date objects first
        result = new Date(aData) - new Date(bData);
      }

      // if descending, reverse result
      if (direction === "desc") {
        result *= -1;
      }

      return result;
    });
    // clear list
    plantList.innerHTML = "";
    // re-append items in sorted order
    items.forEach((item) => {
      plantList.appendChild(item);
    });
  }
});
