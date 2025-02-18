import os
import requests
from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from flask_cors import CORS
from flask import send_from_directory


app = Flask(__name__)
CORS(app)  # Enable CORS for frontend interaction

# Function to collect internal links
def collect_internal_links(base_url):
    internal_links = set()
    try:
        response = requests.get(base_url)
        soup = BeautifulSoup(response.content, "html.parser")
        for link in soup.find_all("a", href=True):
            href = link["href"]
            full_url = urljoin(base_url, href)
            if urlparse(full_url).netloc == urlparse(base_url).netloc:
                internal_links.add(full_url)
    except Exception as e:
        print(f"Error collecting internal links: {str(e)}")
    return list(internal_links)

# Function to analyze SEO data
def seo_crawler(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, "html.parser")

        title = soup.title.string if soup.title else "No title found"
        description = soup.find("meta", attrs={"name": "description"})
        description = description["content"] if description else "No meta descripion found"

        headings = []
        for level in range(1, 7):
            headings.extend([h.get_text() for h in soup.find_all(f"h{level}")])

        keyword_density = len(soup.get_text().split())

        score = 100 - (20 if title == "No title found" else 0) - (30 if description == "No meta description found" else 0) - (20 if not headings else 0)

        return {"url": url, "title": title, "description": description, "headings": headings, "keyword_density": keyword_density, "score": score}
    except requests.exceptions.RequestException as e:
        return {"url": url, "error": f"Error fetching the URL: {str(e)}"}
@app.route('/')
def home():
    return send_from_directory('seo-crawler-ui/src','App.js')

@app.route('/crawl', methods=['POST'])
def crawl():
    data = request.json
    base_url = data.get('url')
    all_links = collect_internal_links(base_url)
    seo_results = [seo_crawler(link) for link in all_links]
    return jsonify({"seo_results": seo_results})

if __name__ == '__main__':
    app.run(debug=True)
