# Import framework
from flask import Flask, request
from flask import url_for
from flask_restful import Resource, Api, fields, marshal_with
from flask_socketio import SocketIO, Namespace, emit, send
from flask_cors import CORS
import json

from worker import celery
import celery.states as states

import torch

import sys
import time

from logging.config import dictConfig
import logging

logging.basicConfig(level=logging.DEBUG)
sys.stdout = sys.stderr

# Instantiate the app
app = Flask(__name__)

app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'


CORS(app, origins="http://localhost:4000", allow_headers=[
    "Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
    supports_credentials=True)
api = Api(app)
app.debug = True
async_mode = None
# socketio = SocketIO(app, async_mode='eventlet')

class Observatory(Resource):
    def get(self):
        return {
            'Galaxies': ['Milkyway', 'Andromeda', 
            'Large Magellanic Cloud (LMC)']
        }

class StyleQueue(Resource):
    def post(self):
        url_root = request.url_root
        print("this is the url root", url_root)

        script_root = request.script_root
        print("this is the script_root", script_root)

        base_url = request.base_url
        print("this is the base url", base_url)

        host_url = request.host_url
        print("this is the host url", host_url)

        data = request.get_json()
        files1 = data['files1']
        files2 = data['files2']

        print("this is files1", files1[0]['fileName'])
        print("this is files2", files2[0]['fileName'])
        # print("this is files2", files2[0])


        # file_name = files[0]['fileName']
        # file_type = files[0]['type']
        # file_size = files[0]['size']
        # file_data = files[0]['base64String']
        time_uploaded = files1[0]['timeUploaded']

        file_email = files1[0]['email']

        files = [files1, files2]

        task = celery.send_task('tasks.style', args=[files, time_uploaded, file_email], kwargs={})

        return {
            'task_id': task.id
        }

    def get(self):
        data = request.get_json()


@app.route('/result/<string:task_id>')
def check_task(task_id: str) -> str:
    # res is what you get back from task.segment
    res = celery.AsyncResult(task_id)
    if res.state == states.PENDING:
        print("this is res.stat", res.state)
        return res.state
    else:
        sep = '?'
        trunc_res = str(res.result).split(sep, 1)[0].replace(sep, "")
        return trunc_res
        # return str(res.result)


# @socketio.on('connect')
# def dataSent():
#     # socketio.emit('data update', "you are now connected")
#     print('CONNECTED!!!')

#     # i have the socket id now in sid
#     sid = request.sid
#     print("this is sid", sid)
#     # socketio.start_background_task(target=emitloop)
#     # socketio.sleep(0)
    
# @socketio.on('my event')
# def dataReceived(data):
#     print("testing my event")
#     print("this is data", data)
# #     socketio.emit('data update', 'successful my event')



# def emitloop():
#     for i in range(2,6):
#         emit('data update', i)
#         print("this is test i", i)
#         time.sleep(1)

# class ResultsNamespace(Namespace):
#     def on_connect(self):
#         print("connected")
#         pass

#     def on_disconnect(self):
#         pass

#     def on_my_event(self):
#         print("connected")
#         emit('response', "EMITTING RESPONSE")

# socketio.on_namespace(ResultsNamespace('/socket-io'))

# Create routes
# api.add_resource(Test, '/test')
api.add_resource(Observatory, '/obs')
api.add_resource(StyleQueue, '/queue')


# Run the application
if __name__ == '__main__':
    # socketio.run(app, host='0.0.0.0', port=4000, debug=True)
    app.run(host='0.0.0.0', port=4000, debug=True)