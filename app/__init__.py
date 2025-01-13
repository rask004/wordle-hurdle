import os
import pathlib
from random import choice

from flask import Flask, render_template

DATA_FOLDER = 'data'
WORDS_SOURCE_FNAME = 'words_alpha.txt'
WORDS_FILTERED_FNAME = 'words_filtered.txt'

def get_possible_words():
    wordfile = pathlib.Path(os.path.join('.', DATA_FOLDER, WORDS_FILTERED_FNAME))
    words_sourcefile = pathlib.Path(os.path.join('.', DATA_FOLDER, WORDS_SOURCE_FNAME))
    if not os.path.exists(words_sourcefile) and not os.path.exists(wordfile):
        raise RuntimeError(f"source files for wordlist are missing. The path {str(wordfile)} should exist at least.")
    if os.path.exists(wordfile):
        with open(wordfile) as fp:
            source = fp.read().split('\n')
    else:
        with open(words_sourcefile) as fp_s:
            source = [w for w in fp_s.read().split('\n') if len(w) == 5]
        with open(wordfile, 'w') as fp_t:
            fp_t.write("\n".join(source))
    return source


WORDS = get_possible_words()


def create_app(config_:str|None=None) -> Flask:
    app_ = Flask(__name__, instance_relative_config=True)
    app_.instance_path = os.path.abspath(os.path.dirname(__file__))
    if config_ is not None:
        app_.config.from_mapping(config_)
    else:
        app_.config.from_pyfile(os.path.join(app_.instance_path, 'config.py'))


    @app_.route('/')
    def index():
        return render_template("index.html")


    @app_.route('/api/request')
    def get_word():
        w = choice([w for w in WORDS])
        return {'words':[w]}


    @app_.route('/api/request/<int:c>')
    def get_many_words(c):
        if c < 1:
            return {"ERROR":f"parameter <c> for URL /api/request/<c> must be an integer > 0." }
        requested_words = []
        while len(requested_words) < c:
            w = choice([w for w in WORDS if w not in requested_words])
            requested_words.append(w)
        return {"words":requested_words}


    @app_.route('/api/request/all')
    def get_all_words():
        return {"words":[w for w in WORDS]}


    return app_
