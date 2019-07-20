import sys
sys.dont_write_bytecode = True

import os
import time
from celery import Celery
import json

import classes.segmentation_wrapper as segmentationModule
import classes.neural_style as styleModule
from utils.utils import stringToImage, toRGB, send_email, create_dir, saveImg, rescaleImg, checkGPU

import requests
import http.client

import time

CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379'),
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379')

celery = Celery('tasks', broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)


url6 = 'http://leapmind-server-04:3050/go-service/process_cache'
url9 = 'http://172.17.0.1:3050/go-service/process_cache'

img_folder = './images/'
headers = {'content-type': 'application/json'}
max_height = 600

@celery.task(name='tasks.style')
# def add(file_name, file_type, file_data, file_size, time_uploaded, hyperparameters, email):
def add(files, time_uploaded, email):
    # should also check for torch availability here
    # https://stackoverflow.com/questions/44617476/how-to-execute-celery-tasks-conditionally-python
    counter = 0
    file_paths = []
    if checkGPU(): 
        formatted_time = str(int(time_uploaded))
        print("this is formatted", formatted_time)
        
        usr_dir = img_folder + email + '/'
    
        usr_img_dir = img_folder + email + '/' + formatted_time + '/'
        usr_input_img_dir = usr_img_dir + '/input' + '/'
        usr_transfer_img_dir = usr_img_dir + '/transfer' + '/'
        usr_output_img_dir = usr_img_dir + '/output' + '/'

        for file in files:
            file_data = file[0]['base64String']
            file_type = file[0]['type']
            time_uploaded = file[0]['timeUploaded']
            file_name = file[0]['fileName']

            print("this is file_type", file_type)

            img = stringToImage(file_data, file_type)
            img = toRGB(img)

            height = img.shape[0]
            width = img.shape[1]

            # resize image if necessary
            if height > max_height:
                img = rescaleImg(img, height, width, max_height)
                height = img.shape[0]
                width = img.shape[1]

            print("this is img", img)

            # img here is a numpy array now, save it

            create_dir(img_folder)

            if counter == 0:
                print("this is input")
                print("this is filename", file_name)

                create_dir(usr_dir)
                create_dir(usr_input_img_dir)
                create_dir(usr_transfer_img_dir)
                create_dir(usr_output_img_dir)

                # save original image it its own directory
                usr_input_img = usr_img_dir + '/input' + '/' + file_name
                file_paths.append(usr_input_img)
                saveImg(img, usr_input_img)

            else:
                usr_transfer_img =  usr_transfer_img_dir = usr_img_dir + '/transfer' + '/' + file_name
                file_paths.append(usr_transfer_img)
                saveImg(img, usr_transfer_img)

            counter += 1

        # outside the for loop, compare two folders
        # compareFolders(usr_input_img_dir, usr_transfer_img_dir)

        start_time = time.clock()
        print("this is before seg model")
        print("this is file_paths", file_paths)

        st = styleModule.Style_Transfer(usr_input_img, usr_transfer_img, usr_output_img_dir)
        st.process()

        # seg_model = segmentationModule.Segmentation_Wrapper(img, hyperparameters, file_name, file_type, email, time_uploaded, usr_img_dir)
        # cache = seg_model.start()



        # end_time = time.clock() - start_time

        # headers = {'Content-type': 'application/json'}
        # params = {
        #     'cache': cache,
        #     'height': height,
        #     'width': width,
        #     'original_image': usr_original_img,
        #     'time_required': end_time,
        #     'file_name': file_name,
        #     'file_type': file_type,
        #     'file_size': file_size,
        #     'time_uploaded': time_uploaded,
        #     'hyperparameters': hyperparameters,
        #     'email': email
        # }

        # r = requests.post(url9, json=params, headers=headers)

        # link = r.content.decode("utf-8")

        # print(r.status_code)
        # print('this is response', r)
        # print("this is content", link)

        # send_email(email, link)
    
    else:
        add.apply_async(countdown=120)