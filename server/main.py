from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/scrape', methods=['POST'])
def scrape():
    url = request.json['url']
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

        data = {
            "Product Title": product_title,
            "Product Brand": product_brand,
            "Product Price": product_price,
            "Product Model": product_model,
            "Product Color": product_color,
            "Product Weight": product_weight,
            "What's in the box": whats_in_box,
            "Key Features": key_features,
            "Product Description": product_description
        }
        print("{data} data")
        return jsonify(data)

    else:
        return jsonify({"error": "Failed to fetch the page"}), 400


if __name__ == '__main__':
    app.run(debug=True, port=8000)
