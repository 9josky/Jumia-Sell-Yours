let productData; // Declare productData outside any function to make it accessible globally

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  // Retrieve productData once outside the loop
  productData = JSON.parse(localStorage.getItem("productData"));
  getSavedProducts(); // You don't need to pass productData as a parameter

  document.getElementById("scrapeForm").addEventListener("submit", scrapeData);
  document
    .getElementById("removeAllProducts")
    .addEventListener("click", deleteAllProducts);
}

function scrapeData(event) {
  event.preventDefault();
  var url = document.getElementById("urlInput").value;

  document.getElementById("loadingSpinner").style.display = "block";

  fetch("https://jumia-sell-yours.onrender.com/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: url }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .then((data) => {
      if (!productData) {
        productData = [];
      }

      if (productData.length < 5) {
        productData.push(data);
        localStorage.setItem("productData", JSON.stringify(productData));
      } else {
        document.getElementById("error").innerHTML =
          "Upgrade to premium, to add more than 5 products";
      }

      return getSavedProducts();
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      document.getElementById("loadingSpinner").style.display = "none";
      document.getElementById("urlInput").value = "";
    });
}

function getSavedProducts() {
  if (!productData) {
    console.error("productData is undefined");
    return;
  }

  let productList = "";

  if (productData.length > 0) {
    productData.forEach((data, index) => {
      productList += `
      <div style="display: flex; justify-content: center; align-items: center; gap: 10px; height: 60px; max-width: 100%; margin: 10px 0; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);" class="product" data-index="${index}">
      <p style="width: 80%" class="product-title" data-index="${index}">${data["Product Title"]}</p>
      <span id="deleteProduct-${index}" style='background-color: #F43661; border-radius: 10px; padding: 10px; height: 20px; color: white;'>Delete</span>
    </div>`;
    });

    document.getElementById("savedProduct").innerHTML = productList;
    document.querySelectorAll(".product-title").forEach((title, index) => {
      title.addEventListener("click", () => displayProductInfo(index));
    });

    document.getElementById("removeAllProducts").style.display =
      productData.length > 1 ? "block" : "none";
  } else {
    document.getElementById(
      "savedProduct"
    ).innerHTML = `<p>Add new products</p>`;
    document.getElementById("removeAllProducts").style.display = "none";
  }

  document
    .getElementById("savedProduct")
    .addEventListener("click", handleDeleteClick);
  // if (productData.length >= 2) {
  //   document.getElementById("removeAllProducts").innerHTML = "Remove All";
  // } else {
  //   document.getElementById("removeAllProducts").style.display = "none";
  // }
}

function handleDeleteClick(event) {
  const clickedElement = event.target;

  // Check if the click originated from a delete button
  if (clickedElement.tagName.toLowerCase() === "span") {
    // Get the parent product container
    const productContainer = clickedElement.closest(".product");

    if (productContainer) {
      // Retrieve the index from the data attribute
      const index = productContainer.getAttribute("data-index");

      if (index !== null && index !== undefined) {
        console.log("Deleting product at index:", index);
        console.log("Current productData:", productData);
        productData.splice(index, 1);

        localStorage.setItem("productData", JSON.stringify(productData));

        // Refresh the UI or do any other necessary updates
        getSavedProducts();
      } else {
        console.error("Invalid index:", index);
      }
    } else {
      console.error("Product container not found");
    }
  }
}

function displayProductInfo(index) {
  const clickedElement = event.target;

  // Check if the click originated from the title or the delete button
  if (clickedElement.classList.contains("product-title")) {
    // Code for displaying product info here
    if (index >= 0 && index < productData.length) {
      const selectedData = productData[index];
      document.getElementById("result").innerHTML = `
            <div>
            <p>Product Title:</p>
            <div id="selectedData"><textarea data-index="${index}" style='height: 40px; width: 80%'>${selectedData["Product Title"]}</textarea> <span class="copy" data-index="${index}">Copy</span></div>
            </div>
            
            <div>
            <p>Product Brand:</p>
            <div id="selectedData"><textarea data-index="${index}" style='height: 40px; width: 80%'>${selectedData["Product Brand"]}</textarea> <span class="copy" data-index="${index}">Copy</span></div>
            </div>
            
            <div>
            <p>Product Model:</p>
            <div id="selectedData"><textarea data-index="${index}" style='height: 40px; width: 80%'>${selectedData["Product Model"]}</textarea> <span class="copy" data-index="${index}">Copy</span></div>
            </div>
            
            <div>
            <p>Product Color:</p>
            <div id="selectedData"><textarea data-index="${index}" style='height: 40px; width: 80%'>${selectedData["Product Color"]}</textarea> <span class="copy" data-index="${index}">Copy</span></div>
            </div>
            
            <div>
            <p>Product Description: </p>
            <div id="selectedData"><textarea data-index="${index}" style='height: 200px; width: 80%'>${selectedData["Product Description"]}</textarea> <span class="copy" data-index="${index}">Copy</span></div>
            </div>
            
            <div>
            <p>Highlights: </p>
            <div id="selectedData"><textarea data-index="${index}" style='height: 200px; width: 80%'>${selectedData["Key Features"]}</textarea> <span class="copy" data-index="${index}">Copy</span></div>
            </div>
            
            <div>
            <p>What's in the box: </p>
            <div id="selectedData"><textarea data-index="${index}" style='height: 200px; width: 80%'>${selectedData["What's in the box"]}</textarea> <span class="copy" data-index="${index}">Copy</span></div>
            </div>
            
            <div>
            <p >Product Price: </p>
            <div id="selectedData"><textarea data-index="${index}" style='height: 40px; width: 80%'>${selectedData["Product Price"]}</textarea> <span class="copy" data-index="${index}">Copy</span></div>
            </div>
            
            <div  style="margin: 10px 0">
            <button id="closeDetails" style='background-color: #F43661; border-radius: 10px; padding: 10px; color: white; border: none; cursor: pointer;'>Close</button>
            </div>
        `;

      const closeDetailsButton = document.getElementById("closeDetails");
      if (closeDetailsButton) {
        closeDetailsButton.addEventListener("click", closeDetails);
        console.log("clicked");
      }

      document.querySelectorAll(".copy").forEach((copyButton, copyIndex) => {
        copyButton.addEventListener("click", function () {
          const dataIndex = copyIndex; // Use copyIndex to capture the correct index
          copy(dataIndex);
        });
      });
    } else {
      console.error("Invalid index or selectedData is undefined");
    }
  } else if (clickedElement.tagName.toLowerCase() === "span") {
    document.getElementById("loadingSpinner").style.display = "block";
    // Code for delete button click here
    console.log("Deleting product at index:", index);
    console.log("Current productData:", productData);
    productData.splice(index, 1);

    localStorage.setItem("productData", JSON.stringify(productData));
    document.getElementById("loadingSpinner").style.display = "none";

    // Refresh the UI or do any other necessary updates
    getSavedProducts();
  }
}

function copy(index) {
  const textarea = document.querySelectorAll("#selectedData textarea")[index];

  if (textarea) {
    navigator.clipboard
      .writeText(textarea.value)
      .then(() => {
        console.log(`Text in textarea ${index} copied to clipboard`);

        // Add the "copied" class temporarily
        textarea.classList.add("copied");
        setTimeout(() => {
          // Remove the "copied" class after a brief delay
          textarea.classList.remove("copied");
        }, 1000); // Adjust the delay as needed
      })
      .catch((err) => {
        console.error("Unable to copy text to clipboard", err);
      });
  } else {
    console.error(`Textarea with index ${index} not found`);
  }
}

function deleteAllProducts() {
  // let productData = JSON.parse(localStorage.getItem("productData"));
  document.getElementById("loadingSpinner").style.display = "block";

  if (productData.length > 0) {
    productData.length = 0;
  }

  localStorage.setItem("productData", JSON.stringify(productData));
  document.getElementById("result").innerHTML = "";
  document.getElementById("loadingSpinner").style.display = "none";
  getSavedProducts();
}

function closeDetails() {
  const resultElement = document.getElementById("result");

  if (resultElement) {
    // Set the maximum height to 0 to trigger the transition
    resultElement.style.maxHeight = "0";

    // After a short delay, remove the content and reset the max-height
    setTimeout(() => {
      resultElement.innerHTML = "";
      resultElement.style.maxHeight = null;
    }, 300); // Adjust the delay to match the transition duration
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Assuming you have a close button with the id closeButton
  const closeButton = document.getElementById("closeButton");

  if (closeButton) {
    closeButton.addEventListener("click", function () {
      // Close or hide your extension
      console.log("clicked");
      closeExtension();
    });
  }

  // Additional code for other functionality...
});

// Event listener for clicking the extension icon
chrome.action.onClicked.addListener(function (tab) {
  // Close or hide your extension
  closeExtension();
});

// Function to close or hide the extension
function closeExtension() {
  // Assuming you have a container with the ID "extensionContainer"
  const extensionContainer = document.getElementById("extensionContainer");

  // Toggle a class or set display property to "none" to hide the extension
  if (extensionContainer) {
    extensionContainer.style.display = "none"; // Assuming "hidden" is a CSS class that hides the container
    // Alternatively, you can use: extensionContainer.style.display = "none";
  }
}
