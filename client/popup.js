if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  getSavedProducts();
}

document.getElementById("scrapeForm").addEventListener("submit", scrapeData);
function scrapeData(event) {
  event.preventDefault();
  var url = document.getElementById("urlInput").value;

  fetch("http://127.0.0.1:8000/scrape", {
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
      let productData = JSON.parse(localStorage.getItem("productData"));
      // If 'productData' doesn't exist yet, create it as an empty array
      if (!productData) {
        productData = [];
      }

      // Append the new data to 'productData'
      productData.push(data);

      // Save the updated array back to localStorage
      localStorage.setItem("productData", JSON.stringify(productData));
    })
    .catch((error) => console.error("Error:", error));

  document.getElementById("urlInput").value = "";
  getSavedProducts();
}

function getSavedProducts() {
  let productData = JSON.parse(localStorage.getItem("productData"));
  console.log(productData, "productData");

  let productList = "";

  if (productData) {
    productData.forEach((data, index) => {
      productList += `
            <div class="product" id="product-${index}">
            <p class="product-title" data-index="${index}">${data["Product Title"]}</p>
            </div>`;
    });

    document.getElementById("savedProduct").innerHTML = productList;
    document.querySelectorAll(".product-title").forEach((title) => {
      title.addEventListener("click", displayProductInfo);
    });
  } else {
    document.getElementById(
      "savedProducts"
    ).innerHTML = `<p>No product data found</p>`;
  }
}

function displayProductInfo(event) {
  const index = event.target.dataset.index;
  const productData = JSON.parse(localStorage.getItem("productData"));
  const selectedData = productData[index];
  console.log({ selectedData });

  document.getElementById("result").innerHTML = `
            <p>Product Title:</p>
            <textarea style='height: 40px; width: 80%'>${selectedData["Product Title"]}</textarea> <span>Copy</span>
            <p>Product Brand:</p>
            <textarea style='height: 40px; width: 80%'>${selectedData["Product Brand"]}</textarea> <span>Copy</span>
            <p>Product Model:</p>
            <textarea style='height: 40px; width: 80%'>${selectedData["Product Model"]}</textarea> <span>Copy</span>
            <p>Product Color:</p>
            <textarea style='height: 40px; width: 80%'>${selectedData["Product Color"]}</textarea> <span>Copy</span>
            <p>Product Description: </p>
            <textarea style='height: 200px; width: 80%'>${selectedData["Product Description"]}</textarea> <span>Copy</span>
            <p>Highlights: </p>
            <textarea style='height: 200px; width: 80%'>${selectedData["Key Features"]}</textarea> <span>Copy</span>
            <p>What's in the box: </p>
            <textarea style='height: 200px; width: 80%'>${selectedData["What's in the box"]}</textarea> <span>Copy</span>
            <p >Product Price: </p>
            <textarea style='height: 40px; width: 80%'>${selectedData["Product Price"]}</textarea> <span>Copy</span>
        `;
}

document
  .getElementById("removeAllProducts")
  .addEventListener("click", deleteAllProducts);
function deleteAllProducts() {
  console.log("clicked");
  let productData = JSON.parse(localStorage.getItem("productData"));

  if (productData.length > 0) {
    productData.length = 0;
  }

  localStorage.setItem("productData", JSON.stringify(productData));
  getSavedProducts();
}
