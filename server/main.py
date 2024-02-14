from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Define a folder to store downloaded images
DOWNLOAD_FOLDER = 'downloaded_images'
app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER


def download_image(image_url, image_name):
    response = requests.get(image_url)
    if response.status_code == 200:
        image_path = os.path.join(app.config['DOWNLOAD_FOLDER'], image_name)
        with open(image_path, 'wb') as image_file:
            image_file.write(response.content)
        return image_path
    else:
        return None


@app.route('/scrape', methods=['POST'])
def scrape():
    print("Scrape request received")
    url = request.json['url']
    download_images = request.json.get('download_images', False)
    response = requests.get(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        product_title = soup.find('h1', class_='-fs20 -pts -pbxs').text
        brand = soup.find_all('a', class_='_more')
        product_brand = brand[1].text
        spec_list = soup.find('ul', class_='-pvs -mvxs -phm -lsn')

        if spec_list:
            specifications = spec_list.find_all('li')

            # Extract product model, weight, and color
            product_model = product_color = product_weight = "Not found"

            for spec in specifications:
                span = spec.find('span', class_='-b')
                if span:
                    label = span.text.strip()
                    if label == 'Model':
                        product_model = spec.text.split(': ')[1]
                    elif label == 'Color':
                        product_color = spec.text.split(': ')[1]
                    elif label == 'Weight (kg)':
                        product_weight = spec.text.split(': ')[1]
        product_price = soup.find(
            'span', class_='-b -ltr -tal -fs24 -prxs').text
        product_description = soup.find(
            'div', class_='markup -mhm -pvl -oxa -sc').text
        features = soup.find_all('div', class_='markup -pam')
        key_features = features[0].text
        # whats_in_box = features[1].text
        if len(features) > 1:
            whats_in_box = features[1].text
        else:
            whats_in_box = "Not found"

        sldr_div = soup.find('div', class_='sldr')
        if sldr_div:
            image_urls = [a['href']
                          for a in sldr_div.find_all('a', class_='itm')]

            # Check if the 'download_images' checkbox is selected

        data = {
            "Product Title": product_title,
            "Product Brand": product_brand,
            "Product Price": product_price,
            "Product Model": product_model,
            "Product Color": product_color,
            "Product Weight": product_weight,
            "What's in the box": whats_in_box,
            "Key Features": key_features,
            "Product Description": product_description,
            "Product Image URLs": image_urls if not download_images else None,
            "Download Images": download_images,
        }
        print("{data} data")

        if download_images:
            for i, image_url in enumerate(image_urls):
                # You can generate a unique name
                image_name = f'{data["Product Title"]}_{i + 1}.jpg'
                image_path = download_image(image_url, image_name)
                if image_path:
                    data[f"Downloaded Image Path {i + 1}"] = image_path

        return jsonify(data)

    else:
        return jsonify({"error": "Failed to fetch the page"}), 400


if __name__ == '__main__':
    os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=8000)
