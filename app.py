# Code by AcChosen. https://github.com/AcChosen

from flask import Flask
from views import views
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.register_blueprint(views, url_prefix="/")


if __name__== '__main__':
    load_dotenv('.env')
    app.run(debug=True, port=int(os.environ.get('CUSTOM_PORT')))