
from flask import Flask, flash, request, redirect,render_template,jsonify
import os
import uuid
import whisper

import re



model = whisper.load_model("base.en")

UPLOAD_FOLDER = 'files'
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def save_audio_file(file):
    file_name = str(uuid.uuid4()) +".wav"
    full_file_name = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
    file.save(full_file_name)
    name_only = file_name[0:(len(file_name)-4):]
    # print(name_only)
    # print(full_file_name)
    AUDIO_FILE = f'{os.getcwd()}/files/{name_only}.wav'

    print(AUDIO_FILE)

    transcribed_whisper = model.transcribe(AUDIO_FILE)

    

    return transcribed_whisper["text"],name_only


@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/save-record', methods=['POST'])
def save_record():
    # check if the post request has the file part
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    
    # Getting transcribed audio file and audio file name
    transcribed_whisper,audio_file_name = save_audio_file(file)

    print(transcribed_whisper)

    response = {"transcribed_by_whisper":transcribed_whisper}

    return jsonify(response)


# main driver function
if __name__ == '__main__':
    app.run(debug = True)