import os

from flask import Flask, render_template


def create_app(config_:str|None=None) -> Flask:
    app_ = Flask(__name__, instance_relative_config=True)
    app_.instance_path = os.path.abspath(os.path.dirname(__file__))
    if config_ is not None:
        app_.config.from_mapping(config_)
    else:
        app_.config.from_pyfile(os.path.join(app_.instance_path, 'config.py'))


    @app_.route('/')
    def hello():
        return render_template("index.html")

    return app_

